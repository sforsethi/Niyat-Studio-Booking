export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ 
    message: 'Simple test API working!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}