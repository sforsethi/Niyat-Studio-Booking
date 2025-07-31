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
    console.log('Debug input:', { date, startTime, duration });

    const { supabaseAdmin } = require('../lib/supabase.js');
    
    // Get ALL bookings to see what's in the database
    const { data: allBookings, error: allError } = await supabaseAdmin
      .from('bookings')
      .select('*');
    
    console.log('All bookings in database:', allBookings);
    
    // Get bookings for the specific date
    const { data: dateBookings, error: dateError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('date', date);
    
    console.log('Bookings for date', date, ':', dateBookings);
    
    // Get confirmed bookings for the specific date
    const { data: confirmedBookings, error: confirmedError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('date', date)
      .eq('status', 'confirmed');
    
    console.log('Confirmed bookings for date', date, ':', confirmedBookings);

    res.json({
      success: true,
      input: { date, startTime, duration },
      allBookings: allBookings || [],
      dateBookings: dateBookings || [], 
      confirmedBookings: confirmedBookings || [],
      errors: {
        allError: allError?.message,
        dateError: dateError?.message,
        confirmedError: confirmedError?.message
      }
    });
    
  } catch (error) {
    console.error('Debug availability error:', error);
    res.status(500).json({ 
      error: 'Debug failed', 
      details: error.message 
    });
  }
}