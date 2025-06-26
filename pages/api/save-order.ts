// pages/api/save-order-simple.ts
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Rate limiting (same as your existing pattern)
const requests = new Map();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60000;
  const requestTimestamps = requests.get(ip) || [];
  const recentRequests = requestTimestamps.filter((timestamp: number) => timestamp > windowStart);
  if (recentRequests.length >= 10) {
    return false;
  }
  recentRequests.push(now);
  requests.set(ip, recentRequests);
  return true;
}

// Sanitize function (same as your existing pattern)
const sanitize = (str: string) => typeof str === 'string' ? str.replace(/[<>]/g, '') : '';

// Email template function (same as before)
function generateOrderConfirmationEmail(orderData: any) {
  const { customerInfo, items, amount, paymentIntentId, transactionDate } = orderData;
  
  const parsePrice = (price: string | number) => {
    if (typeof price === "number") return price;
    const match = price.toString().match(/\$([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };
  
  const itemsHtml = items.map((item: any) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 0; font-family: Arial, sans-serif;">${sanitize(item.name)}</td>
      <td style="padding: 12px 0; text-align: center; font-family: Arial, sans-serif;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; font-family: Arial, sans-serif;">$${(parsePrice(item.price) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - JoinSangha</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #FFF7F5 0%, #F9E3E0 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #bf608f; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">Order Confirmed!</h1>
          <p style="color: #666; font-size: 16px; margin: 0;">Thank you for your purchase from JoinSangha</p>
        </div>
        
        <!-- Order Details -->
        <div style="padding: 30px;">
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 20px; margin: 0 0 15px 0;">Order Details</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${sanitize(paymentIntentId)}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(transactionDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> <span style="color: #bf608f; font-weight: bold;">$${amount.toFixed(2)}</span></p>
          </div>

          <!-- Items Ordered -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 20px; margin: 0 0 15px 0;">Items Ordered</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px 0; text-align: left; color: #333; font-weight: bold;">Item</th>
                  <th style="padding: 12px 0; text-align: center; color: #333; font-weight: bold;">Qty</th>
                  <th style="padding: 12px 0; text-align: right; color: #333; font-weight: bold;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid #bf608f;">
                  <td colspan="2" style="padding: 15px 0; font-weight: bold; color: #333;">Total Amount</td>
                  <td style="padding: 15px 0; text-align: right; font-weight: bold; color: #bf608f; font-size: 18px;">$${amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Shipping Information -->
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 20px; margin: 0 0 15px 0;">Shipping Address</h2>
            <p style="margin: 0; color: #666; line-height: 1.6;">
              ${sanitize(customerInfo.firstName)} ${sanitize(customerInfo.lastName)}<br>
              ${sanitize(customerInfo.address)}<br>
              ${sanitize(customerInfo.city)}, ${sanitize(customerInfo.state)} ${sanitize(customerInfo.postalCode)}<br>
              ${sanitize(customerInfo.country)}
            </p>
          </div>

          <!-- What's Next -->
          <div style="border-left: 4px solid #bf608f; padding-left: 20px; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 20px; margin: 0 0 15px 0;">What's Next?</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 10px 0;">
              We've received your order and will begin processing it shortly. You'll receive a shipping confirmation email with tracking information once your items are on their way.
            </p>
            <p style="color: #666; line-height: 1.6; margin: 0;">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <p style="color: #666; margin: 0 0 10px 0;">Questions about your order?</p>
            <p style="color: #bf608f; font-weight: bold; margin: 0;">Contact us at: ${process.env.EMAIL_TO || 'info@joinsangha.com'}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #333; color: white; text-align: center; padding: 20px;">
          <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">JoinSangha</p>
          <p style="margin: 0; color: #ccc; font-size: 14px;">Building mindful connections, one product at a time</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  if (!rateLimit(String(ip))) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  try {
    const { 
      paymentIntentId,
      amount,
      customerInfo,
      items,
      transactionDate 
    } = req.body;

    // Validate required fields
    if (!paymentIntentId || !amount || !customerInfo || !items || !transactionDate) {
      return res.status(400).json({ message: 'Missing required order information' });
    }

    if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) {
      return res.status(400).json({ message: 'Missing customer information' });
    }

    // Helper function for price parsing
    const parsePrice = (price: string | number) => {
      if (typeof price === "number") return price;
      const match = price.toString().match(/\$([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    };

    // Submit order to Google Form (if you set one up)
    try {
      const formData = new URLSearchParams();
      
      // Map your order data to Google Form fields
      // You'll need to update these field names based on your actual Google Form
      formData.append('entry.1244082131', new Date(transactionDate).toLocaleString()); // Date
      formData.append('entry.336359632', paymentIntentId); // Transaction ID
      formData.append('entry.1820554953', `${customerInfo.firstName} ${customerInfo.lastName}`); // Customer Name
      formData.append('entry.1205400089', customerInfo.email); // Email
      formData.append('entry.438696940', customerInfo.phone); // Phone
      formData.append('entry.1247117664', customerInfo.address); // Address
      formData.append('entry.1734199761', customerInfo.city); // City
      formData.append('entry.1041875178', customerInfo.state); // State
      formData.append('entry.1578595877', customerInfo.postalCode); // Postal Code
      formData.append('entry.815910671', customerInfo.country); // Country
      formData.append('entry.94161965', items.map((item: any) => 
        `${item.name} (x${item.quantity}) - $${(parsePrice(item.price) * item.quantity).toFixed(2)}`
      ).join('; ')); // Items
      formData.append('entry.103089262', `$${amount.toFixed(2)}`); // Amount
      formData.append('entry.726226844', 'Completed'); // Status

      await fetch("https://docs.google.com/forms/d/e/1FAIpQLSehtiex0mG9rLnly2QANYFrp8K6yuZmDKkG2WweAole3_E6iA/formResponse", {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('✅ Order submitted to Google Form');
    } catch (formError) {
      console.error('⚠️ Failed to submit to Google Form:', formError);
      // Continue with email sending even if form submission fails
    }

    // Send confirmation emails (only if email env vars are set)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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

        const customerMailOptions = {
          from: `"JoinSangha" <${process.env.EMAIL_USER}>`,
          to: customerInfo.email,
          subject: `Order Confirmation #${paymentIntentId.slice(-8)} - JoinSangha`,
          html: generateOrderConfirmationEmail({
            customerInfo,
            items,
            amount,
            paymentIntentId,
            transactionDate
          }),
        };

        // Send customer confirmation email
        await transporter.sendMail(customerMailOptions);
        console.log('✅ Customer email sent successfully');

        // Send admin notification email
        if (process.env.EMAIL_TO) {
          const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `New Order #${paymentIntentId.slice(-8)} from ${customerInfo.firstName} ${customerInfo.lastName}`,
            html: `
              <h2>New Order Received</h2>
              <p><strong>Order ID:</strong> ${paymentIntentId}</p>
              <p><strong>Customer:</strong> ${sanitize(customerInfo.firstName)} ${sanitize(customerInfo.lastName)}</p>
              <p><strong>Email:</strong> ${sanitize(customerInfo.email)}</p>
              <p><strong>Phone:</strong> ${sanitize(customerInfo.phone)}</p>
              <p><strong>Total Amount:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Items:</strong></p>
              <ul>
                ${items.map((item: any) => `<li>${sanitize(item.name)} (x${item.quantity}) - $${(parsePrice(item.price) * item.quantity).toFixed(2)}</li>`).join('')}
              </ul>
              <p><strong>Shipping Address:</strong><br>
              ${sanitize(customerInfo.address)}<br>
              ${sanitize(customerInfo.city)}, ${sanitize(customerInfo.state)} ${sanitize(customerInfo.postalCode)}<br>
              ${sanitize(customerInfo.country)}</p>
              <hr>
              <p><small>Sent from JoinSangha Order Management System</small></p>
            `,
          };

          await transporter.sendMail(adminMailOptions);
          console.log('✅ Admin email sent successfully');
        }

      } catch (emailError: any) {
        console.error('⚠️ Email sending failed:', emailError);
        // Don't fail the whole request if email fails
      }
    } else {
      console.log('⚠️ Email not configured - skipping email notifications');
    }

    res.status(200).json({ 
      message: 'Order processed successfully',
      orderId: paymentIntentId,
      notifications: {
        formSubmitted: !!process.env.GOOGLE_FORM_URL,
        emailSent: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
      }
    });

  } catch (error: any) {
    console.error('Error processing order:', error);
    res.status(500).json({ 
      message: 'Failed to process order',
      error: error.message 
    });
  }
}