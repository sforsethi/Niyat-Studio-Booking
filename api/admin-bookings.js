export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, return mock data since you don't have a database on Vercel
    // In production, you'd connect to your database here
    const mockBookings = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '12:00',
        totalAmount: 2000,
        status: 'confirmed',
        paymentId: 'pay_123456',
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      total: mockBookings.length,
      bookings: mockBookings
    });
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
}