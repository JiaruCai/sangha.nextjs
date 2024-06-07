import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject('Failed to create access token :(');
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  return transporter;
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, message } = req.body;

    console.log('Email:', email);
    console.log('Message:', message);

    try {
      const transporter = await createTransporter();

      const mailOptions = {
        from: email,
        to: 'info@familiaapp.io',
        subject: 'New Contact Form Submission',
        text: message,
        html: `<p><strong>From:</strong> ${email}</p><p>${message}</p>`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Thank you for your message!' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: `Failed to send email: ${error.message}`, error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
