const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { google } = require('googleapis');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('/tmp/bookings.db');

// Create tables
db.serialize(() => {
  // Create bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    startTime TEXT NOT NULL,
    duration INTEGER NOT NULL,
    totalAmount INTEGER NOT NULL,
    originalAmount INTEGER NOT NULL,
    discountAmount INTEGER DEFAULT 0,
    couponCode TEXT,
    razorpayOrderId TEXT,
    razorpayPaymentId TEXT,
    status TEXT DEFAULT 'pending',
    googleEventId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create coupons table
  db.run(`CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    discountType TEXT NOT NULL CHECK(discountType IN ('percentage', 'fixed')),
    discountValue INTEGER NOT NULL,
    minAmount INTEGER DEFAULT 0,
    maxDiscount INTEGER,
    usageLimit INTEGER,
    usedCount INTEGER DEFAULT 0,
    validFrom DATETIME DEFAULT CURRENT_TIMESTAMP,
    validUntil DATETIME,
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert GAURAV-NIYAT coupon only
  db.run(`INSERT OR IGNORE INTO coupons (code, description, discountType, discountValue, minAmount, maxDiscount, usageLimit, validUntil) VALUES 
    ('GAURAV-NIYAT', 'Special VIP discount for Gaurav', 'percentage', 18, 500, 1000, 50, '2025-12-31 23:59:59')`);
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Google Calendar setup
const calendar = google.calendar('v3');
let googleAuth;

if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  googleAuth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar']
  );
}

// Routes

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Studio Booking API is running!' });
});

// Admin route to view all coupons
app.get('/admin/coupons', (req, res) => {
  db.all("SELECT * FROM coupons ORDER BY createdAt DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ coupons: rows });
  });
});

// Admin route to view all bookings
app.get('/admin/bookings', (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY createdAt DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
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
      status: booking.status,
      paymentId: booking.razorpayPaymentId,
      bookedAt: booking.createdAt
    }));
    
    res.json({
      total: rows.length,
      bookings: formattedBookings
    });
  });
});

// Validate coupon code
app.post('/validate-coupon', async (req, res) => {
  try {
    const { code, amount } = req.body;
    
    if (!code || !amount) {
      return res.status(400).json({ error: 'Coupon code and amount are required' });
    }

    // Find the coupon
    db.get(
      `SELECT * FROM coupons WHERE code = ? AND isActive = 1`,
      [code.toUpperCase()],
      (err, coupon) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!coupon) {
          return res.json({ 
            valid: false, 
            error: 'Invalid coupon code' 
          });
        }

        // Check if coupon is expired
        if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
          return res.json({ 
            valid: false, 
            error: 'Coupon has expired' 
          });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.json({ 
            valid: false, 
            error: 'Coupon usage limit reached' 
          });
        }

        // Check minimum amount
        if (amount < coupon.minAmount) {
          return res.json({ 
            valid: false, 
            error: `Minimum booking amount ₹${coupon.minAmount} required` 
          });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.floor((amount * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }

        const finalAmount = amount - discountAmount;

        res.json({
          valid: true,
          coupon: {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
          },
          originalAmount: amount,
          discountAmount,
          finalAmount
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available time slots
app.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const startTime = new Date(date + 'T00:00:00Z');
    const endTime = new Date(date + 'T23:59:59Z');

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
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Razorpay order
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Create booking
app.post('/bookings', async (req, res) => {
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

    try {
      const hasConflict = await checkConflict;
      if (hasConflict) {
        return res.status(409).json({ 
          success: false,
          error: 'Time slot conflict detected. This time is already booked. Please select a different time.',
          conflictDetails: `${startTime} - ${endHour}:00 on ${date}`
        });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to check booking conflicts' });
    }

    // Verify payment
    if (!razorpayPaymentId || !razorpayOrderId) {
      return res.status(400).json({ error: 'Payment verification failed - missing payment details' });
    }

    // Verify Razorpay signature for security
    if (razorpaySignature) {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');
      
      // Log signature verification for debugging
      console.log('Payment signature verified successfully');
      
      if (razorpaySignature !== expectedSignature) {
        return res.status(400).json({ 
          error: 'Payment verification failed - invalid signature',
          debug: {
            provided: razorpaySignature,
            expected: expectedSignature
          }
        });
      }
    } else {
      console.log('Warning: No signature provided - skipping signature verification');
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

        // Create Google Calendar event
        if (googleAuth) {
          createGoogleCalendarEvent({
            name,
            email,
            date,
            startTime,
            duration,
            bookingId
          });
        }

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
});

// Get booking details
app.get('/bookings/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, booking) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  });
});

// Create Google Calendar event
async function createGoogleCalendarEvent(bookingData) {
  if (!googleAuth) return;

  try {
    const { name, email, date, startTime, duration } = bookingData;
    
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 60 * 1000));

    const event = {
      summary: `Studio Booking - ${name}`,
      description: `Studio booking for ${name} (${email})`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: [
        { email: email }
      ],
    };

    const response = await calendar.events.insert({
      auth: googleAuth,
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      resource: event,
    });

    console.log('Google Calendar event created:', response.data.id);
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
  }
}

// Export for Vercel
module.exports = app;