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
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    // Log incoming request for debugging
    console.log('Booking request received:', {
      name, email, phone, date, startTime, duration,
      razorpayOrderId, razorpayPaymentId,
      hasSignature: !!razorpaySignature
    });

    // Verify required fields
    if (!name || !email || !phone || !date || !startTime || !duration || !razorpayOrderId || !razorpayPaymentId) {
      console.error('Missing required fields:', { name, email, phone, date, startTime, duration, razorpayOrderId, razorpayPaymentId });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Environment check - CRITICAL for conflict detection
    console.log('📋 Booking request environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    // Check for booking conflicts BEFORE processing payment - EMERGENCY FALLBACK
    try {
      console.log(`🔍 CRITICAL CONFLICT CHECK: ${date} at ${startTime} for ${duration}h`);
      
      let conflictCheck;
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Environment variables missing - using EMERGENCY hardcoded fallback');
        
        // EMERGENCY HARDCODED CONFLICT DETECTION
        const { createClient } = require('@supabase/supabase-js');
        const supabaseUrl = 'https://nzpreqgasitmuqwnjoga.supabase.co';
        const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHJlcWdhc2l0bXVxd25qb2dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk1ODAwMSwiZXhwIjoyMDY5NTM0MDAxfQ.wBRQVLcMmh44oelhyeWGnIRfxOYLQPXRf8sajhrcx_s';
        
        const emergencySupabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        });

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = startTimeMinutes + (duration * 60);

        const { data: existingBookings, error } = await emergencySupabase
          .from('bookings')
          .select('start_time, duration, name, email')
          .eq('date', date)
          .eq('status', 'confirmed');

        console.log(`🚨 EMERGENCY BOOKING CHECK: Found ${existingBookings?.length || 0} bookings for ${date}`);
        if (existingBookings) {
          existingBookings.forEach(b => console.log(`  - ${b.name}: ${b.start_time} (${b.duration}h)`));
        }

        if (error) throw error;

        for (const booking of existingBookings || []) {
          const timeParts = booking.start_time.split(':');
          const existingStartMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1] || 0);
          const existingEndMinutes = existingStartMinutes + (booking.duration * 60);
          
          console.log(`🔍 EMERGENCY: ${startTimeMinutes}-${endTimeMinutes} vs ${existingStartMinutes}-${existingEndMinutes} (${booking.name})`);
          
          if ((startTimeMinutes < existingEndMinutes) && (endTimeMinutes > existingStartMinutes)) {
            console.log('🚫 EMERGENCY BOOKING CONFLICT DETECTED!');
            conflictCheck = {
              hasConflict: true,
              conflictingBooking: {
                startTime: booking.start_time,
                duration: booking.duration
              }
            };
            break;
          }
        }
        
        if (!conflictCheck) {
          conflictCheck = { hasConflict: false };
          console.log('✅ EMERGENCY BOOKING CHECK: No conflicts');
        }
        
      } else {
        // Normal flow
        const { bookingHelpers } = require('../lib/supabase.js');
        conflictCheck = await bookingHelpers.checkBookingConflict(date, startTime, duration);
      }
      
      if (conflictCheck.hasConflict) {
        const conflictTime = conflictCheck.conflictingBooking.startTime;
        const conflictDuration = conflictCheck.conflictingBooking.duration;
        
        // Properly calculate end time
        const [startHour, startMinute] = conflictTime.split(':').map(Number);
        const endTotalMinutes = (startHour * 60 + startMinute) + (conflictDuration * 60);
        const endHour = Math.floor(endTotalMinutes / 60);
        const endMinute = endTotalMinutes % 60;
        const conflictEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        console.log('Booking conflict detected:', {
          requestedDate: date,
          requestedTime: startTime,
          requestedDuration: duration,
          conflictingTime: conflictTime,
          conflictingDuration: conflictDuration,
          conflictingEndTime: conflictEndTime
        });
        
        return res.status(409).json({ 
          error: 'Time slot unavailable',
          message: `This time slot is already booked. There's an existing booking from ${conflictTime} to ${conflictEndTime}. Please choose a different time.`,
          conflictDetails: {
            existingBookingStart: conflictTime,
            existingBookingEnd: conflictEndTime
          }
        });
      }
    } catch (conflictError) {
      console.error('❌ CRITICAL ERROR in conflict detection:', conflictError);
      console.error('Stack:', conflictError.stack);
      
      // DO NOT continue with booking if conflict check fails - this is unsafe!
      // Return error instead to prevent double bookings
      return res.status(500).json({
        error: 'Booking validation failed',
        message: 'Unable to verify time slot availability. Please try again or contact support.',
        details: 'Conflict detection system error'
      });
    }

    // Verify Razorpay signature for security
    if (razorpaySignature && process.env.RAZORPAY_KEY_SECRET) {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');
      
      if (razorpaySignature !== expectedSignature) {
        return res.status(400).json({ 
          error: 'Payment verification failed - invalid signature'
        });
      }
    }

    // Format booking details
    const bookingDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
    
    const bookingTime = startTime;
    // Properly calculate end time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const endTotalMinutes = (startHour * 60 + startMinute) + (duration * 60);
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    // Create booking confirmation data
    const bookingConfirmation = {
      id: `NIYAT${Date.now()}`,
      name,
      email,
      phone,
      date: bookingDate, // Formatted date for display
      originalDate: date, // Original date for database
      startTime,
      endTime,
      duration: duration, // Keep as number for database
      durationText: `${duration} hour${duration > 1 ? 's' : ''}`, // For display
      originalAmount,
      discountAmount: discountAmount || 0,
      totalAmount,
      couponCode: couponCode || null,
      paymentId: razorpayPaymentId,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Save booking to storage
    const { saveBooking } = require('../lib/bookings-storage');
    const savedBooking = await saveBooking(bookingConfirmation);
    
    // Log booking for debugging (in production, you might want to send this to an email service)
    console.log('Booking confirmed:', JSON.stringify(savedBooking, null, 2));
    
    // Return success response
    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: bookingConfirmation,
      instructions: {
        studio: 'Niyat Studios',
        address: 'Chittaranjan Park, New Delhi',
        contact: 'Please save this confirmation for your records',
        note: 'You will receive a WhatsApp/email confirmation shortly'
      }
    });
    
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create booking', 
      details: error.message 
    });
  }
}