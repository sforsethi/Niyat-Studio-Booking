const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { google } = require('googleapis');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./bookings.db');

// Create bookings table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    startTime TEXT NOT NULL,
    duration INTEGER NOT NULL,
    totalAmount INTEGER NOT NULL,
    razorpayOrderId TEXT,
    razorpayPaymentId TEXT,
    status TEXT DEFAULT 'pending',
    googleEventId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
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

// Get available time slots
app.get('/api/availability/:date', async (req, res) => {
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
app.post('/api/create-order', async (req, res) => {
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
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      date,
      startTime,
      duration,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    const totalAmount = duration * 1150; // ₹1150 per hour

    // Verify payment (you should implement proper signature verification)
    // For now, we'll assume payment is verified if payment ID is provided
    if (!razorpayPaymentId) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Insert booking into database
    db.run(
      `INSERT INTO bookings (name, email, phone, date, startTime, duration, totalAmount, razorpayOrderId, razorpayPaymentId, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, date, startTime, duration, totalAmount, razorpayOrderId, razorpayPaymentId, 'confirmed'],
      function(err) {
        if (err) {
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
    res.status(500).json({ error: 'Server error' });
  }
});

// Get booking details
app.get('/api/bookings/:id', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});