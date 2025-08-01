export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Basic environment check
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    };

    console.log('🔧 System check requested:', envCheck);

    if (req.method === 'POST') {
      // Test conflict detection with provided data
      const { date, startTime, duration } = req.body;
      
      if (!envCheck.hasSupabaseUrl || !envCheck.hasServiceKey) {
        return res.json({
          status: 'ERROR',
          message: 'Environment variables missing',
          envCheck,
          conflictTest: 'SKIPPED - Missing credentials'
        });
      }

      try {
        const { bookingHelpers } = require('../lib/supabase.js');
        const conflictResult = await bookingHelpers.checkBookingConflict(date, startTime, duration);
        
        return res.json({
          status: 'SUCCESS',
          message: 'System working correctly',
          envCheck,
          conflictTest: {
            input: { date, startTime, duration },
            result: conflictResult,
            diagnosis: conflictResult.hasConflict ? 'CONFLICT DETECTED ✅' : 'NO CONFLICT ✅'
          }
        });
        
      } catch (error) {
        return res.json({
          status: 'ERROR', 
          message: 'Conflict detection failed',
          envCheck,
          conflictTest: {
            input: { date, startTime, duration },
            error: error.message,
            diagnosis: 'SYSTEM ERROR ❌'
          }
        });
      }
    }

    // GET request - just return environment status
    return res.json({
      status: envCheck.hasSupabaseUrl && envCheck.hasServiceKey ? 'SUCCESS' : 'ERROR',
      message: 'System status check',
      envCheck,
      instructions: 'Send POST with {date, startTime, duration} to test conflict detection'
    });

  } catch (error) {
    console.error('System check error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'System check failed',
      error: error.message
    });
  }
}