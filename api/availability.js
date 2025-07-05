export default function handler(req, res) {
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

  // Generate available slots (9 AM to 9 PM, 1-hour slots)
  const availableSlots = [];
  for (let hour = 9; hour <= 20; hour++) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    availableSlots.push(timeSlot);
  }

  res.json({ availableSlots });
}