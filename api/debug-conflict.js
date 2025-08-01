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
    const { date, startTime, duration } = req.body;
    
    console.log('🔧 DEBUG CONFLICT ENDPOINT CALLED');
    console.log('Request body:', { date, startTime, duration });
    
    // Environment check
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'MISSING'
    };
    
    console.log('Environment check:', envCheck);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: 'Environment variables missing',
        envCheck,
        message: 'This is why conflict detection fails!'
      });
    }

    // Test conflict detection
    const { bookingHelpers } = require('../lib/supabase.js');
    
    console.log('📞 Calling bookingHelpers.checkBookingConflict...');
    const conflictResult = await bookingHelpers.checkBookingConflict(date, startTime, duration);
    
    console.log('🔍 Conflict result:', conflictResult);

    return res.json({
      success: true,
      testInput: { date, startTime, duration },
      envCheck,
      conflictResult,
      message: conflictResult.hasConflict ? 'CONFLICT DETECTED ❌' : 'NO CONFLICT ✅',
      diagnosis: conflictResult.hasConflict ? 
        'Conflict detection is working correctly' : 
        'Either no conflicts exist OR there is a bug in the logic'
    });
    
  } catch (error) {
    console.error('Debug conflict error:', error);
    return res.status(500).json({ 
      error: 'Debug failed', 
      details: error.message,
      stack: error.stack
    });
  }
}