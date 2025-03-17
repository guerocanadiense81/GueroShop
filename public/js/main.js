/* main.js */

// Define 20 products with individually specified details.
const products = [
  { id: 1, name: "Item 1", description: "Description for item 1.", price: "11.00", image: "images/item1.png" },
  { id: 2, name: "Item 2", description: "Description for item 2.", price: "12.00", image: "images/item2.png" },
  { id: 3, name: "Item 3", description: "Description for item 3.", price: "13.00", image: "images/item3.png" },
  { id: 4, name: "Item 4", description: "Description for item 4.", price: "14.00", image: "images/item4.png" },
  { id: 5, name: "Item 5", description: "Description for item 5.", price: "15.00", image: "images/item5.png" },
  { id: 6, name: "Item 6", description: "Description for item 6.", price: "16.00", image: "images/item6.png" },
  { id: 7, name: "Item 7", description: "Description for item 7.", price: "17.00", image: "images/item7.png" },
  { id: 8, name: "Item 8", description: "Description for item 8.", price: "18.00", image: "images/item8.png" },
  { id: 9, name: "Item 9", description: "Description for item 9.", price: "19.00", image: "images/item9.png" },
  { id: 10, name: "Item 10", description: "Description for item 10.", price: "20.00", image: "images/item10.png" },
  { id: 11, name: "Item 11", description: "Description for item 11.", price: "21.00", image: "images/item11.png" },
  { id: 12, name: "Item 12", description: "Description for item 12.", price: "22.00", image: "images/item12.png" },
  { id: 13, name: "Item 13", description: "Description for item 13.", price: "23.00", image: "images/item13.png" },
  { id: 14, name: "Item 14", description: "Description for item 14.", price: "24.00", image: "images/item14.png" },
  { id: 15, name: "Item 15", description: "Description for item 15.", price: "25.00", image: "images/item15.png" },
  { id: 16, name: "Item 16", description: "Description for item 16.", price: "26.00", image: "images/item16.png" },
  { id: 17, name: "Item 17", description: "Description for item 17.", price: "27.00", image: "images/item17.png" },
  { id: 18, name: "Item 18", description: "Description for item 18.", price: "28.00", image: "images/item18.png" },
  { id: 19, name: "Item 19", description: "Description for item 19.", price: "29.00", image: "images/item19.png" },
  { id: 20, name: "Item 20", description: "Description for item 20.", price: "30.00", image: "images/item20.png" }
];

// Global shipping cost per item (in USD); update this placeholder as needed.
const SHIPPING_COST_PER_ITEM = 5.00;

// Mapping for crypto currency codes.
const cryptoNames = {
  btc: "BTC",
  monero: "XMR",
  bnb: "BNB",
  usdt: "USDT",
  eth: "ETH",
  doge: "DOGE"
};

// Payment instructions mapping (includes Interac and crypto)
const paymentInstructions = {
  interac: "Send your payment via Interac Email Transfer to your-interac@example.com and include your order number in the message.",
  btc: "Send your Bitcoin payment to YOUR_BITCOIN_ADDRESS_PLACEHOLDER.",
  monero: "Send your Monero payment to YOUR_MONERO_ADDRESS_PLACEHOLDER.",
  bnb: "Send your Binance Coin payment to YOUR_BNB_ADDRESS_PLACEHOLDER.",
  usdt: "Send your Tether payment to YOUR_USDT_ADDRESS_PLACEHOLDER.",
  eth: "Send your Ethereum payment to YOUR_ETH_ADDRESS_PLACEHOLDER.",
  doge: "Send your Dogecoin payment to YOUR_DOGE_ADDRESS_PLACEHOLDER."
};

// Populate products on index page.
function populateProducts() {
  const container = document.querySelector('.products');
  if (!container) return;
  container.innerHTML = '';
  products.forEach(product => {
    const prodDiv = document.createElement('div');
    prodDiv.className = 'product';
    prodDiv.id = `product-${product.id}`;
    prodDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <p>Price: $${product.price}</p>
      <p>Quantity: <input type="number" id="qty-${product.id}" value="1" min="1"></p>
      <button onclick="buyNow(${product.id})">Buy Now</button>
    `;
    container.appendChild(prodDiv);
  });
}

// Save selected product details and redirect to checkout.
function buyNow(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    const quantity = document.getElementById(`qty-${product.id}`).value;
    // Save order details in localStorage. Calculate subtotal in USD.
    localStorage.setItem('order', JSON.stringify({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      total: (product.price * quantity).toFixed(2)  // Subtotal in USD (without shipping)
    }));
    window.location.href = 'checkout.html';
  }
}

// Populate order summary on the checkout page.
function populateOrderDetails() {
  const container = document.getElementById('order-details');
  const order = JSON.parse(localStorage.getItem('order'));
  if (order && container) {
    // Calculate shipping cost and grand total.
    const quantity = parseFloat(order.quantity);
    const shippingCost = (SHIPPING_COST_PER_ITEM * quantity).toFixed(2);
    const subtotal = parseFloat(order.total);
    const grandTotal = (subtotal + parseFloat(shippingCost)).toFixed(2);
    
    // Build a line for crypto conversion if buyer payment method is set (will be updated later).
    let cryptoLine = "";
    if (order.buyer && ['btc','monero','bnb','usdt','eth','doge'].includes(order.buyer.paymentMethod)) {
      const rateEl = document.getElementById(order.buyer.paymentMethod + '-rate');
      if (rateEl) {
        const rateText = rateEl.innerText; // e.g., "$40000"
        const usdRate = parseFloat(rateText.replace('$', ''));
        if (usdRate && grandTotal) {
          const cryptoTotal = (grandTotal / usdRate).toFixed(6);
          cryptoLine = `<p><strong>Total in ${order.buyer.paymentMethod.toUpperCase()}:</strong> ${cryptoTotal}</p>`;
          order.cryptoTotal = cryptoTotal;
          localStorage.setItem('order', JSON.stringify(order));
        }
      }
    }
    
    container.innerHTML = `
      <p><strong>Product:</strong> ${order.name}</p>
      <p><strong>Price (USD):</strong> $${order.price}</p>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Subtotal (USD):</strong> $${order.total}</p>
      <p><strong>Shipping (USD):</strong> $${shippingCost}</p>
      <p><strong>Grand Total (USD):</strong> $${grandTotal}</p>
      ${cryptoLine}
    `;
    
    // Update order object with shipping and grand total.
    order.shippingCost = shippingCost;
    order.grandTotal = grandTotal;
    localStorage.setItem('order', JSON.stringify(order));
  }
}

// Fetch live crypto conversion rates from Coingecko.
function fetchCryptoRates() {
  fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,monero,binancecoin,tether,ethereum,dogecoin&vs_currencies=usd')
    .then(response => response.json())
    .then(data => {
      if (document.getElementById('btc-rate')) document.getElementById('btc-rate').innerText = `$${data.bitcoin.usd}`;
      if (document.getElementById('monero-rate')) document.getElementById('monero-rate').innerText = `$${data.monero.usd}`;
      if (document.getElementById('bnb-rate')) document.getElementById('bnb-rate').innerText = `$${data.binancecoin.usd}`;
      if (document.getElementById('usdt-rate')) document.getElementById('usdt-rate').innerText = `$${data.tether.usd}`;
      if (document.getElementById('eth-rate')) document.getElementById('eth-rate').innerText = `$${data.ethereum.usd}`;
      if (document.getElementById('doge-rate')) document.getElementById('doge-rate').innerText = `$${data.dogecoin.usd}`;
    })
    .catch(error => console.error('Error fetching crypto rates:', error));
}

// Generate a random order number.
function generateOrderNumber() {
  return 'ORD-' + Math.floor(Math.random() * 1000000);
}

// Mapping for crypto currency codes.
const cryptoNames = {
  btc: "BTC",
  monero: "XMR",
  bnb: "BNB",
  usdt: "USDT",
  eth: "ETH",
  doge: "DOGE"
};

// Handle purchase submission on checkout page.
function handlePurchase(event) {
  event.preventDefault();
  
  const order = JSON.parse(localStorage.getItem('order'));
  if (!order) {
    alert('No order details found.');
    return;
  }
  
  // Collect buyer details from the form.
  const buyer = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    paymentMethod: document.querySelector('input[name="payment"]:checked').value
  };
  
  // Recalculate shipping and grand total.
  const quantity = parseFloat(order.quantity);
  const shippingCost = (SHIPPING_COST_PER_ITEM * quantity).toFixed(2);
  const subtotal = parseFloat(order.total);
  const grandTotal = (subtotal + parseFloat(shippingCost)).toFixed(2);
  
  // Calculate crypto total based on grand total if a crypto method is selected.
  let cryptoTotal = null;
  if (['btc', 'monero', 'bnb', 'usdt', 'eth', 'doge'].includes(buyer.paymentMethod)) {
    const rateElement = document.getElementById(buyer.paymentMethod + '-rate');
    if (rateElement) {
      const rateText = rateElement.innerText;
      const usdRate = parseFloat(rateText.replace('$', ''));
      if (usdRate && grandTotal) {
        cryptoTotal = (grandTotal / usdRate).toFixed(6);
      }
    }
  }
  
  // Build complete order data including shipping cost and crypto total.
  const orderData = {
    orderNumber: generateOrderNumber(),
    product: order,
    buyer: buyer,
    shippingCost: shippingCost,
    grandTotal: grandTotal,
    cryptoTotal: cryptoTotal
  };
  
  // Send order data to server endpoint.
  fetch('https://gueroshop.onrender.com/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Order processed:', data);
      // Save complete order data for the confirmation page.
      localStorage.setItem('order', JSON.stringify(orderData));
      window.location.href = 'confirmation.html';
    })
    .catch(error => console.error('Error processing order:', error));
}

// Handle contact form submission.
function sendContactMessage(event) {
  event.preventDefault();
  const contactData = {
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    message: document.getElementById('contact-message').value
  };
  fetch('https://gueroshop.onrender.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Contact message processed:', data);
      alert('Your message has been sent. We will get back to you soon.');
      document.getElementById('contact-form').reset();
    })
    .catch(error => console.error('Error processing contact message:', error));
}

// Update payment instructions based on selected payment method.
function updatePaymentInstructions() {
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const instructionsEl = document.getElementById('payment-instructions');
  let instructionsText = '';

  switch (paymentMethod) {
    case 'interac':
      instructionsText = 'Please send your payment via Interac Email Transfer to your-email@example.com. Include your order number in the message.';
      break;
    case 'btc':
      instructionsText = 'Please send your Bitcoin payment to BTC_ADDRESS_HERE. Use the current conversion rate shown above.';
      break;
    case 'monero':
      instructionsText = 'Please send your Monero payment to MONERO_ADDRESS_HERE. Use the current conversion rate shown above.';
      break;
    case 'bnb':
      instructionsText = 'Please send your Binance Coin payment to BNB_ADDRESS_HERE. Use the current conversion rate shown above.';
      break;
    case 'usdt':
      instructionsText = 'Please send your Tether payment to USDT_ADDRESS_HERE. Use the current conversion rate shown above.';
      break;
    case 'eth':
      instructionsText = 'Please send your Ethereum payment to ETH_ADDRESS_HERE. Use the current conversion rate shown above.';
      break;
    case 'doge':
      instructionsText = 'Please send your Dogecoin payment to DOGE_ADDRESS_HERE. Use the current conversion rate shown above.';
      break;
    default:
      instructionsText = '';
  }
  instructionsEl.innerText = instructionsText;
}

// Attach event listeners to payment radio buttons.
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', () => {
    updatePaymentInstructions();
    populateOrderDetails(); // Recalculate order summary when payment changes.
  });
});

// Initialize payment instructions on page load.
if (document.getElementById('payment-instructions')) {
  updatePaymentInstructions();
}

// On index page, populate products.
if (document.querySelector('.products')) {
  populateProducts();
}

// On checkout page, populate order details and fetch crypto rates.
if (document.getElementById('order-details')) {
  populateOrderDetails();
  fetchCryptoRates();
}
