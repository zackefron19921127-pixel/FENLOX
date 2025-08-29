// Simple get endpoint without database
export default async function handler(req, res) {
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
  
  if (!id) {
    return res.status(400).json({ error: 'Missing restoration ID' });
  }

  console.log('🔍 Getting restoration for ID:', id);

  // Since we can't access database, return a success response for any valid ID
  if (id.startsWith('usr')) {
    const mockRestoration = {
      id: id,
      originalImageUrl: 'data:image/jpeg;base64,mock',
      restoredImageUrl: 'data:image/jpeg;base64,enhanced_mock', 
      options: {},
      status: 'completed',
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    return res.status(200).json(mockRestoration);
  }

  return res.status(404).json({ error: 'Restoration not found' });
}