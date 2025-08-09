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
    // Use hardcoded credentials directly
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = 'https://nzpreqgasitmuqwnjoga.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHJlcWdhc2l0bXVxd25qb2dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk1ODAwMSwiZXhwIjoyMDY5NTM0MDAxfQ.wBRQVLcMmh44oelhyeWGnIRfxOYLQPXRf8sajhrcx_s';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Delete pending bookings older than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: deletedBookings, error } = await supabase
      .from('bookings')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', thirtyMinutesAgo)
      .select();

    if (error) {
      console.error('Error cleaning up pending bookings:', error);
      throw error;
    }

    console.log(`Cleaned up ${deletedBookings?.length || 0} abandoned bookings`);

    res.json({
      success: true,
      message: `Cleaned up ${deletedBookings?.length || 0} abandoned bookings`,
      deletedCount: deletedBookings?.length || 0
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      error: 'Failed to cleanup bookings', 
      details: error.message 
    });
  }
}