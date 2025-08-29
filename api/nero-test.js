// Test Nero AI API directly
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const neroApiKey = process.env.NERO_AI_API_KEY;
    
    console.log('🔍 Testing Nero AI API...');
    console.log('API Key available:', !!neroApiKey);
    console.log('API Key length:', neroApiKey ? neroApiKey.length : 0);
    
    if (!neroApiKey) {
      return res.status(500).json({ error: 'No Nero AI API key found' });
    }

    // Test with a simple base64 image (1x1 pixel)
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A==';

    console.log('📡 Making Nero AI API request...');
    
    const neroResponse = await fetch('https://api.nero.com/biz/api/task', {
      method: 'POST',
      headers: {
        'x-neroai-api-key': neroApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'ScratchFix',
        body: {
          image: testImage
        }
      })
    });

    console.log('📊 Nero API response status:', neroResponse.status);
    console.log('📊 Response headers:', Object.fromEntries(neroResponse.headers.entries()));
    
    const responseText = await neroResponse.text();
    console.log('📊 Response body:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    return res.status(200).json({
      success: neroResponse.ok,
      status: neroResponse.status,
      hasApiKey: !!neroApiKey,
      keyLength: neroApiKey ? neroApiKey.length : 0,
      response: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Nero API test error:', error);
    return res.status(500).json({ 
      error: 'Test failed',
      message: error.message,
      stack: error.stack 
    });
  }
}