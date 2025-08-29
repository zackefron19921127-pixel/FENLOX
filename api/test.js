// Simple test endpoint to verify Vercel is working
export default async function handler(req, res) {
  console.log('🧪 Test endpoint called');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test environment variables
    const hasDbUrl = !!process.env.DATABASE_URL;
    const hasApiKey = !!process.env.NERO_AI_API_KEY;
    
    console.log('🔍 Environment check:', { hasDbUrl, hasApiKey });
    
    return res.status(200).json({
      success: true,
      message: 'Test endpoint working',
      environment: {
        hasDbUrl,
        hasApiKey,
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return res.status(500).json({ 
      error: 'Test failed', 
      message: error.message,
      stack: error.stack 
    });
  }
}