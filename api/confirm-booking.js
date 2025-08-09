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
      bookingIds,
      bookingGroupId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    console.log('Confirming booking payment:', {
      bookingIds,
      bookingGroupId,
      razorpayOrderId,
      razorpayPaymentId,
      hasSignature: !!razorpaySignature
    });

    // Verify required fields
    if (!bookingIds || !razorpayOrderId || !razorpayPaymentId) {
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

    // Use hardcoded credentials directly
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = 'https://nzpreqgasitmuqwnjoga.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHJlcWdhc2l0bXVxd25qb2dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk1ODAwMSwiZXhwIjoyMDY5NTM0MDAxfQ.wBRQVLcMmh44oelhyeWGnIRfxOYLQPXRf8sajhrcx_s';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Update booking status to confirmed
    const updateData = {
      status: 'confirmed',
      payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      confirmed_at: new Date().toISOString()
    };

    // Update all bookings in the group
    const { data: updatedBookings, error } = await supabase
      .from('bookings')
      .update(updateData)
      .in('id', bookingIds)
      .eq('status', 'pending') // Only update pending bookings
      .select();

    if (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }

    if (!updatedBookings || updatedBookings.length === 0) {
      throw new Error('No pending bookings found to confirm');
    }

    console.log(`Confirmed ${updatedBookings.length} booking(s)`);

    // Get full booking details for response
    const { data: confirmedBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .in('id', bookingIds);

    if (fetchError) {
      console.error('Error fetching confirmed bookings:', fetchError);
    }

    res.json({
      success: true,
      message: `${updatedBookings.length} booking(s) confirmed successfully`,
      bookings: confirmedBookings || updatedBookings,
      paymentId: razorpayPaymentId
    });
    
  } catch (error) {
    console.error('Booking confirmation error:', error);
    res.status(500).json({ 
      error: 'Failed to confirm booking', 
      details: error.message 
    });
  }
}