export default function handler(req, res) {
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
    const { code, amount } = req.body;
    
    if (!code || !amount) {
      return res.status(400).json({ error: 'Coupon code and amount are required' });
    }

    // Hard-coded coupon validation (reliable for production)
    const coupons = {
      'STUDIO15': {
        code: 'STUDIO15',
        description: '15% discount on studio bookings',
        discountType: 'percentage',
        discountValue: 15,
        minAmount: 1000,
        maxDiscount: null
      },
      'DISCOUNT15': {
        code: 'DISCOUNT15', 
        description: '15% discount on studio bookings',
        discountType: 'percentage',
        discountValue: 15,
        minAmount: 1000,
        maxDiscount: null
      },
      'GAURAV-NIYAT': {
        code: 'GAURAV-NIYAT',
        description: 'Special VIP discount for Gaurav',
        discountType: 'percentage', 
        discountValue: 18,
        minAmount: 500,
        maxDiscount: 1000
      }
    };

    const coupon = coupons[code.toUpperCase()];
    
    if (!coupon) {
      return res.json({ 
        valid: false, 
        error: 'Invalid coupon code' 
      });
    }

    // Check minimum amount
    if (amount < coupon.minAmount) {
      return res.json({ 
        valid: false, 
        error: `Minimum booking amount ₹${coupon.minAmount} required` 
      });
    }

    // Calculate discount
    let discountAmount = Math.floor((amount * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    const finalAmount = amount - discountAmount;

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      originalAmount: amount,
      discountAmount,
      finalAmount
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}