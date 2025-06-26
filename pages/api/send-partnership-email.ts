// pages/api/send-partnership-email.ts
import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

// Rate limiting helper (optional but recommended)
const requests = new Map();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  const requestTimestamps = requests.get(ip) || [];
  const recentRequests = requestTimestamps.filter((timestamp: number) => timestamp > windowStart);
  
  if (recentRequests.length >= 5) { // Max 5 requests per minute
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

  const { name, email, partnershipType, ...rest } = req.body;

  // Validate required fields
  if (!name || !email || !partnershipType) {
    return res.status(400).json({ message: 'Please fill out all required fields' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Helper to sanitize
  const sanitize = (str: string) => typeof str === 'string' ? str.replace(/[<>]/g, '') : '';

  // Build dynamic message content based on partnershipType
  let detailsHtml = '';
  switch (partnershipType) {
    case 'hosting event':
      detailsHtml = `
        <p><strong>Location:</strong> ${sanitize(rest.location)}</p>
        <p><strong>Date and Time:</strong> ${sanitize(rest.dateTime)}</p>
        <p><strong>Price Range:</strong> ${sanitize(rest.priceRange)}</p>
        <p><strong>Currency:</strong> ${sanitize(rest.currency)}</p>
        <p><strong>Event Details:</strong> ${sanitize(rest.eventDetails)}</p>
      `;
      break;
    case 'ordering merch':
      detailsHtml = `
        <p><strong>Quantity:</strong> ${sanitize(rest.quantity)}</p>
        <p><strong>Delivery Address:</strong> ${sanitize(rest.deliveryAddress)}</p>
        <p><strong>Event Details:</strong> ${sanitize(rest.eventDetails)}</p>
      `;
      break;
    case 'corporate wellness':
      detailsHtml = `
        <p><strong>Company Size:</strong> ${sanitize(rest.companySize)}</p>
        <p><strong>Preferred Program:</strong> ${sanitize(rest.preferredProgram)}</p>
        <p><strong>Location:</strong> ${sanitize(rest.location)}</p>
        <p><strong>Event Details:</strong> ${sanitize(rest.eventDetails)}</p>
      `;
      break;
    case 'technology integration':
      detailsHtml = `
        <p><strong>Tech Stack:</strong> ${sanitize(rest.techStack)}</p>
        <p><strong>Integration Goals:</strong> ${sanitize(rest.integrationGoals)}</p>
        <p><strong>Event Details:</strong> ${sanitize(rest.eventDetails)}</p>
      `;
      break;
    case 'content partnership':
      detailsHtml = `
        <p><strong>Content Type:</strong> ${sanitize(rest.contentType)}</p>
        <p><strong>Audience Size:</strong> ${sanitize(rest.audienceSize)}</p>
        <p><strong>Event Details:</strong> ${sanitize(rest.eventDetails)}</p>
      `;
      break;
    case 'investment':
      detailsHtml = `
        <p><strong>Investment Amount:</strong> ${sanitize(rest.investmentAmount)}</p>
        <p><strong>Company Valuation:</strong> ${sanitize(rest.companyValuation)}</p>
        <p><strong>Event Details:</strong> ${sanitize(rest.eventDetails)}</p>
      `;
      break;
    case 'other':
      detailsHtml = `
        <p><strong>Subject:</strong> ${sanitize(rest.subject)}</p>
        <p><strong>Event Details:</strong> ${sanitize(rest.eventDetails)}</p>
      `;
      break;
    default:
      detailsHtml = `<p><strong>Event Details:</strong> ${sanitize(rest.eventDetails)}</p>`;
  }

  try {
    // These environment variables are only accessible on the server
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `New Partnership Inquiry from ${sanitize(name)}`,
      html: `
        <h2>New Partnership Inquiry</h2>
        <p><strong>Name:</strong> ${sanitize(name)}</p>
        <p><strong>Email:</strong> ${sanitize(email)}</p>
        <p><strong>Mobile:</strong> ${sanitize(rest.mobile)}</p>
        <p><strong>Partnership Type:</strong> ${sanitize(partnershipType)}</p>
        ${detailsHtml}
        <hr>
        <p><small>Sent from Join Sangha Partnership Form</small></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email. Please try again.' });
  }
}