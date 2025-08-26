import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid restoration ID' });
    }

    // Mock restoration data for demo
    const restoration = {
      id,
      originalImageUrl: `/uploads/demo-${Date.now()}.jpg`,
      options: {},
      status: 'completed' as const,
      restoredImageUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=AI+Restored+Photo',
      createdAt: new Date(),
      completedAt: new Date(),
    };

    return res.json(restoration);
  } catch (error) {
    console.error('Get restoration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}