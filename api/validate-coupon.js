import { db, initializeDB } from './_db.js';

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
    // Initialize database
    await initializeDB();
    
    const { code, amount } = req.body;
    
    if (!code || !amount) {
      return res.status(400).json({ error: 'Coupon code and amount are required' });
    }

    // Find the coupon
    db.get(
      `SELECT * FROM coupons WHERE code = ? AND isActive = 1`,
      [code.toUpperCase()],
      (err, coupon) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!coupon) {
          return res.json({ 
            valid: false, 
            error: 'Invalid coupon code' 
          });
        }

        // Check if coupon is expired
        if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
          return res.json({ 
            valid: false, 
            error: 'Coupon has expired' 
          });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.json({ 
            valid: false, 
            error: 'Coupon usage limit reached' 
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
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.floor((amount * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
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
      }
    );
  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}