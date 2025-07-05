import { db, initializeDB } from '../_db.js';

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
    // Initialize database
    await initializeDB();
    
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Get existing bookings for the date
    db.all(
      'SELECT startTime, duration FROM bookings WHERE date = ? AND status = "confirmed"',
      [date],
      (err, bookings) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Generate available slots (9 AM to 9 PM, 1-hour slots)
        const availableSlots = [];
        for (let hour = 9; hour <= 20; hour++) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          const isBooked = bookings.some(booking => {
            const bookingStart = parseInt(booking.startTime.split(':')[0]);
            const bookingEnd = bookingStart + booking.duration;
            return hour >= bookingStart && hour < bookingEnd;
          });
          
          if (!isBooked) {
            availableSlots.push(timeSlot);
          }
        }

        res.json({ availableSlots });
      }
    );
  } catch (error) {
    console.error('Availability fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}