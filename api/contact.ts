import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    contentType: req.headers['content-type']
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, maxLength);
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    logRequest(req, 'CONTACT_REQUEST');

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

    // Validate content type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      logRequest(req, 'INVALID_CONTENT_TYPE', { contentType });
      return res.status(400).json({
        error: 'Invalid content type',
        message: 'Expected application/json'
      });
    }

    // Validate request body exists
    if (!req.body || typeof req.body !== 'object') {
      logRequest(req, 'INVALID_BODY', { bodyType: typeof req.body });
      return res.status(400).json({
        error: 'Invalid request body',
        message: 'Request body must be valid JSON'
      });
    }

    const { name, email, message, subject } = req.body;
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(name, 100);
    const sanitizedEmail = sanitizeInput(email, 255);
    const sanitizedMessage = sanitizeInput(message, 2000);
    const sanitizedSubject = sanitizeInput(subject, 200);

    // Detailed validation
    const validationErrors: string[] = [];
    
    if (!sanitizedName) {
      validationErrors.push('Name is required and must be valid text');
    }
    
    if (!sanitizedEmail) {
      validationErrors.push('Email is required');
    } else if (!validateEmail(sanitizedEmail)) {
      validationErrors.push('Email must be a valid email address');
    }
    
    if (!sanitizedMessage) {
      validationErrors.push('Message is required and cannot be empty');
    } else if (sanitizedMessage.length < 10) {
      validationErrors.push('Message must be at least 10 characters long');
    }

    if (validationErrors.length > 0) {
      logRequest(req, 'VALIDATION_FAILED', { 
        errors: validationErrors,
        hasName: !!sanitizedName,
        hasEmail: !!sanitizedEmail,
        hasMessage: !!sanitizedMessage,
        messageLength: sanitizedMessage.length
      });
      
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const id = generateId();
    
    // Log successful submission (without sensitive data)
    logRequest(req, 'CONTACT_SUBMISSION_SUCCESS', { 
      submissionId: id,
      nameLength: sanitizedName.length,
      emailDomain: sanitizedEmail.split('@')[1],
      messageLength: sanitizedMessage.length,
      hasSubject: !!sanitizedSubject
    });

    console.log(`[${new Date().toISOString()}] CONTACT_SUBMISSION_RECEIVED`, {
      id,
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject || 'No subject',
      messagePreview: sanitizedMessage.substring(0, 100) + (sanitizedMessage.length > 100 ? '...' : '')
    });

    const duration = Date.now() - startTime;
    logRequest(req, 'CONTACT_RESPONSE', { 
      submissionId: id,
      duration: `${duration}ms`,
      status: 201
    });

    return res.status(201).json({ 
      message: 'Contact submission received successfully',
      id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(error, 'CONTACT_HANDLER', req);
    
    logRequest(req, 'ERROR_RESPONSE', {
      duration: `${duration}ms`,
      status: 500,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    });

    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Unable to process contact submission at this time',
      requestId: generateId(),
      timestamp: new Date().toISOString()
    });
  }
}