/* main.js */

// ----- PRODUCTS & GLOBAL SETTINGS -----
// Each product now includes its own shippingCost (placeholder values).
const products = [
  { id: 1, name: "Item 1", description: "Description for item 1.", price: "11.00", image: "images/item1.png", shippingCost: 3.00 },
  { id: 2, name: "Item 2", description: "Description for item 2.", price: "12.00", image: "images/item2.png", shippingCost: 4.00 },
  { id: 3, name: "Item 3", description: "Description for item 3.", price: "13.00", image: "images/item3.png", shippingCost: 3.50 },
  { id: 4, name: "Item 4", description: "Description for item 4.", price: "14.00", image: "images/item4.png", shippingCost: 5.00 },
  { id: 5, name: "Item 5", description: "Description for item 5.", price: "15.00", image: "images/item5.png", shippingCost: 4.50 },
  { id: 6, name: "Item 6", description: "Description for item 6.", price: "16.00", image: "images/item6.png", shippingCost: 3.75 },
  { id: 7, name: "Item 7", description: "Description for item 7.", price: "17.00", image: "images/item7.png", shippingCost: 4.25 },
  { id: 8, name: "Item 8", description: "Description for item 8.", price: "18.00", image: "images/item8.png", shippingCost: 5.00 },
  { id: 9, name: "Item 9", description: "Description for item 9.", price: "19.00", image: "images/item9.png", shippingCost: 3.00 },
  { id: 10, name: "Item 10", description: "Description for item 10.", price: "20.00", image: "images/item10.png", shippingCost: 4.00 },
  { id: 11, name: "Item 11", description: "Description for item 11.", price: "21.00", image: "images/item11.png", shippingCost: 3.50 },
  { id: 12, name: "Item 12", description: "Description for item 12.", price: "22.00", image: "images/item12.png", shippingCost: 4.50 },
  { id: 13, name: "Item 13", description: "Description for item 13.", price: "23.00", image: "images/item13.png", shippingCost: 5.00 },
  { id: 14, name: "Item 14", description: "Description for item 14.", price: "24.00", image: "images/item14.png", shippingCost: 4.25 },
  { id: 15, name: "Item 15", description: "Description for item 15.", price: "25.00", image: "images/item15.png", shippingCost: 3.75 },
  { id: 16, name: "Item 16", description: "Description for item 16.", price: "26.00", image: "images/item16.png", shippingCost: 4.00 },
  { id: 17, name: "Item 17", description: "Description for item 17.", price: "27.00", image: "images/item17.png", shippingCost: 3.50 },
  { id: 18, name: "Item 18", description: "Description for item 18.", price: "28.00", image: "images/item18.png", shippingCost: 5.00 },
  { id: 19, name: "Item 19", description: "Description for item 19.", price: "29.00", image: "images/item19.png", shippingCost: 4.25 },
  { id: 20, name: "Item 20", description: "Description for item 20.", price: "30.00", image: "images/item20.png", shippingCost: 3.75 }
];

// ----- INDEX PAGE FUNCTIONS -----
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
      <p>Shipping: $${product.shippingCost}</p>
      <p>Quantity: <input type="number" id="qty-${product.id}" value="1" min="1"></p>
      <button onclick="buyNow(${product.id})">Buy Now</button>
    `;
    container.appendChild(prodDiv);
  });
}

function buyNow(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    const quantity = document.getElementById(`qty-${product.id}`).value;
    const subtotal = (product.price * quantity).toFixed(2);
    // Save order details in localStorage with the product-specific shipping cost.
    localStorage.setItem('order', JSON.stringify({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      total: subtotal,
      shippingCost: (product.shippingCost * quantity).toFixed(2)
    }));
    window.location.href = 'checkout.html';
  }
}

// ----- CHECKOUT PAGE FUNCTIONS -----
// Populate order details including shipping and grand total (and crypto total if applicable).
function populateOrderDetails() {
  const container = document.getElementById('order-details');
  let order = JSON.parse(localStorage.getItem('order'));
  if (order && container) {
    const quantity = parseFloat(order.quantity);
    // Use the shippingCost already stored in order.
    const shippingCost = order.shippingCost;
    const subtotal = parseFloat(order.total);
    const grandTotal = (subtotal + parseFloat(shippingCost)).toFixed(2);
    
    // Determine payment method either from stored buyer data or the current selection.
    let paymentMethod = "";
    if (order.buyer && order.buyer.paymentMethod) {
      paymentMethod = order.buyer.paymentMethod;
    } else {
      paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    }
    
    let cryptoLine = "";
    if (['btc', 'monero', 'bnb', 'usdt', 'eth', 'doge'].includes(paymentMethod)) {
      const rateEl = document.getElementById(paymentMethod + '-rate');
      if (rateEl) {
        const rateText = rateEl.innerText; // e.g., "$40000"
        const usdRate = parseFloat(rateText.replace('$', ''));
        if (usdRate && grandTotal) {
          const cryptoTotal = (grandTotal / usdRate).toFixed(6);
          cryptoLine = `<p><strong>Total in ${paymentMethod.toUpperCase()}:</strong> ${cryptoTotal}</p>`;
          order.cryptoTotal = cryptoTotal;
        }
      }
    }
    
    // Update order with grand total.
    order.grandTotal = grandTotal;
    localStorage.setItem('order', JSON.stringify(order));
    
    container.innerHTML = `
      <p><strong>Product:</strong> ${order.name}</p>
      <p><strong>Price (USD):</strong> $${order.price}</p>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Subtotal (USD):</strong> $${order.total}</p>
      <p><strong>Shipping (USD):</strong> $${shippingCost}</p>
      <p><strong>Grand Total (USD):</strong> $${grandTotal}</p>
      ${cryptoLine}
    `;
  }
}

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

// ----- FORM HANDLING -----
function generateOrderNumber() {
  return 'ORD-' + Math.floor(Math.random() * 1000000);
}

function handlePurchase(event) {
  event.preventDefault();
  
  let order = JSON.parse(localStorage.getItem('order'));
  if (!order) {
    alert('No order details found.');
    return;
  }
  
  // Collect buyer details.
  const buyer = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    paymentMethod: document.querySelector('input[name="payment"]:checked').value
  };
  
  // Recalculate shipping and grand total.
  const quantity = parseFloat(order.quantity);
  const shippingCost = order.shippingCost; // Already stored from product selection.
  const subtotal = parseFloat(order.total);
  const grandTotal = (subtotal + parseFloat(shippingCost)).toFixed(2);
  
  // Calculate crypto total if applicable.
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
  
  // Build complete order data.
  const orderData = {
    orderNumber: generateOrderNumber(),
    product: order,
    buyer: buyer,
    shippingCost: shippingCost,
    grandTotal: grandTotal,
    cryptoTotal: cryptoTotal
  };
  
  // Send order data to the server.
  fetch('https://gueroshop.onrender.com/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Order processed:', data);
      localStorage.setItem('order', JSON.stringify(orderData));
      window.location.href = 'confirmation.html';
    })
    .catch(error => console.error('Error processing order:', error));
}

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

function updatePaymentInstructions() {
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const instructionsEl = document.getElementById('payment-instructions');
  let instructionsText = paymentInstructions[paymentMethod] || '';
  instructionsEl.innerText = instructionsText;
}

// ----- EVENT LISTENERS -----
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', () => {
    updatePaymentInstructions();
    populateOrderDetails();
  });
});

if (document.getElementById('payment-instructions')) {
  updatePaymentInstructions();
}

if (document.querySelector('.products')) {
  populateProducts();
}

if (document.getElementById('order-details')) {
  populateOrderDetails();
  fetchCryptoRates();
}
