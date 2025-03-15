const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Environment variables for Telegram bot (set these on Heroku)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID';

// Endpoint to process orders and send Telegram notification
app.post('/api/order', (req, res) => {
  const orderData = req.body;
  const message = `New Order Received!
Order Number: ${orderData.orderNumber}
Product: ${orderData.product.name}
Quantity: ${orderData.product.quantity}
Buyer: ${orderData.buyer.name}
Email: ${orderData.buyer.email}
Phone: ${orderData.buyer.phone}
Address: ${orderData.buyer.address}
Payment Method: ${orderData.buyer.paymentMethod}`;
  
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

// Endpoint to process contact messages and send Telegram notification
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
