// Simple in-memory storage for demo (shared across requests)
const restorations = new Map();

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

  // Check if this was a user upload or use demo data
  const stored = restorations.get(id);
  const isUserUpload = stored?.userUpload;

  // Create restoration data - different for user uploads vs demo
  const restoration = {
    id: id,
    originalImageUrl: isUserUpload 
      ? `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzA4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgT3JpZ2luYWwgUGhvdG88L3RleHQ+PC9zdmc+`
      : '/assets/Damaged_vintage_family_photo_bb3eed1a-KyYu_ktH.png',
    options: {},
    status: 'completed',
    restoredImageUrl: isUserUpload
      ? `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTBiOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BSSBSZXN0b3JlZDwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgUGhvdG88L3RleHQ+PC9zdmc+`
      : '/assets/Restored_colorized_family_photo_929282a6-CjFYSG0H.png',
    createdAt: new Date(Date.now() - 30000).toISOString(),
    completedAt: new Date().toISOString(),
    userUpload: isUserUpload
  };

  console.log('Get restoration request:', id, 'User upload:', isUserUpload, 'Stored count:', restorations.size);

  return res.json(restoration);
}