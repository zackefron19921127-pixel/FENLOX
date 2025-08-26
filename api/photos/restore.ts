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

  // Generate unique ID
  const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  // Create restoration record
  const restoration = {
    id: id,
    originalImageUrl: '/uploads/demo-' + Date.now() + '.jpg',
    options: {},
    status: 'processing',
    createdAt: new Date().toISOString(),
  };

  console.log('Photo restoration request:', id);

  return res.status(201).json(restoration);
}