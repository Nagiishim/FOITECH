// ---------------------------
// Foitech - Frontend (Flutterwave)
// ---------------------------

// ---------- Products ----------
const PRODUCTS = [
  {id:1, title:'Creative Portfolio Template', price:19, image:'https://source.unsplash.com/280x200/?design', desc:'Modern portfolio template', category:'Templates', download:'#'},
  {id:2, title:'Business Startup Guide eBook', price:15, image:'https://source.unsplash.com/280x200/?book', desc:'Step-by-step startup guide', category:'eBooks', download:'#'},
  {id:3, title:'UI Kit Pro', price:29, image:'https://source.unsplash.com/280x200/?ui', desc:'Components for designers', category:'UI Kits', download:'#'},
  {id:4, title:'Marketing eBook', price:12, image:'https://source.unsplash.com/280x200/?marketing', desc:'Marketing strategies guide', category:'eBooks', download:'#'},
  {id:5, title:'Mobile App Template', price:25, image:'https://source.unsplash.com/280x200/?app', desc:'Complete app template', category:'Templates'}
];

// ---------- DOM ----------
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortDropdown = document.getElementById('sort-price');

const modal = document.getElementById('product-modal');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-product-name');
const modalDesc = document.getElementById('modal-product-desc');
const modalPrice = document.getElementById('modal-product-price');
const modalBuyBtn = document.getElementById('modal-buy-btn');
const modalClose = document.querySelector('.modal .close');

const cartModal = document.getElementById('cart-modal');
const cartItemsDiv = document.getElementById('cart-items');
const closeCartBtn = document.querySelector('.close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const bankTransferBtn = document.getElementById('bank-transfer-btn');
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const cartTotalP = document.getElementById('cart-total');

let currentPage = 1;
const productsPerPage = 4;
let cart = [];

// ---------- Render Products ----------
function renderProducts(products){
  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const start = (currentPage - 1) * productsPerPage;
  const paginated = products.slice(start, start + productsPerPage);

  productGrid.innerHTML = '';
  if(paginated.length === 0){
    productGrid.innerHTML = '<p>No products found.</p>';
    return;
  }

  paginated.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <div class="product-info">
        <h3>${p.title}</h3>
        <p>$${p.price}</p>
        <button class="btn view-btn">View</button>
      </div>
    `;
    card.querySelector('.view-btn').addEventListener('click', ()=> openModal(p));
    productGrid.appendChild(card);
  });

  renderPagination(totalPages, products);
}

function renderPagination(totalPages, products){
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = '';
  for(let i=1;i<=totalPages;i++){
    const b = document.createElement('button');
    b.textContent = i;
    if(i === currentPage) b.classList.add('active');
    b.addEventListener('click', ()=> {
      currentPage = i;
      renderProducts(products);
    });
    paginationDiv.appendChild(b);
  }
}

// ---------- Modal ----------
function openModal(product){
  modalImage.src = product.image;
  modalName.textContent = product.title;
  modalDesc.textContent = product.desc;
  modalPrice.textContent = `$${product.price}`;
  modalBuyBtn.onclick = ()=> addToCart(product.id);
  modal.style.display = 'block';
  modal.classList.add('show');
}
modalClose.onclick = ()=> closeModal(modal);
window.addEventListener('click', e => { if(e.target === modal){ closeModal(modal); }});
function closeModal(m){ m.classList.remove('show'); setTimeout(()=>{ m.style.display = 'none'; }, 250); }

// ---------- Cart ----------
function addToCart(productId){
  const product = PRODUCTS.find(p => p.id === productId);
  if(!product) return;
  cart.push(product);
  renderCart();
  closeModal(modal);
  openCart();
}

function renderCart(){
  cartItemsDiv.innerHTML = '';
  cartCount.textContent = cart.length;
  if(cart.length === 0){
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    cartTotalP.textContent = '';
    return;
  }

  let total = 0;
  cart.forEach((p, idx) => {
    total += p.price;
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `<p>${p.title} - $${p.price}</p><div><button class="remove-btn" data-index="${idx}">Remove</button></div>`;
    cartItemsDiv.appendChild(item);
  });

  cartTotalP.textContent = `Total: $${total}`;

  document.querySelectorAll('.remove-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const idx = Number(e.target.dataset.index);
      cart.splice(idx,1);
      renderCart();
    });
  });
}

function openCart(){
  cartModal.style.display = 'block';
  cartModal.classList.add('show');
  renderCart();
}

// open via icon
cartIcon.addEventListener('click', ()=> openCart());
closeCartBtn.addEventListener('click', ()=> { cartModal.style.display = 'none'; });
window.addEventListener('click', e => { if(e.target === cartModal) cartModal.style.display = 'none'; });

// ---------- Checkout / Flutterwave ----------
const FLUTTERWAVE_PUBLIC_KEY = "FLWPUBK-466a6d44b23c9074221cbf240fe62797-X"; // your public key

checkoutBtn.addEventListener('click', ()=> {
  const email = document.getElementById('customer-email').value?.trim();
  if(cart.length === 0){ alert('Your cart is empty'); return; }
  if(!email || !validateEmail(email)){ alert('Please enter a valid email'); return; }

  const total = cart.reduce((s,p)=>s+p.price,0);

  // Prepare product list for metadata
  const purchasedProducts = cart.map(p => `${p.title} ($${p.price})`).join(', ');

  // Flutterwave checkout options — includes many payment methods
  FlutterwaveCheckout({
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: 'FOITECH_' + Date.now(),
    amount: total,
    currency: "NGN",
    payment_options: "card,account,ussd,nqr,banktransfer,mobilemoneyghana,enaira",
    customer: {
      email: email,
      name: "Foitech Customer"
    },
    customization: {
      title: "Foitech Digital Products",
      description: purchasedProducts,
      logo: "https://yourwebsite.com/logo.png"
    },
    callback: function (data) {
      // data contains transaction_id, tx_ref, status, etc.
      showDownloadModal(cart);
      cart = [];
      renderCart();
      cartModal.style.display = 'none';
      // NOTE: verify transaction server-side with your secret key (important for security)
    },
    onclose: function() {
      alert('Payment window closed.');
    }
  });
});

// ---------- Bank Transfer (Manual) ----------
bankTransferBtn.addEventListener('click', ()=> {
  const email = document.getElementById('customer-email').value?.trim();
  if(cart.length === 0){ alert('Your cart is empty'); return; }
  if(!email || !validateEmail(email)){ alert('Please enter a valid email'); return; }

  // Show manual bank transfer instructions in a modal
  const instructions = `
    <h2>Manual Bank Transfer</h2>
    <p>Transfer the total amount to the account below, then click "I have paid" to confirm.</p>
    <ul style="text-align:left;color:#fff;">
      <li><strong>Bank:</strong> Access Bank</li>
      <li><strong>Account Name:</strong> Foitech (or your sister's name)</li>
      <li><strong>Account Number:</strong> 1234567890</li>
      <li><strong>Amount:</strong> $${cart.reduce((s,p)=>s+p.price,0)}</li>
    </ul>
    <p>After transfer, send a screenshot to support@foitech.com or click "I have paid" below.</p>
    <button id="i-paid-btn" class="btn">I have paid</button>
  `;
  showHtmlModal(instructions);

  // handle "I have paid" after modal shows (delegate)
  document.addEventListener('click', function handler(e){
    if(e.target && e.target.id === 'i-paid-btn'){
      alert('Thanks — we received your payment request. We will confirm within a few minutes and send download links.');
      closeHtmlModal();
      document.removeEventListener('click', handler);
      // Optionally: record pending order, email customer, etc.
      cart = [];
      renderCart();
      cartModal.style.display = 'none';
    }
  });
});

// ---------- Download Modal (on successful payment) ----------
function showDownloadModal(purchasedArray){
  // purchasedArray: list of product objects
  const links = purchasedArray.map(p => `<li><a href="${p.download}" download>${p.title}</a></li>`).join('');
  const html = `
    <h2>Payment successful — download your products</h2>
    <p style="text-align:left;color:#fff;">Click the links below to download your purchases. (Placeholders for now — replace with your real file URLs.)</p>
    <ul style="text-align:left;color:#fff;">${links}</ul>
    <div style="margin-top:12px;"><button id="close-download" class="btn">Close</button></div>
  `;
  showHtmlModal(html);

  document.addEventListener('click', function closeHandler(e){
    if(e.target && e.target.id === 'close-download'){
      closeHtmlModal();
      document.removeEventListener('click', closeHandler);
    }
  });
}

// ---------- Utility: Generic HTML modal for custom content ----------
let _htmlModalEl = null;
function showHtmlModal(innerHtml){
  if(_htmlModalEl) _htmlModalEl.remove();
  _htmlModalEl = document.createElement('div');
  _htmlModalEl.className = 'modal';
  _htmlModalEl.innerHTML = `<div class="modal-content">${innerHtml}<span class="close-html" style="position:absolute;right:12px;top:8px;color:#cfcfcf;cursor:pointer;font-size:20px">&times;</span></div>`;
  document.body.appendChild(_htmlModalEl);
  _htmlModalEl.style.display = 'block';
  _htmlModalEl.classList.add('show');

  _htmlModalEl.querySelector('.close-html').addEventListener('click', ()=> closeHtmlModal());
  _htmlModalEl.addEventListener('click', e => { if(e.target === _htmlModalEl) closeHtmlModal(); });
}
function closeHtmlModal(){
  if(!_htmlModalEl) return;
  _htmlModalEl.classList.remove('show');
  setTimeout(()=>{ _htmlModalEl.remove(); _htmlModalEl = null; }, 250);
}

// ---------- Filters / Search / Sort ----------
filterButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.category;
    let filtered = (cat === 'All') ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
    const q = searchInput.value.trim().toLowerCase();
    if(q) filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
    currentPage = 1;
    renderProducts(filtered);
  });
});

searchInput.addEventListener('input', e=>{
  const q = e.target.value.trim().toLowerCase();
  const active = document.querySelector('.filter-btn.active');
  let filtered = PRODUCTS;
  if(active && active.dataset.category !== 'All') filtered = PRODUCTS.filter(p => p.category === active.dataset.category);
  if(q) filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
  currentPage = 1;
  renderProducts(filtered);
});

sortDropdown.addEventListener('change', ()=>{
  const mode = sortDropdown.value;
  const active = document.querySelector('.filter-btn.active');
  let filtered = active && active.dataset.category !== 'All' ? PRODUCTS.filter(p=>p.category===active.dataset.category) : PRODUCTS.slice();
  const q = searchInput.value.trim().toLowerCase();
  if(q) filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
  if(mode === 'low') filtered.sort((a,b)=>a.price-b.price);
  if(mode === 'high') filtered.sort((a,b)=>b.price-a.price);
  currentPage = 1;
  renderProducts(filtered);
});

// ---------- Scroll animations ----------
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add('visible');
    else entry.target.classList.remove('visible');
  });
},{threshold:0.12});
sections.forEach(s => { s.classList.add('hidden'); observer.observe(s); });

// ---------- Helpers ----------
function validateEmail(email){
  return /\S+@\S+\.\S+/.test(email);
}

// ---------- Initial render ----------
renderProducts(PRODUCTS);
renderCart();
