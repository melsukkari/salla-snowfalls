/**
 * Auction Overlay Manager
 * Full-screen overlay navigation system for auction-style product viewing
 */

class AuctionOverlayManager {
  constructor() {
    this.overlays = new Map();
    this.activeOverlay = null;
    this.transitionSpeed = 400;
    this.init();
  }

  init() {
    this.createOverlayStructure();
    this.bindEvents();
    this.loadDynamicContent();
  }

  createOverlayStructure() {
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'auction-overlay-container';
    overlayContainer.className = 'fixed inset-0 z-50 hidden';
    
    overlayContainer.innerHTML = `
      <div class="overlay-backdrop bg-black/80 backdrop-blur-md"></div>
      <div class="overlay-content relative h-full w-full">
        <button class="overlay-close absolute top-4 right-4 z-50 text-white hover:text-red-500 transition-colors">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div class="overlay-body h-full overflow-y-auto"></div>
      </div>
    `;
    
    document.body.appendChild(overlayContainer);
  }

  showOverlay(type, data = {}) {
    const container = document.getElementById('auction-overlay-container');
    const body = container.querySelector('.overlay-body');
    
    // Clear previous content
    body.innerHTML = '';
    
    // Load appropriate template
    switch(type) {
      case 'product':
        this.loadProductOverlay(body, data);
        break;
      case 'category':
        this.loadCategoryOverlay(body, data);
        break;
      case 'auction':
        this.loadAuctionOverlay(body, data);
        break;
      case 'cart':
        this.loadCartOverlay(body, data);
        break;
    }
    
    // Show overlay with animation
    container.classList.remove('hidden');
    setTimeout(() => {
      container.classList.add('active');
      document.body.style.overflow = 'hidden';
    }, 10);
    
    this.activeOverlay = type;
  }

  hideOverlay() {
    const container = document.getElementById('auction-overlay-container');
    container.classList.remove('active');
    
    setTimeout(() => {
      container.classList.add('hidden');
      document.body.style.overflow = '';
      this.activeOverlay = null;
    }, this.transitionSpeed);
  }

  bindEvents() {
    // Close button
    document.addEventListener('click', (e) => {
      if (e.target.closest('.overlay-close') || e.target.closest('.overlay-backdrop')) {
        this.hideOverlay();
      }
    });

    // Keyboard escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeOverlay) {
        this.hideOverlay();
      }
    });
  }

  loadProductOverlay(container, productData) {
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 h-full">
        <!-- Product Gallery -->
        <div class="product-gallery relative">
          <div class="viewer-360 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 flex items-center justify-center">
            <img src="${productData.image}" alt="${productData.name}" 
                 class="max-w-full max-h-[60vh] object-contain transform hover:scale-105 transition-transform duration-500">
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button class="rotate-btn bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white text-sm hover:bg-white/30 transition">
                🔄 360° View
              </button>
            </div>
          </div>
          
          <!-- Thumbnail Strip -->
          <div class="thumbnail-strip mt-4 flex gap-2 overflow-x-auto pb-2">
            ${productData.images.map(img => `
              <img src="${img}" class="w-20 h-20 object-cover rounded cursor-pointer hover:ring-2 ring-accent transition" 
                   onclick="this.parentElement.previousElementSibling.querySelector('img').src='${img}'">
            `).join('')}
          </div>
        </div>
        
        <!-- Product Info -->
        <div class="product-info space-y-6">
          <div>
            <span class="text-accent text-sm font-semibold tracking-wider uppercase">${productData.category}</span>
            <h1 class="text-4xl font-bold text-white mt-2">${productData.name}</h1>
            <div class="flex items-center gap-4 mt-4">
              <span class="text-3xl font-bold text-accent">$${productData.price}</span>
              ${productData.auction ? `
                <span class="bg-red-600 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                  🔥 LIVE AUCTION
                </span>
              ` : ''}
            </div>
          </div>
          
          <!-- Rating -->
          <div class="flex items-center gap-2">
            <div class="flex text-yellow-400">
              ${'★'.repeat(Math.floor(productData.rating))}${'☆'.repeat(5 - Math.floor(productData.rating))}
            </div>
            <span class="text-gray-400 text-sm">(${productData.reviews} reviews)</span>
          </div>
          
          <!-- Description -->
          <p class="text-gray-300 leading-relaxed">${productData.description}</p>
          
          <!-- Specifications -->
          <div class="specs-grid grid grid-cols-2 gap-4">
            ${Object.entries(productData.specs).map(([key, value]) => `
              <div class="bg-white/5 rounded-lg p-3">
                <span class="text-gray-400 text-xs uppercase">${key}</span>
                <p class="text-white font-semibold mt-1">${value}</p>
              </div>
            `).join('')}
          </div>
          
          <!-- Actions -->
          <div class="action-buttons space-y-3 pt-6 border-t border-white/10">
            <div class="flex gap-3">
              <button class="btn-primary flex-1 bg-accent hover:bg-accent/90 text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105">
                ⚡ Buy Now
              </button>
              <button class="btn-cart flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-lg font-semibold transition-all">
                🛒 Add to Cart
              </button>
            </div>
            <button class="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition flex items-center justify-center gap-2">
              ♡ Add to Wishlist
            </button>
          </div>
          
          <!-- Auction Timer (if applicable) -->
          ${productData.auction ? `
            <div class="auction-timer bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-lg p-4 border border-red-500/30">
              <p class="text-red-400 text-sm mb-2">⏰ Auction Ends In:</p>
              <div class="timer-display flex gap-3 text-white font-mono text-2xl">
                <div><span id="hours">00</span><br><small class="text-xs">HRS</small></div>
                <div>:</div>
                <div><span id="minutes">00</span><br><small class="text-xs">MIN</small></div>
                <div>:</div>
                <div><span id="seconds">00</span><br><small class="text-xs">SEC</small></div>
              </div>
              <div class="current-bid mt-3 pt-3 border-t border-white/10">
                <span class="text-gray-400 text-sm">Current Bid:</span>
                <span class="text-2xl font-bold text-green-400 ml-2">$${productData.currentBid}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  loadCategoryOverlay(container, categoryData) {
    container.innerHTML = `
      <div class="category-showcase h-full">
        <div class="category-hero bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-12">
          <h1 class="text-6xl font-bold text-white mb-4">${categoryData.name}</h1>
          <p class="text-xl text-gray-300 max-w-2xl">${categoryData.description}</p>
        </div>
        
        <div class="products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
          ${categoryData.products.map(product => `
            <div class="product-card bg-white/5 backdrop-blur rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all cursor-pointer group"
                 onclick="overlayManager.showOverlay('product', ${JSON.stringify(product).replace(/"/g, '&quot;')})">
              <div class="relative overflow-hidden">
                <img src="${product.image}" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500">
                ${product.auction ? '<span class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs">AUCTION</span>' : ''}
              </div>
              <div class="p-4">
                <h3 class="text-white font-semibold truncate">${product.name}</h3>
                <p class="text-accent font-bold mt-2">$${product.price}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  loadAuctionOverlay(container, auctionData) {
    container.innerHTML = `
      <div class="auction-interface h-full bg-gradient-to-b from-gray-900 to-black p-8">
        <div class="max-w-6xl mx-auto">
          <div class="auction-header text-center mb-8">
            <h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              🔨 Live Auction House
            </h1>
            <p class="text-gray-400 mt-2">Place your bids and win exclusive items</p>
          </div>
          
          <div class="auction-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${auctionData.items.map(item => `
              <div class="auction-item bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:border-accent/50 transition-all">
                <img src="${item.image}" class="w-full h-48 object-cover rounded-lg mb-4">
                <h3 class="text-white font-bold text-lg">${item.name}</h3>
                <div class="flex justify-between items-center mt-3">
                  <div>
                    <p class="text-gray-400 text-sm">Current Bid</p>
                    <p class="text-2xl font-bold text-green-400">$${item.currentBid}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-gray-400 text-sm">Ends In</p>
                    <p class="text-accent font-mono">${item.timeLeft}</p>
                  </div>
                </div>
                <button class="w-full mt-4 bg-gradient-to-r from-accent to-orange-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-accent/50 transition-all">
                  Place Bid
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  loadCartOverlay(container, cartData) {
    container.innerHTML = `
      <div class="cart-overlay h-full bg-gray-900 p-8">
        <h2 class="text-4xl font-bold text-white mb-8">🛒 Your Shopping Cart</h2>
        
        <div class="cart-items space-y-4 max-h-[60vh] overflow-y-auto">
          ${cartData.items.length > 0 ? cartData.items.map(item => `
            <div class="cart-item bg-white/5 rounded-lg p-4 flex gap-4">
              <img src="${item.image}" class="w-24 h-24 object-cover rounded">
              <div class="flex-1">
                <h3 class="text-white font-semibold">${item.name}</h3>
                <p class="text-accent font-bold mt-1">$${item.price}</p>
                <div class="flex items-center gap-2 mt-2">
                  <button class="bg-white/10 text-white px-3 py-1 rounded">-</button>
                  <span class="text-white">${item.quantity}</span>
                  <button class="bg-white/10 text-white px-3 py-1 rounded">+</button>
                </div>
              </div>
              <button class="text-red-400 hover:text-red-600 self-start">✕</button>
            </div>
          `).join('') : '<p class="text-gray-400 text-center py-12">Your cart is empty</p>'}
        </div>
        
        ${cartData.items.length > 0 ? `
          <div class="cart-summary mt-8 pt-6 border-t border-white/10">
            <div class="flex justify-between text-white text-xl mb-4">
              <span>Total:</span>
              <span class="font-bold text-accent">$${cartData.total}</span>
            </div>
            <button class="w-full bg-accent hover:bg-accent/90 text-white py-4 rounded-lg font-bold text-lg transition-all">
              Proceed to Checkout →
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  async loadDynamicContent() {
    // Fetch real product data from Salla API
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      this.productCache = products;
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }
}

// Initialize global overlay manager
window.overlayManager = new AuctionOverlayManager();
