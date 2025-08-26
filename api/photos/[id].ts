export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid restoration ID' });
  }

  // Simple mock restoration data
  const restoration = {
    id: id,
    originalImageUrl: '/uploads/demo-' + Date.now() + '.jpg',
    options: {},
    status: 'completed',
    restoredImageUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=AI+Restored+Photo',
    createdAt: new Date(Date.now() - 30000).toISOString(),
    completedAt: new Date().toISOString()
  };

  console.log('Get restoration request:', id);

  return res.json(restoration);
}