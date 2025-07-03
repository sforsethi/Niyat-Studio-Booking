export default function handler(req, res) {
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
    const { code, amount } = req.body;
    
    if (!code || !amount) {
      return res.status(400).json({ error: 'Coupon code and amount are required' });
    }

    // Hard-coded coupon validation (no database)
    if (code.toUpperCase() === 'GAURAV-NIYAT') {
      const discountAmount = Math.floor((amount * 18) / 100);
      const maxDiscount = 1000;
      const finalDiscount = discountAmount > maxDiscount ? maxDiscount : discountAmount;
      
      if (amount < 500) {
        return res.json({ 
          valid: false, 
          error: 'Minimum booking amount ₹500 required' 
        });
      }

      return res.json({
        valid: true,
        coupon: {
          code: 'GAURAV-NIYAT',
          description: 'Special VIP discount for Gaurav',
          discountType: 'percentage',
          discountValue: 18
        },
        originalAmount: amount,
        discountAmount: finalDiscount,
        finalAmount: amount - finalDiscount
      });
    }

    return res.json({ 
      valid: false, 
      error: 'Invalid coupon code' 
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}