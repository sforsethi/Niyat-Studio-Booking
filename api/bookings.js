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

    // Verify Razorpay signature for security
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

    // Format booking details
    const bookingDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
    
    const bookingTime = startTime;
    const endTime = `${parseInt(startTime.split(':')[0]) + duration}:00`;
    
    // Create booking confirmation data
    const bookingConfirmation = {
      id: `NIYAT${Date.now()}`,
      name,
      email,
      phone,
      date: bookingDate,
      startTime,
      endTime,
      duration: `${duration} hour${duration > 1 ? 's' : ''}`,
      originalAmount,
      discountAmount: discountAmount || 0,
      totalAmount,
      couponCode: couponCode || null,
      paymentId: razorpayPaymentId,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Log booking for debugging (in production, you might want to send this to an email service)
    console.log('Booking confirmed:', JSON.stringify(bookingConfirmation, null, 2));
    
    // Return success response
    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: bookingConfirmation,
      instructions: {
        studio: 'Niyat Studios',
        address: 'Chittaranjan Park, New Delhi',
        contact: 'Please save this confirmation for your records',
        note: 'You will receive a WhatsApp/email confirmation shortly'
      }
    });
    
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create booking', 
      details: error.message 
    });
  }
}