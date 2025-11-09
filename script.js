// Products Array
const PRODUCTS = [
  {id:1,title:'Creative Portfolio Template',price:19,image:'https://source.unsplash.com/280x200/?design',desc:'Modern portfolio template', download:'#', category:'Templates'},
  {id:2,title:'Business Startup Guide eBook',price:15,image:'https://source.unsplash.com/280x200/?book',desc:'Step-by-step startup guide', download:'#', category:'eBooks'},
  {id:3,title:'UI Kit Pro',price:29,image:'https://source.unsplash.com/280x200/?ui',desc:'Components for designers', download:'#', category:'UI Kits'},
  {id:4,title:'Marketing eBook',price:12,image:'https://source.unsplash.com/280x200/?marketing',desc:'Marketing strategies guide', download:'#', category:'eBooks'},
  {id:5,title:'Mobile App Template',price:25,image:'https://source.unsplash.com/280x200/?app',desc:'Complete app template', download:'#', category:'Templates'}
];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortDropdown = document.getElementById('sort-price');

const modal = document.getElementById('product-modal');
const modalName = document.getElementById('modal-product-name');
const modalDesc = document.getElementById('modal-product-desc');
const modalBuyBtn = document.getElementById('modal-buy-btn');
const closeBtn = document.querySelector('.close');

const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const closeCartBtn = document.querySelector('.close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');

let currentPage = 1;
const productsPerPage = 4;
let cart = [];

// Render Products
function renderProducts(products){
  const totalPages = Math.ceil(products.length / productsPerPage);
  const start = (currentPage-1)*productsPerPage;
  const end = start+productsPerPage;
  const paginated = products.slice(start,end);

  productGrid.innerHTML='';
  if(paginated.length===0){productGrid.innerHTML='<p>No products found.</p>'; return;}

  paginated.forEach(p=>{
    const div = document.createElement('div');
    div.className='product';
    div.innerHTML=`
      <img src="${p.image}" alt="${p.title}">
      <div class="product-info">
        <h3>${p.title}</h3>
        <p>$${p.price}</p>
        <button class="btn view-btn">View</button>
      </div>
    `;
    div.querySelector('.view-btn').addEventListener('click',()=>openModal(p));
    productGrid.appendChild(div);
  });

  renderPagination(totalPages, products);
}

// Pagination
function renderPagination(totalPages, products){
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML='';
  for(let i=1;i<=totalPages;i++){
    const btn = document.createElement('button');
    btn.textContent=i;
    if(i===currentPage) btn.classList.add('active');
    btn.addEventListener('click',()=>{
      currentPage=i;
      renderProducts(products);
    });
    paginationDiv.appendChild(btn);
  }
}

// Product Modal
function openModal(product){
  modalName.textContent = product.title;
  modalDesc.textContent = product.desc;
  modal.style.display='block';
  modal.classList.add('show');
}
closeBtn.addEventListener('click',()=>{
  modal.classList.remove('show');
  setTimeout(()=>{modal.style.display='none'},300);
});
window.addEventListener('click',e=>{
  if(e.target==modal){
    modal.classList.remove('show');
    setTimeout(()=>{modal.style.display='none'},300);
  }
});

// Add to Cart
modalBuyBtn.addEventListener('click',()=>{
  const productTitle = modalName.textContent;
  const product = PRODUCTS.find(p=>p.title===productTitle);
  if(!product) return;

  cart.push(product);
  renderCart();
  modal.classList.remove('show');
  setTimeout(()=>{modal.style.display='none';},300);
});

// Render Cart
function renderCart(){
  cartItems.innerHTML='';
  cartCount.textContent=cart.length;
  if(cart.length===0){cartItems.innerHTML='<p>Your cart is empty.</p>'; return;}

  cart.forEach((p,index)=>{
    const div = document.createElement('div');
    div.className='cart-item';
    div.innerHTML=`<p>${p.title} - $${p.price} <button data-index="${index}" class="remove-btn">Remove</button></p>`;
    cartItems.appendChild(div);
  });

  document.querySelectorAll('.remove-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{
      const idx = e.target.dataset.index;
      cart.splice(idx,1);
      renderCart();
    });
  });
}

// Open Cart Modal
cartIcon.addEventListener('click',()=>{cartModal.style.display='block';});

// Close Cart Modal
closeCartBtn.addEventListener('click',()=>{cartModal.style.display='none';});
window.addEventListener('click',e=>{if(e.target==cartModal) cartModal.style.display='none';});

// Checkout (simulated)
checkoutBtn.addEventListener('click',()=>{
  const email = document.getElementById('customer-email').value;
  if(cart.length===0){alert('Cart is empty!'); return;}
  if(!email){alert('Enter your email!'); return;}
  alert('Checkout simulated!\nProducts: '+cart.map(p=>p.title).join(', ')+'\nEmail: '+email);
  cart=[];
  renderCart();
  cartModal.style.display='none';
});

// Filters
filterButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const category = btn.dataset.category;
    filterButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');

    let filtered = category==='All'?PRODUCTS:PRODUCTS.filter(p=>p.category===category);
    const query = searchInput.value.toLowerCase();
    if(query) filtered = filtered.filter(p=>p.title.toLowerCase().includes(query));
    currentPage=1;
    renderProducts(filtered);
  });
});

// Search
searchInput.addEventListener('input',e=>{
  const query = e.target.value.toLowerCase();
  const activeBtn = document.querySelector('.filter-btn.active');
  let filtered = PRODUCTS;
  if(activeBtn && activeBtn.dataset.category!=='All') filtered = PRODUCTS.filter(p=>p.category===activeBtn.dataset.category);
  filtered = filtered.filter(p=>p.title.toLowerCase().includes(query));
  currentPage=1;
  renderProducts(filtered);
});

// Sort
sortDropdown.addEventListener('change',()=>{
  let filtered = PRODUCTS;
  const activeBtn = document.querySelector('.filter-btn.active');
  if(activeBtn && activeBtn.dataset.category!=='All') filtered = PRODUCTS.filter(p=>p.category===activeBtn.dataset.category);
  const query = searchInput.value.toLowerCase();
  if(query) filtered = filtered.filter(p=>p.title.toLowerCase().includes(query));
  if(sortDropdown.value==='low') filtered.sort((a,b)=>a.price-b.price);
  else if(sortDropdown.value==='high') filtered.sort((a,b)=>b.price-a.price);
  currentPage=1;
  renderProducts(filtered);
});

// Scroll animations
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
},{threshold:0.1});

sections.forEach(section=>section.classList.add('hidden'));
sections.forEach(section=>observer.observe(section));

// Initial Render
renderProducts(PRODUCTS);
