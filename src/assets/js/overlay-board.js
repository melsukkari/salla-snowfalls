/**
 * Overlay Board Navigation System
 * Dynamic AJAX-based category overlay with smooth animations
 */

(function() {
  'use strict';

  const OverlayBoard = {
    overlay: null,
    backdrop: null,
    content: null,
    closeBtn: null,
    isOpen: false,
    currentUrl: null,

    config: {
      overlayWidth: window.OVERLAY_WIDTH || 90,
      overlayHeight: window.OVERLAY_HEIGHT || 90,
      animationDuration: 300,
      closeOnBackdropClick: true,
      closeOnEscape: true
    },

    init() {
      this.createOverlay();
      this.attachEventListeners();
      this.initCategoryLinks();
    },

    createOverlay() {
      // Create backdrop
      this.backdrop = document.createElement('div');
      this.backdrop.id = 'overlay-backdrop';
      this.backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: opacity ${this.config.animationDuration}ms ease, visibility ${this.config.animationDuration}ms ease;
      `;

      // Create overlay container
      this.overlay = document.createElement('div');
      this.overlay.id = 'category-overlay-board';
      this.overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        width: ${this.config.overlayWidth}vw;
        height: ${this.config.overlayHeight}vh;
        max-width: 1200px;
        max-height: 900px;
        background: #1a1a1a;
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        z-index: 10001;
        opacity: 0;
        visibility: hidden;
        transition: all ${this.config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      `;

      // Create close button
      this.closeBtn = document.createElement('button');
      this.closeBtn.id = 'overlay-close-btn';
      this.closeBtn.innerHTML = '&times;';
      this.closeBtn.setAttribute('aria-label', 'Close overlay');
      this.closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        width: 48px;
        height: 48px;
        border: 2px solid #8A2BE2;
        border-radius: 50%;
        background: rgba(138, 43, 226, 0.1);
        color: #E0E0E0;
        font-size: 32px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        line-height: 1;
      `;
      this.closeBtn.addEventListener('mouseenter', () => {
        this.closeBtn.style.background = '#8A2BE2';
        this.closeBtn.style.transform = 'scale(1.1)';
      });
      this.closeBtn.addEventListener('mouseleave', () => {
        this.closeBtn.style.background = 'rgba(138, 43, 226, 0.1)';
        this.closeBtn.style.transform = 'scale(1)';
      });

      // Create content container
      this.content = document.createElement('div');
      this.content.id = 'overlay-content';
      this.content.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 80px 40px 40px;
        scrollbar-width: thin;
        scrollbar-color: #8A2BE2 #1a1a1a;
      `;

      // Custom scrollbar for webkit
      const style = document.createElement('style');
      style.textContent = `
        #overlay-content::-webkit-scrollbar {
          width: 8px;
        }
        #overlay-content::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        #overlay-content::-webkit-scrollbar-thumb {
          background: #8A2BE2;
          border-radius: 4px;
        }
        #overlay-content::-webkit-scrollbar-thumb:hover {
          background: #9D4EDD;
        }
      `;
      document.head.appendChild(style);

      // Assemble overlay
      this.overlay.appendChild(this.closeBtn);
      this.overlay.appendChild(this.content);
      this.backdrop.appendChild(this.overlay);
      document.body.appendChild(this.backdrop);

      // Responsive adjustments
      if (window.innerWidth < 768) {
        this.overlay.style.width = '95vw';
        this.overlay.style.height = '95vh';
        this.content.style.padding = '70px 20px 20px';
      }
    },

    attachEventListeners() {
      // Close button
      this.closeBtn.addEventListener('click', () => this.close());

      // Backdrop click
      if (this.config.closeOnBackdropClick) {
        this.backdrop.addEventListener('click', (e) => {
          if (e.target === this.backdrop) {
            this.close();
          }
        });
      }

      // Escape key
      if (this.config.closeOnEscape) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) {
            this.close();
          }
        });
      }

      // Window resize
      window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
          this.overlay.style.width = '95vw';
          this.overlay.style.height = '95vh';
          this.content.style.padding = '70px 20px 20px';
        } else {
          this.overlay.style.width = `${this.config.overlayWidth}vw`;
          this.overlay.style.height = `${this.config.overlayHeight}vh`;
          this.content.style.padding = '80px 40px 40px';
        }
      });
    },

    initCategoryLinks() {
      // Intercept category links
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="/category/"], a[href*="/categories/"]');
        if (link && window.ENABLE_OVERLAY_NAVIGATION !== false) {
          e.preventDefault();
          const url = link.getAttribute('href');
          this.open(url);
        }
      });
    },

    open(url) {
      if (this.isOpen && this.currentUrl === url) return;

      this.currentUrl = url;
      this.isOpen = true;

      // Show overlay with animation
      this.backdrop.style.visibility = 'visible';
      this.backdrop.style.opacity = '1';
      this.overlay.style.visibility = 'visible';
      
      setTimeout(() => {
        this.overlay.style.opacity = '1';
        this.overlay.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 10);

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Load content
      this.loadContent(url);

      // Pause snow if available
      if (window.SnowWaterfall && window.SnowWaterfall.pause) {
        window.SnowWaterfall.pause();
      }
    },

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.currentUrl = null;

      // Hide with animation
      this.overlay.style.opacity = '0';
      this.overlay.style.transform = 'translate(-50%, -50%) scale(0.9)';
      this.backdrop.style.opacity = '0';

      setTimeout(() => {
        this.backdrop.style.visibility = 'hidden';
        this.overlay.style.visibility = 'hidden';
        this.content.innerHTML = '';
      }, this.config.animationDuration);

      // Unlock body scroll
      document.body.style.overflow = '';

      // Resume snow if available
      if (window.SnowWaterfall && window.SnowWaterfall.resume) {
        window.SnowWaterfall.resume();
      }
    },

    loadContent(url) {
      // Show loading skeleton
      this.content.innerHTML = this.getLoadingSkeleton();

      // Add overlay query parameter
      const overlayUrl = url + (url.includes('?') ? '&' : '?') + 'view=overlay';

      // Fetch content via AJAX
      fetch(overlayUrl, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        this.content.innerHTML = html;
        this.initLoadedContent();
      })
      .catch(error => {
        console.error('Error loading overlay content:', error);
        this.content.innerHTML = this.getErrorMessage();
      });
    },

    getLoadingSkeleton() {
      return `
        <div style="padding: 20px;">
          <div style="height: 40px; background: rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 20px; animation: pulse 1.5s infinite;"></div>
          <div style="height: 200px; background: rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 20px; animation: pulse 1.5s infinite;"></div>
          <div style="height: 200px; background: rgba(255,255,255,0.1); border-radius: 8px; animation: pulse 1.5s infinite;"></div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>
      `;
    },

    getErrorMessage() {
      return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; padding: 40px; color: #E0E0E0;">
          <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
          <h2 style="margin-bottom: 10px; color: #E0E0E0;">حدث خطأ في تحميل المحتوى</h2>
          <p style="color: rgba(224, 224, 224, 0.7); margin-bottom: 20px;">عذراً، لم نتمكن من تحميل هذه الصفحة</p>
          <button onclick="window.OverlayBoard.loadContent('${this.currentUrl}')" style="padding: 12px 24px; background: #8A2BE2; border: none; border-radius: 8px; color: #fff; font-weight: 600; cursor: pointer;">
            إعادة المحاولة
          </button>
        </div>
      `;
    },

    initLoadedContent() {
      // Initialize any interactive elements in loaded content
      const addToCartBtns = this.content.querySelectorAll('.salla-add-to-cart');
      addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          // Trigger Salla's add to cart functionality
          if (window.salla && window.salla.cart) {
            window.salla.cart.addItem(btn.dataset.productId);
          }
        });
      });

      // Handle internal links within overlay
      const internalLinks = this.content.querySelectorAll('a[href*="/category/"], a[href*="/categories/"]');
      internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.loadContent(link.getAttribute('href'));
        });
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => OverlayBoard.init());
  } else {
    OverlayBoard.init();
  }

  // Expose globally for external access
  window.OverlayBoard = OverlayBoard;

})();
