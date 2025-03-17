const express = require('express');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public"
app.use(express.static('public'));

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID';
const ELASTIC_EMAIL_USER = process.env.ELASTIC_EMAIL_USER || 'YOUR_ELASTIC_EMAIL_USER';
const ELASTIC_EMAIL_PASS = process.env.ELASTIC_EMAIL_PASS || 'YOUR_ELASTIC_EMAIL_API_KEY';

// /api/order endpoint
app.post('/api/order', (req, res) => {
  const orderData = req.body;

  // Build Telegram message
  const telegramMessage = `New Order Received!
Order Number: ${orderData.orderNumber}
Product: ${orderData.product.name}
Quantity: ${orderData.product.quantity}
Buyer: ${orderData.buyer.name}
Email: ${orderData.buyer.email}
Phone: ${orderData.buyer.phone}
Address: ${orderData.buyer.address}
Payment Method: ${orderData.buyer.paymentMethod}`;

  // Log the buyer's email (or store in DB if desired)
  console.log(`Buyer Email: ${orderData.buyer.email}`);

  // Send Telegram notification
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: telegramMessage
    })
  })
    .then(response => response.json())
    .then(telegramResponse => {
      // Configure nodemailer with Elastic Email
      const transporter = nodemailer.createTransport({
        host: 'smtp.elasticemail.com',
        port: 2525, // or 587, 25
        secure: false,
        auth: {
          user: ELASTIC_EMAIL_USER,
          pass: ELASTIC_EMAIL_PASS
        }
      });

      // Instead of sending to buyer, send to your email
      const mailOptions = {
        from: ELASTIC_EMAIL_USER,
        to: 'guero.canadiense81@gmail.com', // <--- Always send to YOU
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        text: `Thank you for your order!

Order Number: ${orderData.orderNumber}
Product: ${orderData.product.name}
Price: $${orderData.product.price}
Quantity: ${orderData.product.quantity}
Total: $${orderData.product.total}

Buyer Details:
Name: ${orderData.buyer.name}
Email: ${orderData.buyer.email}
Phone: ${orderData.buyer.phone}
Address: ${orderData.buyer.address}

Please follow the payment instructions provided to complete the purchase.

Thank you for shopping with us!
Guero's Shop`
      };

      // Send the email to YOU
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email to seller:', error);
        } else {
          console.log('Confirmation email sent to seller:', info.response);
        }

        // Respond to the client
        res.json({
          success: true,
          telegramResponse,
          emailResponse: error ? error.toString() : info.response
        });
      });
    })
    .catch(error => {
      console.error('Error processing order:', error);
      res.status(500).json({ success: false, error: error.toString() });
    });
});

// /api/contact endpoint
app.post('/api/contact', (req, res) => {
  const contactData = req.body;
  const message = `New Contact Message!
Name: ${contactData.name}
Email: ${contactData.email}
Message: ${contactData.message}`;

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    })
  })
    .then(response => response.json())
    .then(data => {
      res.json({ success: true, telegramResponse: data });
    })
    .catch(error => {
      console.error('Error sending Telegram message:', error);
      res.status(500).json({ success: false, error: error.toString() });
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
