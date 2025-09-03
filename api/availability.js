export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Import Supabase helpers
    const { supabaseAdmin } = require('../lib/supabase.js');

    // Generate all possible slots (9 AM to 9 PM, 1-hour slots)
    const allSlots = [];
    for (let hour = 9; hour <= 20; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      allSlots.push(timeSlot);
    }

    // Get all confirmed bookings for the specified date
    const { data: existingBookings, error } = await supabaseAdmin
      .from('bookings')
      .select('start_time, duration')
      .eq('date', date)
      .eq('status', 'confirmed');

    if (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }

    console.log(`📋 Found ${existingBookings.length} confirmed bookings for ${date}`);

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      const slotHour = parseInt(slot.split(':')[0]);
      
      // Check if this slot conflicts with any existing booking
      for (const booking of existingBookings) {
        const bookingStartHour = parseInt(booking.start_time.split(':')[0]);
        const bookingEndHour = bookingStartHour + booking.duration;
        
        // If the slot falls within an existing booking's time range, it's not available
        if (slotHour >= bookingStartHour && slotHour < bookingEndHour) {
          return false;
        }
      }
      
      return true;
    });

    console.log(`✅ Returning ${availableSlots.length} available slots out of ${allSlots.length} total`);

    res.json({ availableSlots });
    
  } catch (error) {
    console.error('Availability fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch availability', 
      details: error.message 
    });
  }
}