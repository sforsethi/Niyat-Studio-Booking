export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingHelpers } = require('../lib/supabase.js');
    
    console.log('Testing July 31st 10:00 AM conflict detection...');
    
    // Test the exact scenario
    const result = await bookingHelpers.checkBookingConflict('2025-07-31', '10:00', 2);
    
    console.log('Conflict check result:', result);

    res.json({
      success: true,
      testScenario: {
        date: '2025-07-31',
        startTime: '10:00', 
        duration: 2,
        description: 'Testing 10:00 AM for 2 hours on July 31st'
      },
      conflictResult: result,
      message: result.hasConflict ? 'CONFLICT DETECTED ❌' : 'NO CONFLICT - BUG! ⚠️'
    });
    
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    });
  }
}