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
    const { date, startTime, duration } = req.body;

    // Verify required fields
    if (!date || !startTime || !duration) {
      return res.status(400).json({ error: 'Missing required fields: date, startTime, duration' });
    }

    // Environment check with detailed logging
    console.log('🔍 Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    // EMERGENCY FALLBACK - Use hardcoded credentials if env vars missing
    let conflictCheck;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Environment variables missing - using emergency fallback');
      
      // Emergency hardcoded conflict detection
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = 'https://nzpreqgasitmuqwnjoga.supabase.co';
      const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHJlcWdhc2l0bXVxd25qb2dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk1ODAwMSwiZXhwIjoyMDY5NTM0MDAxfQ.wBRQVLcMmh44oelhyeWGnIRfxOYLQPXRf8sajhrcx_s';
      
      const emergencySupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // Emergency conflict check logic
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = startTimeMinutes + (duration * 60);

      const { data: existingBookings, error } = await emergencySupabase
        .from('bookings')
        .select('start_time, duration, name, email')
        .eq('date', date)
        .eq('status', 'confirmed');

      console.log(`🚨 EMERGENCY CHECK: Found ${existingBookings?.length || 0} bookings for ${date}`);

      if (error) throw error;

      for (const booking of existingBookings || []) {
        const timeParts = booking.start_time.split(':');
        const existingStartMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1] || 0);
        const existingEndMinutes = existingStartMinutes + (booking.duration * 60);
        
        if ((startTimeMinutes < existingEndMinutes) && (endTimeMinutes > existingStartMinutes)) {
          console.log('🚫 EMERGENCY CONFLICT DETECTED!');
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
        console.log('✅ EMERGENCY CHECK: No conflicts');
      }
      
    } else {
      // Normal flow with environment variables
      console.log(`🔍 Normal conflict check: ${date} at ${startTime} for ${duration}h`);
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
      
      return res.json({
        available: false,
        message: `Time slot unavailable. There's an existing booking from ${conflictTime} to ${conflictEndTime}.`,
        conflictDetails: {
          existingBookingStart: conflictTime,
          existingBookingEnd: conflictEndTime
        }
      });
    }

    return res.json({
      available: true,
      message: 'Time slot is available for booking'
    });
    
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ 
      error: 'Failed to check availability', 
      details: error.message 
    });
  }
}