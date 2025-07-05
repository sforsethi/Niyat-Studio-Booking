export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle both GET and POST
  if (req.method === 'GET') {
    return res.json({ 
      message: 'Test endpoint is working!',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    const { code, amount } = req.body;
    
    if (!code || !amount) {
      return res.status(400).json({ error: 'Coupon code and amount are required' });
    }
    
    // Simple 15% coupon validation
    if (code.toUpperCase() === 'STUDIO15') {
      if (amount < 1000) {
        return res.json({
          valid: false,
          error: 'Minimum booking amount ₹1000 required'
        });
      }
      
      const discount = Math.floor(amount * 0.15);
      return res.json({
        valid: true,
        coupon: {
          code: 'STUDIO15',
          description: '15% discount on studio bookings',
          discountType: 'percentage',
          discountValue: 15
        },
        originalAmount: amount,
        discountAmount: discount,
        finalAmount: amount - discount
      });
    }
    
    return res.json({
      valid: false,
      error: 'Invalid coupon code'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}