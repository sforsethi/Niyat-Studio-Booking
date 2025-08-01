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

    // Check for booking conflicts
    const { bookingHelpers } = require('../lib/supabase.js');
    const conflictCheck = await bookingHelpers.checkBookingConflict(date, startTime, duration);
    
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