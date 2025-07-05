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
    const { amount, currency = 'INR' } = req.body;
    
    // Mock order creation (since we don't have Razorpay keys in serverless)
    const order = {
      id: `order_${Date.now()}`,
      amount: amount * 100, // Convert to paise
      currency: currency,
      status: 'created',
      receipt: `receipt_${Date.now()}`
    };

    res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}