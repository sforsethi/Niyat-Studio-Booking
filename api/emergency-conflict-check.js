const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
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

    console.log('🚨 EMERGENCY CONFLICT CHECK:', { date, startTime, duration });

    // HARDCODED CREDENTIALS - EMERGENCY FIX
    const supabaseUrl = 'https://nzpreqgasitmuqwnjoga.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHJlcWdhc2l0bXVxd25qb2dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk1ODAwMSwiZXhwIjoyMDY5NTM0MDAxfQ.wBRQVLcMmh44oelhyeWGnIRfxOYLQPXRf8sajhrcx_s';

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Convert time to minutes
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = startTimeMinutes + (duration * 60);

    console.log(`⏰ Checking: ${startTimeMinutes}-${endTimeMinutes} minutes (${startHour}:${startMinute.toString().padStart(2,'0')}-${Math.floor(endTimeMinutes/60)}:${(endTimeMinutes%60).toString().padStart(2,'0')})`);

    // Get all confirmed bookings for the date
    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select('start_time, duration, name, email, status')
      .eq('date', date)
      .eq('status', 'confirmed');

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log(`📋 Found ${existingBookings.length} confirmed bookings:`, existingBookings);

    // Check for conflicts
    for (const booking of existingBookings) {
      const timeParts = booking.start_time.split(':');
      const existingHour = parseInt(timeParts[0]);
      const existingMinute = parseInt(timeParts[1] || 0);
      const existingStartMinutes = existingHour * 60 + existingMinute;
      const existingEndMinutes = existingStartMinutes + (booking.duration * 60);

      console.log(`🔍 Checking vs ${booking.name}: ${existingStartMinutes}-${existingEndMinutes} minutes`);

      // Overlap check
      const hasOverlap = (startTimeMinutes < existingEndMinutes) && (endTimeMinutes > existingStartMinutes);
      
      console.log(`  Overlap? ${startTimeMinutes} < ${existingEndMinutes} && ${endTimeMinutes} > ${existingStartMinutes} = ${hasOverlap}`);

      if (hasOverlap) {
        console.log('🚫 CONFLICT DETECTED!');
        return res.json({
          available: false,
          hasConflict: true,
          message: `CONFLICT: Existing booking by ${booking.name} from ${booking.start_time}`,
          conflictingBooking: booking
        });
      }
    }

    console.log('✅ No conflicts found');
    return res.json({
      available: true,
      hasConflict: false,
      message: 'Time slot available',
      bookingsChecked: existingBookings.length
    });

  } catch (error) {
    console.error('Emergency conflict check error:', error);
    return res.status(500).json({
      available: false,
      error: 'Conflict check failed',
      details: error.message
    });
  }
}