import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid restoration ID' });
      return;
    }

    const restoration = await storage.getPhotoRestoration(id);
    
    if (!restoration) {
      res.status(404).json({ error: 'Restoration not found' });
      return;
    }

    res.json(restoration);
  } catch (error) {
    console.error('Get restoration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}