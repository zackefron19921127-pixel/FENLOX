// In-memory storage for restorations (shared between upload and polling)
const restorations = new Map();

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

  // Try to get stored restoration data first
  const storedRestoration = restorations.get(id);
  
  if (storedRestoration) {
    console.log('✅ Found stored restoration for ID:', id);
    console.log('📊 DEBUG: Stored data has images:', {
      hasOriginal: !!storedRestoration.originalImageUrl,
      hasRestored: !!storedRestoration.restoredImageUrl,
      originalLength: storedRestoration.originalImageUrl.length,
      restoredLength: storedRestoration.restoredImageUrl.length,
      imagesAreDifferent: storedRestoration.originalImageUrl !== storedRestoration.restoredImageUrl
    });
    return res.status(200).json(storedRestoration);
  }

  // Fallback for IDs that exist but no stored data
  if (id.startsWith('usr')) {
    const restoration = {
      id: id,
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      originalImageUrl: '',
      restoredImageUrl: '',
      options: {}
    };

    console.log('⚠️ Returning fallback for ID (no stored data):', id);
    return res.status(200).json(restoration);
  }

  console.log('❌ Restoration not found for ID:', id);
  return res.status(404).json({ error: 'Restoration not found' });
}