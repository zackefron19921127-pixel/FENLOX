import type { VercelRequest, VercelResponse } from '@vercel/node';

function logRequest(req: VercelRequest, action: string, details?: any) {
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  
  console.log(`[${timestamp}] ${action}`, {
    method: req.method,
    url: req.url,
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
    url: req.url
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      logRequest(req, 'PREFLIGHT_REQUEST');
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      logRequest(req, 'INVALID_METHOD', { method: req.method });
      return res.status(405).json({ 
        error: 'Method not allowed',
        allowed: ['GET', 'OPTIONS']
      });
    }

    const { id } = req.query;
    
    logRequest(req, 'GET_RESTORATION_REQUEST', { restorationId: id });
    
    if (!id || typeof id !== 'string') {
      logRequest(req, 'INVALID_ID_FORMAT', { providedId: id, type: typeof id });
      return res.status(400).json({ 
        error: 'Invalid restoration ID',
        message: 'Restoration ID must be a valid string'
      });
    }

    if (id.length < 5 || id.length > 50) {
      logRequest(req, 'INVALID_ID_LENGTH', { restorationId: id, length: id.length });
      return res.status(400).json({ 
        error: 'Invalid restoration ID format',
        message: 'Restoration ID has invalid length'
      });
    }

    // Mock restoration data for demo with realistic processing states
    const mockStatuses = ['processing', 'completed', 'failed'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)] as any;
    
    const restoration = {
      id,
      originalImageUrl: `/uploads/demo-${Date.now()}.jpg`,
      options: {},
      status: randomStatus,
      ...(randomStatus === 'completed' && {
        restoredImageUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=AI+Restored+Photo'
      }),
      ...(randomStatus === 'failed' && {
        errorMessage: 'Demo processing simulation failed'
      }),
      createdAt: new Date(Date.now() - 30000), // 30 seconds ago
      ...(randomStatus !== 'processing' && {
        completedAt: new Date()
      })
    };

    const duration = Date.now() - startTime;
    logRequest(req, 'RESTORATION_FOUND', { 
      restorationId: id,
      status: randomStatus,
      duration: `${duration}ms`
    });

    return res.json(restoration);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(error, 'GET_RESTORATION_HANDLER', req);
    
    logRequest(req, 'ERROR_RESPONSE', {
      duration: `${duration}ms`,
      status: 500,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    });

    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Unable to retrieve restoration status',
      requestId: generateId(),
      timestamp: new Date().toISOString()
    });
  }
}