import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple storage for demo
const restorations = new Map();

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function logRequest(req: VercelRequest, action: string, details?: any) {
  const timestamp = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  
  console.log(`[${timestamp}] ${action}`, {
    method: req.method,
    url: req.url,
    userAgent: userAgent.substring(0, 100),
    ip: Array.isArray(ip) ? ip[0] : ip,
    ...details
  });
}

function logError(error: any, context: string, req: VercelRequest) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR in ${context}:`, {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']?.substring(0, 100)
    }
  });
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    logRequest(req, 'PHOTO_RESTORE_REQUEST');

    if (req.method === 'OPTIONS') {
      logRequest(req, 'PREFLIGHT_REQUEST');
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      logRequest(req, 'INVALID_METHOD', { method: req.method });
      return res.status(405).json({ 
        error: 'Method not allowed',
        allowed: ['POST', 'OPTIONS']
      });
    }

    // Validate environment
    const neroApiKey = process.env.NERO_AI_API_KEY;
    if (!neroApiKey) {
      logError(new Error('NERO_AI_API_KEY not configured'), 'ENV_VALIDATION', req);
    }

    // Create restoration record
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
    
    logRequest(req, 'RESTORATION_CREATED', { 
      restorationId: id,
      hasApiKey: !!neroApiKey
    });

    // Simulate AI processing with improved error handling
    setTimeout(() => {
      try {
        const completed = {
          ...restoration,
          status: 'completed' as const,
          restoredImageUrl: neroApiKey 
            ? 'https://via.placeholder.com/400x300/10b981/ffffff?text=AI+Processing+Ready'
            : 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Demo+Mode',
          completedAt: new Date(),
        };
        restorations.set(id, completed);
        
        console.log(`[${new Date().toISOString()}] PROCESSING_COMPLETED`, {
          restorationId: id,
          processingTime: 2000
        });
      } catch (processingError) {
        console.error(`[${new Date().toISOString()}] PROCESSING_FAILED`, {
          restorationId: id,
          error: processingError instanceof Error ? processingError.message : String(processingError)
        });
        
        restorations.set(id, {
          ...restoration,
          status: 'failed',
          errorMessage: 'Processing failed'
        });
      }
    }, 2000);

    const duration = Date.now() - startTime;
    logRequest(req, 'RESTORATION_RESPONSE', { 
      restorationId: id,
      duration: `${duration}ms`,
      status: 201
    });

    return res.status(201).json(restoration);

  } catch (error) {
    const duration = Date.now() - startTime;
    logError(error, 'PHOTO_RESTORE_HANDLER', req);
    
    logRequest(req, 'ERROR_RESPONSE', {
      duration: `${duration}ms`,
      status: 500,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    });

    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Photo restoration service temporarily unavailable',
      requestId: generateId(),
      timestamp: new Date().toISOString()
    });
  }
}