/* main.js */

// Sample product data for 20 items
const products = [];
for (let i = 1; i <= 20; i++) {
  products.push({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}.`,
    price: (10 + i).toFixed(2), // example pricing
    image: 'images/product-placeholder.png'
  });
}

// Function to dynamically populate products on index.html
function populateProducts() {
  const productsContainer = document.querySelector('.products');
  if (!productsContainer) return;
  
  productsContainer.innerHTML = '';
  products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.id = `product-${product.id}`;
    
    productDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <p>Price: $${product.price}</p>
      <p>Quantity: <input type="number" id="qty-${product.id}" value="1" min="1"></p>
      <button onclick="buyNow(${product.id})">Buy Now</button>
    `;
    
    productsContainer.appendChild(productDiv);
  });
}

// Redirect to checkout page with selected product details
function buyNow(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    const quantity = document.getElementById(`qty-${product.id}`).value;
    // Save order details in localStorage
    localStorage.setItem('order', JSON.stringify({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      total: (product.price * quantity).toFixed(2)
    }));
    window.location.href = 'checkout.html';
  }
}

// On checkout page, populate order summary if order exists in localStorage
function populateOrderDetails() {
  const orderDetailsDiv = document.getElementById('order-details');
  const order = JSON.parse(localStorage.getItem('order'));
  if (order && orderDetailsDiv) {
    orderDetailsDiv.innerHTML = `
      <p>Product: ${order.name}</p>
      <p>Price: $${order.price}</p>
      <p>Quantity: ${order.quantity}</p>
      <p>Total: $${order.total}</p>
    `;
  }
}

// Function to fetch live crypto conversion rates using Coingecko API
function fetchCryptoRates() {
  fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,monero,binancecoin,tether&vs_currencies=usd')
    .then(response => response.json())
    .then(data => {
      document.getElementById('btc-rate').innerText = `$${data.bitcoin.usd}`;
      document.getElementById('monero-rate').innerText = `$${data.monero.usd}`;
      document.getElementById('bnb-rate').innerText = `$${data.binancecoin.usd}`;
      document.getElementById('usdt-rate').innerText = `$${data.tether.usd}`;
    })
    .catch(error => console.error('Error fetching crypto rates:', error));
}

// Generate a random order number (for demo purposes)
function generateOrderNumber() {
  return 'ORD-' + Math.floor(Math.random() * 1000000);
}

// Handle purchase submission on checkout page
function handlePurchase(event) {
  event.preventDefault();
  
  const order = JSON.parse(localStorage.getItem('order'));
  if (!order) {
    alert('No order details found.');
    return;
  }
  
  // Collect buyer details from the form
  const buyer = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    paymentMethod: document.querySelector('input[name="payment"]:checked').value
  };
  
  // Create order number
  const orderNumber = generateOrderNumber();
  
  // Build complete order data
  const orderData = {
    orderNumber: orderNumber,
    product: order,
    buyer: buyer
  };
  
  // Send orderData to your server endpoint
  fetch('/api/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Order processed:', data);
    alert(`Order ${orderNumber} created! Please follow the payment instructions sent to your email.`);
    localStorage.removeItem('order');
  })
  .catch(error => console.error('Error processing order:', error));
}

// Handle contact form submission on contact.html
function sendContactMessage(event) {
  event.preventDefault();
  
  const contactData = {
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    message: document.getElementById('contact-message').value
  };
  
  // Send contactData to your server endpoint
  fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
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

// Update payment instructions based on selected payment method
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
    default:
      instructionsText = '';
  }
  instructionsEl.innerText = instructionsText;
}

// Attach event listeners to payment radio buttons
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', updatePaymentInstructions);
});

// Call updatePaymentInstructions initially if element exists
if(document.getElementById('payment-instructions')) {
  updatePaymentInstructions();
}

// If on index page, populate products
if (document.querySelector('.products')) {
  populateProducts();
}

// If on checkout page, populate order details and fetch crypto rates
if (document.getElementById('order-details')) {
  populateOrderDetails();
  fetchCryptoRates();
}
