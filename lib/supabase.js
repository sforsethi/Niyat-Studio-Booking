const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase credentials
const supabaseUrl = 'https://nzpreqgasitmuqwnjoga.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHJlcWdhc2l0bXVxd25qb2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTgwMDEsImV4cCI6MjA2OTUzNDAwMX0.rXtkmPaXSDpou2Tx9YTMN0kHECMO5xXbD9s4YJlOvKE';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHJlcWdhc2l0bXVxd25qb2dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk1ODAwMSwiZXhwIjoyMDY5NTM0MDAxfQ.wBRQVLcMmh44oelhyeWGnIRfxOYLQPXRf8sajhrcx_s';

// Debug logging for deployment issues
console.log('Supabase Environment Check:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING'
});

// No validation needed - using hardcoded credentials

// Create client for browser/frontend
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create client for server/backend with elevated privileges
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper functions for bookings
const bookingHelpers = {
  async saveBooking(booking) {
    // Convert formatted date back to ISO format for database
    let dbDate;
    if (booking.originalDate) {
      // Use original date if available
      dbDate = booking.originalDate;
    } else {
      // Try to parse the formatted date
      dbDate = new Date(booking.date).toISOString().split('T')[0];
    }

    // Extract numeric duration from string like "2 hours"
    let numericDuration = booking.duration;
    if (typeof booking.duration === 'string') {
      numericDuration = parseInt(booking.duration.split(' ')[0]);
    }

    // CRITICAL: Final conflict check right before insertion to prevent race conditions
    const finalConflictCheck = await this.checkBookingConflict(
      dbDate, 
      booking.startTime, 
      numericDuration
    );
    
    if (finalConflictCheck.hasConflict) {
      const conflictTime = finalConflictCheck.conflictingBooking.startTime;
      const conflictDuration = finalConflictCheck.conflictingBooking.duration;
      throw new Error(`RACE CONDITION PREVENTED: Time slot ${booking.startTime} on ${dbDate} was just booked by another user (conflict: ${conflictTime} for ${conflictDuration}h). Please select a different time.`);
    }

    console.log('Attempting Supabase insert with data:', {
      id: booking.id,
      name: booking.name,
      email: booking.email,
      date: dbDate,
      start_time: booking.startTime,
      duration: numericDuration,
      total_amount: booking.totalAmount
    });

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([{
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: dbDate,
        start_time: booking.startTime,
        duration: numericDuration,
        total_amount: booking.totalAmount,
        original_amount: booking.originalAmount,
        discount_amount: booking.discountAmount || 0,
        coupon_code: booking.couponCode,
        status: booking.status || 'confirmed',
        payment_id: booking.paymentId,
        razorpay_order_id: booking.razorpayOrderId,
        // Recurring booking fields
        is_recurring: booking.isRecurring || false,
        recurring_group_id: booking.recurringGroupId || null,
        recurring_frequency: booking.recurringFrequency || null,
        recurring_session_number: booking.recurringSessionNumber || null,
        recurring_total_sessions: booking.recurringTotalSessions || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Full error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('Supabase insert successful:', data);
    return data;
  },

  async getBookings() {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('booked_at', { ascending: false });

    if (error) throw error;
    
    // Transform data to match existing format
    return data.map(booking => ({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      startTime: booking.start_time,
      duration: booking.duration,
      totalAmount: booking.total_amount,
      originalAmount: booking.original_amount,
      discountAmount: booking.discount_amount,
      couponCode: booking.coupon_code,
      status: booking.status,
      paymentId: booking.payment_id,
      bookedAt: booking.booked_at
    }));
  },

  async getBookingById(id) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async checkBookingConflict(date, startTime, duration) {
    console.log(`🔍 Conflict check requested: ${date} at ${startTime} for ${duration}h`);
    
    // Convert start time to minutes for easier calculation
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = startTimeMinutes + (duration * 60);

    console.log(`⏰ Requested slot: ${startTimeMinutes}-${endTimeMinutes} minutes (${Math.floor(startTimeMinutes/60)}:${(startTimeMinutes%60).toString().padStart(2,'0')}-${Math.floor(endTimeMinutes/60)}:${(endTimeMinutes%60).toString().padStart(2,'0')})`);

    // Get all confirmed bookings for the same date
    const { data: existingBookings, error } = await supabaseAdmin
      .from('bookings')
      .select('start_time, duration, name, email')
      .eq('date', date)
      .eq('status', 'confirmed');

    if (error) {
      console.error('❌ Database error checking booking conflicts:', error);
      throw error;
    }

    console.log(`📋 Found ${existingBookings.length} confirmed bookings for ${date}:`, existingBookings.map(b => `${b.name}(${b.start_time}-${b.duration}h)`).join(', '));

    // Check for time conflicts
    for (const booking of existingBookings) {
      // Handle both "10:00" and "10:00:00" formats
      const timeParts = booking.start_time.split(':');
      const existingHour = parseInt(timeParts[0]);
      const existingMinute = parseInt(timeParts[1]);
      const existingStartMinutes = existingHour * 60 + existingMinute;
      const existingEndMinutes = existingStartMinutes + (booking.duration * 60);

      // Check if times overlap using interval intersection logic
      const hasOverlap = (startTimeMinutes < existingEndMinutes) && (endTimeMinutes > existingStartMinutes);
      
      if (hasOverlap) {
        console.log('🚫 CONFLICT DETECTED:', {
          requestedTime: `${startTime} (${duration}h)`,
          conflictingTime: `${booking.start_time} (${booking.duration}h)`,
          conflictingBooking: booking.name,
          date: date
        });
        return {
          hasConflict: true,
          conflictingBooking: {
            startTime: booking.start_time,
            duration: booking.duration
          }
        };
      }
    }

    console.log('✅ No conflicts found - booking slot is available');
    return { hasConflict: false };
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  bookingHelpers
};