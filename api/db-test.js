// Database connection test endpoint
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  console.log('🧪 Database test endpoint called');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('📊 Checking DATABASE_URL...');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.error('❌ No DATABASE_URL found');
      return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }
    
    console.log('✅ DATABASE_URL exists, length:', dbUrl.length);
    console.log('🔗 Database URL preview:', dbUrl.substring(0, 30) + '...');
    
    // Test connection with proper configuration
    console.log('🔌 Testing database connection...');
    const sql = neon(dbUrl, {
      fetchConnectionCache: true,
      poolQueryViaFetch: true,
    });
    
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
    
    return res.status(200).json({
      success: true,
      message: 'Database connection working',
      testResult: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database test error:', error);
    return res.status(500).json({ 
      error: 'Database test failed', 
      message: error.message,
      stack: error.stack 
    });
  }
}