import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple storage for demo
const restorations = new Map();

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    // For demo purposes, create a mock restoration
    const id = generateId();
    const restoration = {
      id,
      originalImageUrl: `/uploads/demo-${Date.now()}.jpg`,
      options: {},
      status: 'processing' as const,
      createdAt: new Date(),
    };

    // Store in memory
    restorations.set(id, restoration);

    // Simulate processing completion
    setTimeout(() => {
      const completed = {
        ...restoration,
        status: 'completed' as const,
        restoredImageUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=AI+Restored+Photo',
        completedAt: new Date(),
      };
      restorations.set(id, completed);
    }, 2000);

    return res.status(201).json(restoration);

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}