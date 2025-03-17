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

// Function to populate products on the index page.
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

// Function to save the selected product and redirect to checkout.
function buyNow(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    const quantity = document.getElementById(`qty-${product.id}`).value;
    // Save order details in localStorage; total is calculated in dollars.
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

// On the checkout page, populate order summary from localStorage.
function populateOrderDetails() {
  const container = document.getElementById('order-details');
  const order = JSON.parse(localStorage.getItem('order'));
  if (order && container) {
    container.innerHTML = `
      <p>Product: ${order.name}</p>
      <p>Price: $${order.price}</p>
      <p>Quantity: ${order.quantity}</p>
      <p>Total: $${order.total}</p>
    `;
  }
}

// Function to fetch live crypto conversion rates using the Coingecko API.
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

// Mapping for crypto currency codes for display.
const cryptoNames = {
  btc: "BTC",
  monero: "XMR",
  bnb: "BNB",
  usdt: "USDT",
  eth: "ETH",
  doge: "DOGE"
};

// Handle purchase submission on the checkout page.
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

  // Calculate crypto total if a crypto payment method is selected.
  let cryptoTotal = null;
  if (['btc', 'monero', 'bnb', 'usdt', 'eth', 'doge'].includes(buyer.paymentMethod)) {
    const rateElement = document.getElementById(buyer.paymentMethod + '-rate');
    if (rateElement) {
      const rateText = rateElement.innerText; // e.g. "$40000"
      const usdRate = parseFloat(rateText.replace('$',''));
      const dollarTotal = parseFloat(order.total);
      if (usdRate && dollarTotal) {
        cryptoTotal = (dollarTotal / usdRate).toFixed(6); // 6 decimals for crypto value
      }
    }
  }
  
  // Build complete order data, including crypto total if applicable.
  const orderData = {
    orderNumber: generateOrderNumber(),
    product: order,
    buyer: buyer,
    cryptoTotal: cryptoTotal // null if not applicable
  };

  // Send the order data to your server endpoint.
  fetch('https://gueroshop.onrender.com/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Order processed:', data);
      // Save the complete order data (including crypto total) for the confirmation page.
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

// Attach event listeners to payment radio buttons for updating instructions.
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', updatePaymentInstructions);
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
