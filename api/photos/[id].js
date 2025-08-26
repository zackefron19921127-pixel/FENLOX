// In-memory storage for demo (same as restore.js)
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

  const restoration = restorations.get(id);
  
  if (!restoration) {
    console.log('❌ Restoration not found for ID:', id);
    return res.status(404).json({ error: 'Restoration not found' });
  }

  console.log('✅ Found restoration for ID:', id);
  return res.status(200).json(restoration);
}