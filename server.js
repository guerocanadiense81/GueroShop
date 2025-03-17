const express = require('express');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public"
app.use(express.static('public'));

// Environment variables (set these in your deployment platform)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID';
const ELASTIC_EMAIL_USER = process.env.ELASTIC_EMAIL_USER || 'YOUR_ELASTIC_EMAIL_USER';
const ELASTIC_EMAIL_PASS = process.env.ELASTIC_EMAIL_PASS || 'YOUR_ELASTIC_EMAIL_API_KEY';

// Mapping for crypto codes
const cryptoNames = {
  btc: "BTC",
  monero: "XMR",
  bnb: "BNB",
  usdt: "USDT",
  eth: "ETH",
  doge: "DOGE"
};

app.post('/api/order', (req, res) => {
  const orderData = req.body;
  
  // Prepare crypto line if applicable
  let cryptoLine = "";
  if (orderData.cryptoTotal) {
    // Use mapping to show currency code
    const cryptoCode = cryptoNames[orderData.buyer.paymentMethod] || orderData.buyer.paymentMethod;
    cryptoLine = `\nTotal in ${cryptoCode}: ${orderData.cryptoTotal}`;
  }
  
  // Build Telegram message
  const telegramMessage = `New Order Received!
Order Number: ${orderData.orderNumber}
Product: ${orderData.product.name}
Quantity: ${orderData.product.quantity}
Buyer: ${orderData.buyer.name}
Email: ${orderData.buyer.email}
Phone: ${orderData.buyer.phone}
Address: ${orderData.buyer.address}
Payment Method: ${orderData.buyer.paymentMethod}
Total: $${orderData.product.total}${cryptoLine}`;
  
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  // Send Telegram notification
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
    // Setup nodemailer transporter for Elastic Email
    const transporter = nodemailer.createTransport({
      host: 'smtp.elasticemail.com',
      port: 2525,
      secure: false,
      auth: {
        user: ELASTIC_EMAIL_USER,
        pass: ELASTIC_EMAIL_PASS
      }
    });
    
    // Build email text, including crypto conversion if provided
    let emailText = `Thank you for your order!

Order Number: ${orderData.orderNumber}
Product: ${orderData.product.name}
Price: $${orderData.product.price}
Quantity: ${orderData.product.quantity}
Total: $${orderData.product.total}${cryptoLine}

Buyer Details:
Name: ${orderData.buyer.name}
Email: ${orderData.buyer.email}
Phone: ${orderData.buyer.phone}
Address: ${orderData.buyer.address}

Please follow the payment instructions provided to complete your purchase.

Thank you for shopping with us!
Guero's Shop`;
    
    const mailOptions = {
      from: ELASTIC_EMAIL_USER,
      to: 'guero.canadiense81@gmail.com', // Always send to you for manual forwarding
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      text: emailText
    };

    // Send confirmation email via Elastic Email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending confirmation email:', error);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
      // Respond to client with both responses
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
