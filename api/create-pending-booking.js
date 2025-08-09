export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone,
      date,
      startTime,
      duration,
      couponCode,
      originalAmount,
      discountAmount,
      totalAmount,
      isRecurring,
      recurringData
    } = req.body;

    console.log('Creating pending booking:', {
      name, email, phone, date, startTime, duration,
      isRecurring: !!isRecurring,
      recurringDatesCount: recurringData?.selectedDates?.length || 0
    });

    // Verify required fields
    if (!name || !email || !phone || !date || !startTime || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for booking conflicts BEFORE creating pending booking
    const datesToCheck = isRecurring && recurringData?.selectedDates ? recurringData.selectedDates : [date];
    
    // Use hardcoded credentials directly
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = 'https://nzpreqgasitmuqwnjoga.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHJlcWdhc2l0bXVxd25qb2dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk1ODAwMSwiZXhwIjoyMDY5NTM0MDAxfQ.wBRQVLcMmh44oelhyeWGnIRfxOYLQPXRf8sajhrcx_s';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check for conflicts
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = startTimeMinutes + (duration * 60);

    for (const checkDate of datesToCheck) {
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('start_time, duration, name, status')
        .eq('date', checkDate)
        .in('status', ['confirmed', 'pending']); // Check both confirmed and pending bookings

      if (error) {
        console.error('Error checking conflicts:', error);
        throw error;
      }

      for (const booking of existingBookings || []) {
        const timeParts = booking.start_time.split(':');
        const existingStartMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1] || 0);
        const existingEndMinutes = existingStartMinutes + (booking.duration * 60);
        
        if ((startTimeMinutes < existingEndMinutes) && (endTimeMinutes > existingStartMinutes)) {
          return res.status(409).json({ 
            error: 'Time slot unavailable',
            message: `This time slot is already booked on ${checkDate}.`
          });
        }
      }
    }

    // Create pending bookings
    const pendingBookings = [];
    const bookingGroupId = isRecurring ? `RG${Date.now()}` : null;
    
    if (isRecurring && recurringData?.selectedDates?.length > 0) {
      // Create multiple pending bookings for recurring
      for (let i = 0; i < recurringData.selectedDates.length; i++) {
        const recurringDate = recurringData.selectedDates[i];
        const bookingId = `NIYAT${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
        
        const bookingData = {
          id: bookingId,
          name,
          email,
          phone,
          date: recurringDate,
          start_time: startTime,
          duration: duration,
          total_amount: totalAmount / recurringData.selectedDates.length,
          original_amount: (originalAmount || totalAmount) / recurringData.selectedDates.length,
          discount_amount: (discountAmount || 0) / recurringData.selectedDates.length,
          coupon_code: couponCode || null,
          status: 'pending',
          is_recurring: true,
          recurring_group_id: bookingGroupId,
          recurring_frequency: recurringData.frequency,
          recurring_session_number: i + 1,
          recurring_total_sessions: recurringData.selectedDates.length,
          created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('bookings')
          .insert([bookingData])
          .select()
          .single();
          
        if (error) {
          console.error('Error creating pending booking:', error);
          throw error;
        }
        
        pendingBookings.push(data);
      }
    } else {
      // Single booking
      const bookingId = `NIYAT${Date.now()}`;
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          id: bookingId,
          name,
          email,
          phone,
          date,
          start_time: startTime,
          duration: duration,
          total_amount: totalAmount,
          original_amount: originalAmount || totalAmount,
          discount_amount: discountAmount || 0,
          coupon_code: couponCode || null,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating pending booking:', error);
        throw error;
      }
      
      pendingBookings.push(data);
    }

    console.log(`Created ${pendingBookings.length} pending booking(s)`);

    res.json({
      success: true,
      bookingIds: pendingBookings.map(b => b.id),
      bookingGroupId: bookingGroupId,
      message: 'Pending booking created successfully'
    });
    
  } catch (error) {
    console.error('Pending booking creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create pending booking', 
      details: error.message 
    });
  }
}