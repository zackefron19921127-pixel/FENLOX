// Simple storage for uploaded photos (shared with restore endpoint)
const uploadedPhotos = new Map();

export default function handler(req: any, res: any) {
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

  // Check if this is a user upload and we have the restoration stored
  const isUserUpload = id.startsWith('usr');
  console.log('Get restoration:', id, 'User upload:', isUserUpload, 'Has restoration stored:', uploadedPhotos.has(id));
  
  if (isUserUpload && uploadedPhotos.has(id)) {
    // Return the stored restoration from the upload endpoint
    const restoration = uploadedPhotos.get(id);
    return res.status(200).json(restoration);
  }

  // Generate unique colors based on ID for variety
  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
  const colorIndex = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const selectedColor = colors[colorIndex];

  // Fallback for demo or unrecognized IDs
  const restoration = {
    id: id,
    originalImageUrl: isUserUpload 
      ? `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgVXBsb2FkZWQgUGhvdG88L3RleHQ+PC9zdmc+`
      : '/assets/Damaged_vintage_family_photo_bb3eed1a-KyYu_ktH.png',
    options: {},
    status: 'completed',
    restoredImageUrl: isUserUpload
      ? `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${selectedColor}"/><text x="50%" y="40%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">AI Restored</text><text x="50%" y="60%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">Your Photo</text></svg>`)}`
      : '/assets/Restored_colorized_family_photo_929282a6-CjFYSG0H.png',
    createdAt: new Date(Date.now() - 30000).toISOString(),
    completedAt: new Date().toISOString()
  };

  return res.json(restoration);
}