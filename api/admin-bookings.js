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
    
    // Get all bookings
    db.all("SELECT * FROM bookings ORDER BY createdAt DESC", (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Format the response for better readability
      const formattedBookings = rows.map(booking => ({
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: booking.date,
        startTime: booking.startTime,
        duration: booking.duration,
        totalAmount: booking.totalAmount,
        originalAmount: booking.originalAmount,
        discountAmount: booking.discountAmount,
        couponCode: booking.couponCode,
        status: booking.status,
        paymentId: booking.razorpayPaymentId,
        bookedAt: booking.createdAt
      }));
      
      res.json({
        total: rows.length,
        bookings: formattedBookings
      });
    });
  } catch (error) {
    console.error('Admin bookings fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}