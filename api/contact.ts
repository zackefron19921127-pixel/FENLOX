export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};
  
  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: 'Name, email, and message are required' 
    });
  }

  // Generate simple ID
  const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  console.log('Contact submission:', { id, name, email });

  return res.status(201).json({ 
    message: 'Contact submission received successfully',
    id: id,
    timestamp: new Date().toISOString()
  });
}