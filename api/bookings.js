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

    // Verify required fields
    if (!name || !email || !phone || !date || !startTime || !duration || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify Razorpay signature
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

    // Forward the booking data to the Railway backend
    const backendUrl = process.env.BACKEND_URL || 'https://studio-booking-system-production.up.railway.app';
    
    console.log('Forwarding booking to backend:', backendUrl);
    
    const response = await fetch(`${backendUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend booking creation failed:', response.status, errorData);
      return res.status(500).json({ 
        error: 'Failed to create booking',
        details: errorData
      });
    }

    const bookingData = await response.json();
    res.json(bookingData);
    
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create booking', 
      details: error.message 
    });
  }
}