import { db, initializeDB } from '../_db.js';

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
    // Initialize database
    await initializeDB();
    
    db.all("SELECT * FROM coupons", (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        message: 'Debug: All coupons in database',
        coupons: rows,
        count: rows.length 
      });
    });
  } catch (error) {
    console.error('Debug coupons error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}