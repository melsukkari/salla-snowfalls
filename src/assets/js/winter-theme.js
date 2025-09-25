/**
 * Winter Wonderland Theme JavaScript
 * Enhanced e-commerce functionality with winter effects
 */

class WinterTheme {
    constructor(options = {}) {
        this.config = {
            enableSnow: options.enableSnow !== false,
            snowIntensity: options.snowIntensity || 'medium',
            winterEffects: options.winterEffects !== false,
            holidayRibbon: options.holidayRibbon !== false,
            colorScheme: options.colorScheme || 'classic',
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.setupWinterEffects();
        this.setupProductCards();
        this.setupHeader();
        this.setupCart();
        this.setupWishlist();
        this.setupSearch();
        this.setupHolidayRibbon();
        this.setupAccessibility();
        this.setupPerformanceOptimizations();
    }
    
    setupWinterEffects() {
        if (!this.config.winterEffects) return;
        
        // Add winter sparkle effects to buttons
        this.addSparkleEffects();
        
        // Add winter hover effects to product cards
        this.addHoverEffects();
        
        // Add celebration effects for successful actions
        this.setupCelebrationEffects();
    }
    
    addSparkleEffects() {
        const buttons = document.querySelectorAll('.winter-btn, .btn, button[type="submit"]');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', this.createSparkleEffect.bind(this));
        });
    }
    
    createSparkleEffect(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createSparkle(
                    rect.left + Math.random() * rect.width,
                    rect.top + Math.random() * rect.height
                );
            }, i * 100);
        }
    }
    
    createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'winter-sparkle-effect';
        sparkle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: var(--winter-gold, #FFD700);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: winterSparkleEffect 0.8s ease-out forwards;
        `;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 800);
    }
    
    addHoverEffects() {
        const productCards = document.querySelectorAll('.product-card, .winter-product-card');
        
        productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(139, 0, 0, 0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });
    }
    
    setupCelebrationEffects() {
        // Add celebration effects for cart additions
        document.addEventListener('salla:cart.item.added', this.celebrateCartAddition.bind(this));
        
        // Add celebration effects for wishlist additions
        document.addEventListener('salla:wishlist.item.added', this.celebrateWishlistAddition.bind(this));
        
        // Add celebration effects for successful purchases
        document.addEventListener('salla:order.created', this.celebrateOrderCreation.bind(this));
    }
    
    celebrateCartAddition(event) {
        this.createCelebrationBurst('🛒', event.detail?.button);
        this.showWinterNotification('تم إضافة المنتج إلى السلة! ❄️', 'success');
    }
    
    celebrateWishlistAddition(event) {
        this.createCelebrationBurst('❤️', event.detail?.button);
        this.showWinterNotification('تم إضافة المنتج إلى المفضلة! ⭐', 'success');
    }
    
    celebrateOrderCreation(event) {
        this.createCelebrationBurst('🎉', null, true);
        this.showWinterNotification('تم إنشاء الطلب بنجاح! شكراً لك! 🎄', 'success');
    }
    
    createCelebrationBurst(emoji, targetElement, isLarge = false) {
        const count = isLarge ? 20 : 10;
        const container = targetElement || document.body;
        const rect = targetElement ? targetElement.getBoundingClientRect() : { 
            left: window.innerWidth / 2, 
            top: window.innerHeight / 2, 
            width: 0, 
            height: 0 
        };
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createCelebrationParticle(
                    emoji,
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    isLarge
                );
            }, i * 50);
        }
    }
    
    createCelebrationParticle(emoji, x, y, isLarge) {
        const particle = document.createElement('div');
        particle.textContent = emoji;
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-size: ${isLarge ? '24px' : '16px'};
            pointer-events: none;
            z-index: 10000;
            animation: winterCelebrationBurst 1.5s ease-out forwards;
        `;
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const velocity = (isLarge ? 200 : 100) + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 100; // Upward bias
        
        particle.style.setProperty('--vx', `${vx}px`);
        particle.style.setProperty('--vy', `${vy}px`);
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }
    
    showWinterNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.winter-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `winter-notification winter-notification--${type}`;
        notification.innerHTML = `
            <div class="winter-notification__content">
                <span class="winter-notification__message">${message}</span>
                <button class="winter-notification__close" aria-label="إغلاق">
                    <i class="sicon-close"></i>
                </button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--winter-gradient-primary);
            color: var(--winter-snow-white);
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: var(--winter-shadow-lg);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        if (type === 'success') {
            notification.style.background = 'var(--winter-gradient-green)';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Close functionality
        const closeBtn = notification.querySelector('.winter-notification__close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto close after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    setupProductCards() {
        // Enhanced product card interactions
        const productCards = document.querySelectorAll('.product-card, .winter-product-card');
        
        productCards.forEach(card => {
            this.enhanceProductCard(card);
        });
        
        // Handle dynamically added product cards
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const newCards = node.querySelectorAll?.('.product-card, .winter-product-card') || [];
                        newCards.forEach(card => this.enhanceProductCard(card));
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    enhanceProductCard(card) {
        // Add quick view functionality
        this.addQuickView(card);
        
        // Add image zoom on hover
        this.addImageZoom(card);
        
        // Add winter-themed loading states
        this.addWinterLoadingStates(card);
    }
    
    addQuickView(card) {
        const quickViewBtn = document.createElement('button');
        quickViewBtn.className = 'winter-quick-view';
        quickViewBtn.innerHTML = '<i class="sicon-eye"></i> نظرة سريعة';
        quickViewBtn.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: var(--winter-gradient-gold);
            color: var(--winter-deep-red);
            border: none;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 10;
        `;
        
        card.style.position = 'relative';
        card.appendChild(quickViewBtn);
        
        card.addEventListener('mouseenter', () => {
            quickViewBtn.style.opacity = '1';
            quickViewBtn.style.transform = 'translateY(0)';
        });
        
        card.addEventListener('mouseleave', () => {
            quickViewBtn.style.opacity = '0';
            quickViewBtn.style.transform = 'translateY(-10px)';
        });
        
        quickViewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openQuickView(card);
        });
    }
    
    addImageZoom(card) {
        const image = card.querySelector('img');
        if (!image) return;
        
        image.style.transition = 'transform 0.3s ease';
        
        card.addEventListener('mouseenter', () => {
            image.style.transform = 'scale(1.1)';
        });
        
        card.addEventListener('mouseleave', () => {
            image.style.transform = 'scale(1)';
        });
    }
    
    addWinterLoadingStates(card) {
        const buttons = card.querySelectorAll('button, .btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('loading')) return;
                
                button.classList.add('loading');
                const originalText = button.innerHTML;
                
                button.innerHTML = '<div class="winter-loading"></div>';
                
                setTimeout(() => {
                    button.classList.remove('loading');
                    button.innerHTML = originalText;
                }, 2000);
            });
        });
    }
    
    openQuickView(card) {
        // Create quick view modal
        const modal = document.createElement('div');
        modal.className = 'winter-quick-view-modal';
        modal.innerHTML = `
            <div class="winter-modal-overlay">
                <div class="winter-modal-content">
                    <button class="winter-modal-close">
                        <i class="sicon-close"></i>
                    </button>
                    <div class="winter-modal-body">
                        <div class="winter-loading-placeholder">
                            <div class="winter-loading"></div>
                            <p>جاري تحميل تفاصيل المنتج...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Close functionality
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = '';
        };
        
        modal.querySelector('.winter-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.winter-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
        
        // ESC key to close
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
    setupHeader() {
        this.setupMobileMenu();
        this.setupStickyHeader();
        this.setupUserDropdowns();
    }
    
    setupMobileMenu() {
        const mobileToggle = document.querySelector('.winter-mobile-toggle');
        const navigation = document.querySelector('.winter-navigation');
        const overlay = document.querySelector('.winter-mobile-overlay');
        
        if (!mobileToggle || !navigation) return;
        
        mobileToggle.addEventListener('click', () => {
            navigation.classList.toggle('winter-navigation--open');
            mobileToggle.classList.toggle('winter-mobile-toggle--active');
            document.body.classList.toggle('winter-mobile-menu-open');
        });
        
        if (overlay) {
            overlay.addEventListener('click', () => {
                navigation.classList.remove('winter-navigation--open');
                mobileToggle.classList.remove('winter-mobile-toggle--active');
                document.body.classList.remove('winter-mobile-menu-open');
            });
        }
    }
    
    setupStickyHeader() {
        const header = document.querySelector('.winter-navigation--sticky');
        if (!header) return;
        
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.classList.add('winter-navigation--scrolled');
            } else {
                header.classList.remove('winter-navigation--scrolled');
            }
            
            // Hide header when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                header.classList.add('winter-navigation--hidden');
            } else {
                header.classList.remove('winter-navigation--hidden');
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    setupUserDropdowns() {
        const dropdowns = document.querySelectorAll('.winter-user-menu, .winter-language-switcher');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('button');
            const menu = dropdown.querySelector('.winter-user-dropdown, .winter-lang-dropdown');
            
            if (!toggle || !menu) return;
            
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('winter-dropdown--open');
                    }
                });
                
                dropdown.classList.toggle('winter-dropdown--open');
                toggle.setAttribute('aria-expanded', dropdown.classList.contains('winter-dropdown--open'));
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('winter-dropdown--open');
                const toggle = dropdown.querySelector('button');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
    
    setupCart() {
        // Enhanced cart functionality with winter effects
        this.setupCartDrawer();
        this.setupCartAnimations();
    }
    
    setupCartDrawer() {
        const cartToggle = document.querySelector('[data-cart-toggle]');
        if (!cartToggle) return;
        
        cartToggle.addEventListener('click', () => {
            this.openCartDrawer();
        });
    }
    
    openCartDrawer() {
        // Implementation for cart drawer with winter styling
        console.log('Opening winter-themed cart drawer');
    }
    
    setupCartAnimations() {
        // Add to cart button animations
        const addToCartButtons = document.querySelectorAll('[data-add-to-cart]');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.animateAddToCart(button);
            });
        });
    }
    
    animateAddToCart(button) {
        // Create flying cart animation
        const rect = button.getBoundingClientRect();
        const cartIcon = document.querySelector('.winter-cart-btn');
        const cartRect = cartIcon ? cartIcon.getBoundingClientRect() : null;
        
        if (!cartRect) return;
        
        const flyingItem = document.createElement('div');
        flyingItem.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 20px;
            height: 20px;
            background: var(--winter-gold);
            border-radius: 50%;
            z-index: 10000;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        
        document.body.appendChild(flyingItem);
        
        setTimeout(() => {
            flyingItem.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingItem.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingItem.style.transform = 'scale(0)';
            flyingItem.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            flyingItem.remove();
        }, 800);
    }
    
    setupWishlist() {
        // Enhanced wishlist functionality
        const wishlistButtons = document.querySelectorAll('[data-add-to-wishlist]');
        
        wishlistButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.animateWishlistAdd(button);
            });
        });
    }
    
    animateWishlistAdd(button) {
        // Heart animation for wishlist
        button.classList.add('winter-wishlist-added');
        
        setTimeout(() => {
            button.classList.remove('winter-wishlist-added');
        }, 1000);
    }
    
    setupSearch() {
        const searchInput = document.querySelector('.winter-search__input');
        if (!searchInput) return;
        
        // Enhanced search with winter styling
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('winter-search--focused');
        });
        
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('winter-search--focused');
        });
    }
    
    setupHolidayRibbon() {
        if (!this.config.holidayRibbon) return;
        
        const ribbon = document.querySelector('.winter-holiday-ribbon');
        if (!ribbon) return;
        
        // Auto-hide ribbon after some time
        setTimeout(() => {
            if (!localStorage.getItem('winter-ribbon-closed')) {
                ribbon.classList.add('winter-ribbon--auto-hide');
            }
        }, 30000); // 30 seconds
    }
    
    setupAccessibility() {
        // Enhanced keyboard navigation
        this.setupKeyboardNavigation();
        
        // Screen reader improvements
        this.setupScreenReaderSupport();
        
        // High contrast mode support
        this.setupHighContrastMode();
    }
    
    setupKeyboardNavigation() {
        // Tab navigation for dropdowns
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close all open dropdowns and modals
                document.querySelectorAll('.winter-dropdown--open').forEach(dropdown => {
                    dropdown.classList.remove('winter-dropdown--open');
                });
                
                const modal = document.querySelector('.winter-quick-view-modal');
                if (modal) modal.remove();
            }
        });
    }
    
    setupScreenReaderSupport() {
        // Add ARIA labels and descriptions
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && button.textContent.trim()) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
    }
    
    setupHighContrastMode() {
        // Detect high contrast mode
        const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        if (isHighContrast) {
            document.body.classList.add('winter-high-contrast');
        }
    }
    
    setupPerformanceOptimizations() {
        // Lazy load images
        this.setupLazyLoading();
        
        // Debounce scroll events
        this.setupScrollOptimization();
        
        // Reduce animations on low-end devices
        this.setupPerformanceMode();
    }
    
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('winter-lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
    
    setupScrollOptimization() {
        let ticking = false;
        
        const optimizedScroll = () => {
            // Scroll-based animations and effects
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(optimizedScroll);
                ticking = true;
            }
        });
    }
    
    setupPerformanceMode() {
        // Detect low-end devices
        const isLowEnd = navigator.hardwareConcurrency < 4 || 
                        navigator.deviceMemory < 4 ||
                        window.innerWidth < 768;
        
        if (isLowEnd) {
            document.body.classList.add('winter-performance-mode');
            
            // Reduce particle effects
            if (window.winterSnowfall) {
                window.winterSnowfall.updateConfig({
                    particleCount: 50,
                    fps: 20
                });
            }
        }
    }
    
    // Static method for easy initialization
    static init(options = {}) {
        return new WinterTheme(options);
    }
}

// Add required CSS animations
const winterAnimations = `
<style>
@keyframes winterSparkleEffect {
    0% { opacity: 1; transform: scale(1) rotate(0deg); }
    100% { opacity: 0; transform: scale(2) rotate(180deg) translateY(-20px); }
}

@keyframes winterCelebrationBurst {
    0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
    100% { 
        opacity: 0; 
        transform: translate(var(--vx, 0), var(--vy, 0)) rotate(720deg); 
    }
}

.winter-wishlist-added {
    animation: winterHeartPulse 1s ease;
}

@keyframes winterHeartPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); color: var(--winter-deep-red); }
}

.winter-navigation--scrolled {
    background: rgba(255, 250, 250, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: var(--winter-shadow-md);
}

.winter-navigation--hidden {
    transform: translateY(-100%);
}

.winter-dropdown--open .winter-user-dropdown,
.winter-dropdown--open .winter-lang-dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.winter-user-dropdown,
.winter-lang-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--winter-snow-white);
    border-radius: var(--winter-radius-md);
    box-shadow: var(--winter-shadow-lg);
    padding: var(--winter-spacing-sm);
    min-width: 200px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all var(--winter-transition-normal);
    z-index: 1000;
}

.winter-dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--winter-spacing-sm);
    padding: var(--winter-spacing-sm) var(--winter-spacing-md);
    color: var(--winter-dark-green);
    text-decoration: none;
    border-radius: var(--winter-radius-sm);
    transition: all var(--winter-transition-fast);
}

.winter-dropdown-item:hover {
    background: var(--winter-cream);
    color: var(--winter-deep-red);
}

.winter-dropdown-divider {
    margin: var(--winter-spacing-sm) 0;
    border: none;
    border-top: 1px solid rgba(139, 0, 0, 0.1);
}

.winter-search--focused {
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
}

.winter-ribbon--auto-hide {
    animation: winterRibbonSlideUp 0.5s ease forwards;
}

@keyframes winterRibbonSlideUp {
    to { transform: translateY(-100%); opacity: 0; }
}

/* Performance mode optimizations */
.winter-performance-mode .winter-sparkles,
.winter-performance-mode .winter-sparkle-effect {
    display: none !important;
}

.winter-performance-mode * {
    animation-duration: 0.1s !important;
    transition-duration: 0.1s !important;
}

/* High contrast mode */
.winter-high-contrast {
    --winter-deep-red: #000000;
    --winter-gold: #ffff00;
    --winter-snow-white: #ffffff;
    --winter-dark-green: #000000;
}
</style>
`;

// Inject animations
if (!document.querySelector('#winter-animations')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'winter-animations';
    styleElement.innerHTML = winterAnimations;
    document.head.appendChild(styleElement);
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    window.winterTheme = WinterTheme.init();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WinterTheme;
}

// Global access
window.WinterTheme = WinterTheme;
