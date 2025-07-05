import { db, initializeDB } from './_db.js';

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
    // Initialize database
    await initializeDB();
    
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

    const baseAmount = duration * 1150; // ₹1150 per hour
    const finalOriginalAmount = originalAmount || baseAmount;
    const finalDiscountAmount = discountAmount || 0;
    const finalTotalAmount = totalAmount || baseAmount;

    // Check for double booking conflicts
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = startHour + duration;
    
    // Check for existing bookings that would conflict
    const checkConflict = new Promise((resolve, reject) => {
      db.all(
        'SELECT startTime, duration FROM bookings WHERE date = ? AND status = "confirmed"',
        [date],
        (err, existingBookings) => {
          if (err) {
            reject(err);
            return;
          }
          
          const hasConflict = existingBookings.some(booking => {
            const existingStart = parseInt(booking.startTime.split(':')[0]);
            const existingEnd = existingStart + booking.duration;
            
            // Check if new booking overlaps with existing booking
            return (startHour < existingEnd && endHour > existingStart);
          });
          
          resolve(hasConflict);
        }
      );
    });

    const hasConflict = await checkConflict;
    if (hasConflict) {
      return res.status(409).json({ 
        success: false,
        error: 'Time slot conflict detected. This time is already booked. Please select a different time.',
        conflictDetails: `${startTime} - ${endHour}:00 on ${date}`
      });
    }

    // Verify payment
    if (!razorpayPaymentId || !razorpayOrderId) {
      return res.status(400).json({ error: 'Payment verification failed - missing payment details' });
    }

    // Update coupon usage if coupon was used
    if (couponCode && finalDiscountAmount > 0) {
      db.run(
        'UPDATE coupons SET usedCount = usedCount + 1 WHERE code = ?',
        [couponCode.toUpperCase()]
      );
    }

    // Insert booking into database
    db.run(
      `INSERT INTO bookings (name, email, phone, date, startTime, duration, totalAmount, originalAmount, discountAmount, couponCode, razorpayOrderId, razorpayPaymentId, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, date, startTime, duration, finalTotalAmount, finalOriginalAmount, finalDiscountAmount, couponCode || null, razorpayOrderId, razorpayPaymentId, 'confirmed'],
      function(err) {
        if (err) {
          console.error('Database error creating booking:', err);
          return res.status(500).json({ error: 'Failed to create booking' });
        }

        const bookingId = this.lastID;

        res.json({
          success: true,
          bookingId,
          message: 'Booking confirmed successfully'
        });
      }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
}