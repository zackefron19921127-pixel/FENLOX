// Simple in-memory storage for demo
const restorations = new Map();

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
  
  // Create restoration record with user's photo info
  const restoration = {
    id: id,
    originalImageUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzA4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgT3JpZ2luYWwgUGhvdG88L3RleHQ+PC9zdmc+`,
    options: {},
    status: 'processing',
    createdAt: new Date().toISOString(),
    userUpload: true
  };

  // Store in memory for status checking
  restorations.set(id, restoration);

  console.log('Photo restoration request:', id, 'Total stored:', restorations.size);

  return res.status(201).json(restoration);
}