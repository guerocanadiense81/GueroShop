const express = require('express');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer'); // For sending emails
const app = express();
const PORT = process.env.PORT || 3000;

// Use built-in Express middleware for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Environment variables for Telegram bot and email credentials
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID';
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'YOUR_EMAIL_APP_PASSWORD';

// Endpoint to process orders, send Telegram notification, and send a confirmation email
app.post('/api/order', (req, res) => {
  const orderData = req.body;

  // Build a message for Telegram
  const telegramMessage = `New Order Received!
Order Number: ${orderData.orderNumber}
Product: ${orderData.product.name}
Quantity: ${orderData.product.quantity}
Buyer: ${orderData.buyer.name}
Email: ${orderData.buyer.email}
Phone: ${orderData.buyer.phone}
Address: ${orderData.buyer.address}
Payment Method: ${orderData.buyer.paymentMethod}`;

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  // First, send the Telegram message
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
      // Setup nodemailer transporter for Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS
        }
      });

      // Prepare email options
      const mailOptions = {
        from: EMAIL_USER,
        to: orderData.buyer.email, // Email sent to the buyer
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

Please follow the payment instructions provided to complete your purchase.

Thank you for shopping with us!
Guero's Shop`
      };

      // Send the confirmation email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending confirmation email:', error);
        } else {
          console.log('Confirmation email sent:', info.response);
        }
        // Respond to the client regardless of email success
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

// Endpoint to process contact messages and send a Telegram notification
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
