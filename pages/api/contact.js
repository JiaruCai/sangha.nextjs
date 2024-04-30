// pages/api/contact.js
export default function handler(req, res) {
    if (req.method === 'POST') {
      // Process POST request
      const { email, message } = req.body;
      console.log('Email:', email, 'Message:', message);
      // Add your logic to handle email sending, etc.
      res.status(200).json({ message: 'Thank you for your message!' });
    } else {
      // Handle any other HTTP method
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  