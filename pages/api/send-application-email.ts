import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

const requests = new Map();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60000;
  const requestTimestamps = requests.get(ip) || [];
  const recentRequests = requestTimestamps.filter((timestamp: number) => timestamp > windowStart);
  if (recentRequests.length >= 5) {
    return false;
  }
  recentRequests.push(now);
  requests.set(ip, recentRequests);
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  if (!rateLimit(String(ip))) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  const {
    firstName,
    lastName,
    preferredFirstName,
    email,
    phone,
    resume,
    resumeType,
    resumeFileName,
    resumeFileData,
    school,
    degree,
    linkedin,
    portfolio,
    experience,
    improvement,
    visa
  } = req.body;

  if (!firstName || !lastName || !email || !phone || !school || !degree || !experience || !improvement || !visa) {
    return res.status(400).json({ message: 'Please fill out all required fields' });
  }
  if (resumeType === 'attach' && (!resumeFileName || !resumeFileData)) {
    return res.status(400).json({ message: 'Please upload your resume file.' });
  }
  if (resumeType !== 'attach' && !resume) {
    return res.status(400).json({ message: 'Please provide your resume.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const sanitize = (str: string) => typeof str === 'string' ? str.replace(/[<>]/g, '') : '';

  try {
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
      subject: `New Job Application from ${sanitize(firstName)} ${sanitize(lastName)}`,
      html: `
        <h2>New Job Application</h2>
        <p><strong>First Name:</strong> ${sanitize(firstName)}</p>
        <p><strong>Last Name:</strong> ${sanitize(lastName)}</p>
        <p><strong>Preferred First Name:</strong> ${sanitize(preferredFirstName)}</p>
        <p><strong>Email:</strong> ${sanitize(email)}</p>
        <p><strong>Phone:</strong> ${sanitize(phone)}</p>
        <p><strong>Resume/CV:</strong> ${resumeType === 'attach' ? sanitize(resumeFileName) : sanitize(resume)}</p>
        <p><strong>School:</strong> ${sanitize(school)}</p>
        <p><strong>Degree:</strong> ${sanitize(degree)}</p>
        <p><strong>LinkedIn Profile:</strong> ${sanitize(linkedin ? linkedin : 'N/A')}</p>
        <p><strong>Portfolio Link:</strong> ${sanitize(portfolio ? portfolio : 'N/A')}</p>
        <p><strong>0 to 1 Product Design Experience:</strong> ${sanitize(experience)}</p>
        <p><strong>Improvement Suggestion:</strong> ${sanitize(improvement)}</p>
        <p><strong>Visa Sponsorship Required:</strong> ${sanitize(visa)}</p>
        <hr>
        <p><small>Sent from Join Sangha Job Application Form</small></p>
      `,
      attachments: [] as any[],
    };
    if (resumeType === 'attach' && resumeFileName && resumeFileData) {
      mailOptions.attachments.push({
        filename: sanitize(resumeFileName),
        content: Buffer.from(resumeFileData, 'base64'),
      });
    }

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Application sent successfully' });
  } catch (error) {
    console.error('Error sending application email:', error);
    res.status(500).json({ message: 'Failed to send application. Please try again.' });
  }
} 