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
    const { bookingHelpers } = require('../lib/supabase.js');
    
    // Test 1: Check conflict with existing test booking (2025-02-01, 14:00, 2 hours)
    console.log('Testing conflict detection...');
    
    const test1 = await bookingHelpers.checkBookingConflict('2025-02-01', '14:00', 2);
    console.log('Test 1 - Same time slot:', test1);
    
    const test2 = await bookingHelpers.checkBookingConflict('2025-02-01', '15:00', 2);
    console.log('Test 2 - Overlapping time:', test2);
    
    const test3 = await bookingHelpers.checkBookingConflict('2025-02-01', '16:30', 2);
    console.log('Test 3 - Available time:', test3);
    
    const test4 = await bookingHelpers.checkBookingConflict('2025-02-01', '12:00', 1);
    console.log('Test 4 - Available earlier time:', test4);
    
    res.json({
      success: true,
      message: 'Conflict detection tests completed',
      tests: {
        sameTimeSlot: test1,
        overlappingTime: test2,
        availableTime: test3,
        availableEarlierTime: test4
      }
    });
    
  } catch (error) {
    console.error('Conflict test error:', error);
    res.status(500).json({ 
      error: 'Conflict test failed', 
      details: error.message 
    });
  }
}