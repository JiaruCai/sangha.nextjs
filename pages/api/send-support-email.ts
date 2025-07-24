// pages/api/send-support-email.ts
import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

// Rate limiting helper
const requests = new Map();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  const requestTimestamps = requests.get(ip) || [];
  const recentRequests = requestTimestamps.filter((timestamp: number) => timestamp > windowStart);
  
  if (recentRequests.length >= 10) { // Max 10 requests per minute for support
    return false;
  }
  
  recentRequests.push(now);
  requests.set(ip, recentRequests);
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  if (!rateLimit(String(ip))) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  const { firstName, lastName, email, subject, message } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please fill out all required fields' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Helper to sanitize
  const sanitize = (str: string) => typeof str === 'string' ? str.replace(/[<>]/g, '') : '';

  try {
    // Validate environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailTo = process.env.EMAIL_TO;
    
    if (!emailUser || !emailPass || !emailTo) {
      console.error('Missing email environment variables:', {
        EMAIL_USER: !!emailUser,
        EMAIL_PASS: !!emailPass,
        EMAIL_TO: !!emailTo
      });
      return res.status(500).json({ message: 'Email service not configured properly' });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: emailUser,
      to: emailTo,
      subject: `Support Ticket: ${sanitize(subject)}`,
      html: `
        <h2>New Support Ticket</h2>
        <p><strong>Name:</strong> ${sanitize(firstName)} ${sanitize(lastName)}</p>
        <p><strong>Email:</strong> ${sanitize(email)}</p>
        <p><strong>Subject:</strong> ${sanitize(subject)}</p>
        <hr>
        <h3>Message:</h3>
        <p>${sanitize(message).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Sent from Join Sangha Support Form</small></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Support ticket sent successfully' });
  } catch (error) {
    console.error('Error sending support email:', error);
    res.status(500).json({ message: 'Failed to send support ticket. Please try again.' });
  }
}