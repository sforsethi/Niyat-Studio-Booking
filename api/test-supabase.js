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
    console.log('Testing Supabase connection...');
    
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Environment check:', { hasUrl, hasAnonKey, hasServiceKey });
    
    // Test connection
    const { bookingHelpers } = require('../lib/supabase.js');
    
    // Try to fetch existing bookings
    const bookings = await bookingHelpers.getBookings();
    console.log('Fetched bookings:', bookings.length);
    
    // Create a test booking (won't affect real data)
    const testBooking = {
      id: `TEST${Date.now()}`,
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      originalDate: '2025-02-01', // ISO format
      date: 'Saturday, February 1, 2025', // Display format
      startTime: '14:00',
      duration: 2, // Number, not string
      totalAmount: 1000,
      originalAmount: 1200,
      discountAmount: 200,
      couponCode: 'TEST',
      paymentId: 'test_payment_id',
      status: 'confirmed'
    };
    
    console.log('Attempting to save test booking...');
    const savedBooking = await bookingHelpers.saveBooking(testBooking);
    console.log('Test booking saved:', savedBooking);
    
    // Fetch bookings again to confirm it was saved
    const updatedBookings = await bookingHelpers.getBookings();
    console.log('Updated bookings count:', updatedBookings.length);
    
    res.json({
      success: true,
      message: 'Supabase connection test successful',
      environment: { hasUrl, hasAnonKey, hasServiceKey },
      bookingsCount: updatedBookings.length,
      testBookingId: savedBooking.id,
      allBookings: updatedBookings
    });
    
  } catch (error) {
    console.error('Supabase test error:', error);
    res.status(500).json({ 
      error: 'Supabase test failed', 
      details: error.message,
      stack: error.stack
    });
  }
}