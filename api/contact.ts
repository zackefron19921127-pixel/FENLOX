import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Simple contact storage for serverless
class ContactStorage {
  private submissions = new Map();
  
  async createContactSubmission(data: any) {
    const id = crypto.randomUUID();
    const submission = {
      id,
      ...data,
      createdAt: new Date(),
    };
    this.submissions.set(id, submission);
    return submission;
  }
}

const storage = new ContactStorage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Simple validation for required fields
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      res.status(400).json({ 
        error: 'Name, email, and message are required' 
      });
      return;
    }

    const submission = await storage.createContactSubmission({ name, email, message });
    res.status(201).json({ 
      message: 'Contact submission received', 
      id: submission.id 
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}