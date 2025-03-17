const express = require('express');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Environment variables for Telegram and Elastic Email
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID';
const ELASTIC_EMAIL_USER = process.env.ELASTIC_EMAIL_USER || 'YOUR_ELASTIC_EMAIL_USER';
const ELASTIC_EMAIL_PASS = process.env.ELASTIC_EMAIL_PASS || 'YOUR_ELASTIC_EMAIL_API_KEY';

// Mapping for payment instructions for each method
const paymentInstructions = {
  interac: "Send your payment via Interac Email Transfer to your-interac@example.com and include your order number in the message.",
  btc: "Send your Bitcoin payment to YOUR_BITCOIN_ADDRESS_PLACEHOLDER. Follow standard Bitcoin transfer instructions.",
  monero: "Send your Monero payment to YOUR_MONERO_ADDRESS_PLACEHOLDER. Ensure your wallet supports Monero transactions.",
  bnb: "Send your Binance Coin payment to YOUR_BNB_ADDRESS_PLACEHOLDER on the Binance Smart Chain.",
  usdt: "Send your Tether payment to YOUR_USDT_ADDRESS_PLACEHOLDER on the appropriate network.",
  eth: "Send your Ethereum payment to YOUR_ETH_ADDRESS_PLACEHOLDER. Verify gas fees before sending.",
  doge: "Send your Dogecoin payment to YOUR_DOGE_ADDRESS_PLACEHOLDER."
};

// /api/order endpoint: processes orders, sends a Telegram message, and a confirmation email.
app.post('/api/order', (req, res) => {
  const orderData = req.body;
  
  // Build crypto line if cryptoTotal is provided.
  let cryptoLine = "";
  if (orderData.cryptoTotal && orderData.buyer && ['btc','monero','bnb','usdt','eth','doge'].includes(orderData.buyer.paymentMethod)) {
    cryptoLine = `\nTotal in ${orderData.buyer.paymentMethod.toUpperCase()}: ${orderData.cryptoTotal}`;
  }
  
  // Build Telegram message with order details.
  const telegramMessage = `New Order Received!
Order Number: ${orderData.orderNumber}
Product: ${orderData.product.name}
Quantity: ${orderData.product.quantity}
Buyer: ${orderData.buyer.name}
Email: ${orderData.buyer.email}
Phone: ${orderData.buyer.phone}
Address: ${orderData.buyer.address}
Payment Method: ${orderData.buyer.paymentMethod}
Total (USD): $${orderData.product.total}${cryptoLine}`;
  
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  // Send Telegram notification.
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
    // Set up nodemailer transporter for Elastic Email.
    const transporter = nodemailer.createTransport({
      host: 'smtp.elasticemail.com',
      port: 2525, // You can also try 587 or 25 if needed
      secure: false, // false for STARTTLS
      auth: {
        user: ELASTIC_EMAIL_USER,
        pass: ELASTIC_EMAIL_PASS
      }
    });
    
    // Determine payment instructions based on selected method.
    let instructionsText = "";
    if (orderData.buyer && paymentInstructions[orderData.buyer.paymentMethod]) {
      instructionsText = "\n\nPayment Instructions:\n" + paymentInstructions[orderData.buyer.paymentMethod];
    }
    
    // Build the confirmation email text.
    const emailText = `Thank you for your order!

Order Number: ${orderData.orderNumber}
Product: ${orderData.product.name}
Price (USD): $${orderData.product.price}
Quantity: ${orderData.product.quantity}
Total (USD): $${orderData.product.total}
${orderData.cryptoTotal ? `Total in ${orderData.buyer.paymentMethod.toUpperCase()}: ${orderData.cryptoTotal}` : ""}

Buyer Details:
Name: ${orderData.buyer.name}
Email: ${orderData.buyer.email}
Phone: ${orderData.buyer.phone}
Address: ${orderData.buyer.address}
Payment Method: ${orderData.buyer.paymentMethod.toUpperCase()}
${instructionsText}

Please follow the above payment instructions to complete your purchase.

Thank you for shopping with us!
Guero's Shop`;
    
    const mailOptions = {
      from: ELASTIC_EMAIL_USER,
      // Send confirmation email to your address for manual forwarding.
      to: 'guero.canadiense81@gmail.com',
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      text: emailText
    };

    // Send the confirmation email.
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending confirmation email:', error);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
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

// /api/contact endpoint: processes contact messages and sends a Telegram notification.
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
