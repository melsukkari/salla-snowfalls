/**
 * Fashion Modal System
 * Luxury modal overlays with 90% screen coverage for fashion/cosmetics e-commerce
 */

class FashionModalSystem {
    constructor(options = {}) {
        this.config = {
            coverage: options.coverage || '90%',
            luxuryTransitions: options.luxuryTransitions !== false,
            closeOnOverlay: options.closeOnOverlay !== false,
            closeOnEscape: options.closeOnEscape !== false,
            autoFocus: options.autoFocus !== false,
            ...options
        };
        
        this.activeModals = new Set();
        this.modalContainer = null;
        this.scrollPosition = 0;
        
        this.init();
    }
    
    init() {
        this.createModalContainer();
        this.bindGlobalEvents();
        this.injectStyles();
    }
    
    createModalContainer() {
        this.modalContainer = document.getElementById('fashion-modal-container');
        
        if (!this.modalContainer) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'fashion-modal-container';
            this.modalContainer.className = 'fashion-modal-container';
            document.body.appendChild(this.modalContainer);
        }
    }
    
    injectStyles() {
        if (document.getElementById('fashion-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'fashion-modal-styles';
        styles.textContent = `
            .fashion-modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1020;
                pointer-events: none;
            }
            
            .fashion-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(74, 21, 75, 0.8);
                backdrop-filter: blur(8px);
                opacity: 0;
                transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                pointer-events: auto;
                z-index: 1;
            }
            
            .fashion-modal-overlay.fashion-modal-overlay--active {
                opacity: 1;
            }
            
            .fashion-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                width: ${this.config.coverage};
                max-width: 1200px;
                max-height: 90vh;
                background: var(--fashion-pearl-white, #FEFEFE);
                border-radius: var(--fashion-radius-xl, 24px);
                box-shadow: var(--fashion-shadow-luxury, 0 12px 48px rgba(74, 21, 75, 0.20));
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                pointer-events: auto;
                z-index: 2;
                overflow: hidden;
                border: 1px solid rgba(232, 180, 184, 0.2);
            }
            
            .fashion-modal.fashion-modal--active {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            
            .fashion-modal__header {
                padding: var(--fashion-space-xl, 2rem);
                background: linear-gradient(135deg, var(--fashion-champagne, #F7E7CE) 0%, var(--fashion-pearl-white, #FEFEFE) 100%);
                border-bottom: 1px solid rgba(74, 21, 75, 0.1);
                position: relative;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .fashion-modal__title {
                font-family: var(--fashion-font-heading, 'Playfair Display', serif);
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--fashion-deep-plum, #4A154B);
                margin: 0;
                letter-spacing: -0.02em;
            }
            
            .fashion-modal__close {
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(74, 21, 75, 0.1);
                color: var(--fashion-deep-plum, #4A154B);
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
            }
            
            .fashion-modal__close:hover {
                background: var(--fashion-deep-plum, #4A154B);
                color: var(--fashion-pearl-white, #FEFEFE);
                transform: scale(1.1);
            }
            
            .fashion-modal__close:focus {
                outline: 3px solid var(--fashion-accent-gold, #D4AF37);
                outline-offset: 2px;
            }
            
            .fashion-modal__body {
                padding: var(--fashion-space-xl, 2rem);
                max-height: calc(90vh - 120px);
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: var(--fashion-rose-gold, #E8B4B8) transparent;
            }
            
            .fashion-modal__body::-webkit-scrollbar {
                width: 6px;
            }
            
            .fashion-modal__body::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .fashion-modal__body::-webkit-scrollbar-thumb {
                background: var(--fashion-rose-gold, #E8B4B8);
                border-radius: 3px;
            }
            
            .fashion-modal__footer {
                padding: var(--fashion-space-xl, 2rem);
                background: var(--fashion-warm-beige, #F5F1EB);
                border-top: 1px solid rgba(74, 21, 75, 0.1);
                display: flex;
                gap: var(--fashion-space-md, 1rem);
                justify-content: flex-end;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .fashion-modal {
                    width: 95%;
                    max-height: 95vh;
                    border-radius: var(--fashion-radius-lg, 18px);
                }
                
                .fashion-modal__header,
                .fashion-modal__body,
                .fashion-modal__footer {
                    padding: var(--fashion-space-lg, 1.5rem);
                }
                
                .fashion-modal__title {
                    font-size: 1.25rem;
                }
                
                .fashion-modal__close {
                    width: 36px;
                    height: 36px;
                    font-size: 1.125rem;
                }
            }
            
            @media (max-width: 480px) {
                .fashion-modal {
                    width: 98%;
                    max-height: 98vh;
                    border-radius: var(--fashion-radius-md, 12px);
                }
                
                .fashion-modal__header,
                .fashion-modal__body,
                .fashion-modal__footer {
                    padding: var(--fashion-space-md, 1rem);
                }
                
                .fashion-modal__footer {
                    flex-direction: column;
                }
            }
            
            /* Animation Classes */
            .fashion-modal--slide-up {
                transform: translate(-50%, 100%) scale(1);
            }
            
            .fashion-modal--slide-up.fashion-modal--active {
                transform: translate(-50%, -50%) scale(1);
            }
            
            .fashion-modal--fade-in {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0;
            }
            
            .fashion-modal--fade-in.fashion-modal--active {
                opacity: 1;
            }
            
            /* Body scroll lock */
            .fashion-modal-open {
                overflow: hidden;
                position: fixed;
                width: 100%;
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                .fashion-modal {
                    border: 3px solid #000000;
                }
                
                .fashion-modal__close {
                    border: 2px solid #000000;
                }
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .fashion-modal-overlay,
                .fashion-modal {
                    transition: none !important;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    createModal(options = {}) {
        const modalId = options.id || 'fashion-modal-' + Date.now();
        const modal = {
            id: modalId,
            title: options.title || '',
            content: options.content || '',
            footer: options.footer || '',
            size: options.size || 'default',
            animation: options.animation || 'scale',
            closable: options.closable !== false,
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            onConfirm: options.onConfirm || null
        };
        
        return modal;
    }
    
    open(modalOptions) {
        const modal = this.createModal(modalOptions);
        
        // Lock body scroll
        this.lockBodyScroll();
        
        // Create overlay
        const overlay = this.createOverlay(modal);
        
        // Create modal element
        const modalElement = this.createModalElement(modal);
        
        // Add to container
        this.modalContainer.appendChild(overlay);
        this.modalContainer.appendChild(modalElement);
        
        // Add to active modals
        this.activeModals.add(modal.id);
        
        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('fashion-modal-overlay--active');
            modalElement.classList.add('fashion-modal--active');
        });
        
        // Focus management
        if (this.config.autoFocus) {
            const firstFocusable = modalElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
        }
        
        // Call onOpen callback
        if (modal.onOpen) {
            modal.onOpen(modalElement);
        }
        
        return modal.id;
    }
    
    createOverlay(modal) {
        const overlay = document.createElement('div');
        overlay.className = 'fashion-modal-overlay';
        overlay.setAttribute('data-modal-id', modal.id);
        
        if (this.config.closeOnOverlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close(modal.id);
                }
            });
        }
        
        return overlay;
    }
    
    createModalElement(modal) {
        const modalElement = document.createElement('div');
        modalElement.className = `fashion-modal fashion-modal--${modal.animation}`;
        modalElement.setAttribute('data-modal-id', modal.id);
        modalElement.setAttribute('role', 'dialog');
        modalElement.setAttribute('aria-modal', 'true');
        modalElement.setAttribute('aria-labelledby', `modal-title-${modal.id}`);
        
        // Create header
        const header = document.createElement('div');
        header.className = 'fashion-modal__header';
        
        const title = document.createElement('h2');
        title.className = 'fashion-modal__title';
        title.id = `modal-title-${modal.id}`;
        title.textContent = modal.title;
        
        header.appendChild(title);
        
        if (modal.closable) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'fashion-modal__close';
            closeBtn.innerHTML = '<i class="sicon-close"></i>';
            closeBtn.setAttribute('aria-label', 'إغلاق النافذة');
            closeBtn.addEventListener('click', () => this.close(modal.id));
            header.appendChild(closeBtn);
        }
        
        // Create body
        const body = document.createElement('div');
        body.className = 'fashion-modal__body';
        
        if (typeof modal.content === 'string') {
            body.innerHTML = modal.content;
        } else if (modal.content instanceof HTMLElement) {
            body.appendChild(modal.content);
        }
        
        // Create footer if provided
        modalElement.appendChild(header);
        modalElement.appendChild(body);
        
        if (modal.footer) {
            const footer = document.createElement('div');
            footer.className = 'fashion-modal__footer';
            
            if (typeof modal.footer === 'string') {
                footer.innerHTML = modal.footer;
            } else if (modal.footer instanceof HTMLElement) {
                footer.appendChild(modal.footer);
            }
            
            modalElement.appendChild(footer);
        }
        
        return modalElement;
    }
    
    close(modalId) {
        const overlay = this.modalContainer.querySelector(`[data-modal-id="${modalId}"].fashion-modal-overlay`);
        const modalElement = this.modalContainer.querySelector(`[data-modal-id="${modalId}"].fashion-modal`);
        
        if (!overlay || !modalElement) return;
        
        // Get modal data for callback
        const modal = Array.from(this.activeModals).find(id => id === modalId);
        
        // Animate out
        overlay.classList.remove('fashion-modal-overlay--active');
        modalElement.classList.remove('fashion-modal--active');
        
        // Remove after animation
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
            if (modalElement.parentNode) modalElement.remove();
            
            // Remove from active modals
            this.activeModals.delete(modalId);
            
            // Unlock body scroll if no more modals
            if (this.activeModals.size === 0) {
                this.unlockBodyScroll();
            }
        }, 400);
        
        // Call onClose callback
        if (modal && modal.onClose) {
            modal.onClose();
        }
    }
    
    closeAll() {
        Array.from(this.activeModals).forEach(modalId => {
            this.close(modalId);
        });
    }
    
    lockBodyScroll() {
        this.scrollPosition = window.pageYOffset;
        document.body.style.top = `-${this.scrollPosition}px`;
        document.body.classList.add('fashion-modal-open');
    }
    
    unlockBodyScroll() {
        document.body.classList.remove('fashion-modal-open');
        document.body.style.top = '';
        window.scrollTo(0, this.scrollPosition);
    }
    
    bindGlobalEvents() {
        // ESC key to close modal
        if (this.config.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.activeModals.size > 0) {
                    const lastModalId = Array.from(this.activeModals).pop();
                    this.close(lastModalId);
                }
            });
        }
        
        // Tab trapping for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.activeModals.size > 0) {
                const activeModal = this.modalContainer.querySelector('.fashion-modal--active');
                if (activeModal) {
                    this.trapFocus(e, activeModal);
                }
            }
        });
    }
    
    trapFocus(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    }
    
    // Predefined modal types for fashion/cosmetics
    showProductQuickView(product) {
        const content = this.createProductQuickViewContent(product);
        
        return this.open({
            title: 'نظرة سريعة',
            content: content,
            size: 'large',
            animation: 'slide-up'
        });
    }
    
    showSizeGuide(product) {
        const content = this.createSizeGuideContent(product);
        
        return this.open({
            title: 'دليل المقاسات',
            content: content,
            size: 'medium'
        });
    }
    
    showIngredientsList(product) {
        const content = this.createIngredientsContent(product);
        
        return this.open({
            title: 'المكونات والتركيبة',
            content: content,
            size: 'medium'
        });
    }
    
    showShoppingCart() {
        const content = this.createShoppingCartContent();
        
        return this.open({
            title: 'حقيبة التسوق',
            content: content,
            size: 'large',
            animation: 'slide-up'
        });
    }
    
    createProductQuickViewContent(product) {
        return `
            <div class="fashion-quick-view">
                <div class="fashion-quick-view__gallery">
                    <img src="${product.image || 'https://via.placeholder.com/400x500/E8B4B8/4A154B?text=منتج+فاخر'}" 
                         alt="${product.name || 'منتج فاخر'}" 
                         class="fashion-quick-view__image">
                </div>
                <div class="fashion-quick-view__details">
                    <div class="fashion-product-brand">${product.brand || 'علامة تجارية فاخرة'}</div>
                    <h3 class="fashion-product-title">${product.name || 'منتج فاخر'}</h3>
                    <div class="fashion-product-price">
                        <span class="fashion-price-current">${product.price || '299'} ريال</span>
                        ${product.originalPrice ? `<span class="fashion-price-original">${product.originalPrice} ريال</span>` : ''}
                    </div>
                    <p class="fashion-product-description">${product.description || 'وصف المنتج الفاخر مع تفاصيل الجودة العالية والتصميم الأنيق.'}</p>
                    <div class="fashion-product-options">
                        <div class="fashion-option-group">
                            <label>اللون:</label>
                            <div class="fashion-color-options">
                                <button class="fashion-color-option" style="background: #E8B4B8"></button>
                                <button class="fashion-color-option" style="background: #F7E7CE"></button>
                                <button class="fashion-color-option" style="background: #4A154B"></button>
                            </div>
                        </div>
                        <div class="fashion-option-group">
                            <label>المقاس:</label>
                            <select class="fashion-size-select">
                                <option>S</option>
                                <option>M</option>
                                <option>L</option>
                                <option>XL</option>
                            </select>
                        </div>
                    </div>
                    <div class="fashion-quick-actions">
                        <button class="fashion-btn fashion-btn--primary">أضف إلى السلة</button>
                        <button class="fashion-btn fashion-btn--outline">أضف للمفضلة</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    createSizeGuideContent(product) {
        return `
            <div class="fashion-size-guide">
                <div class="fashion-size-chart">
                    <table class="fashion-size-table">
                        <thead>
                            <tr>
                                <th>المقاس</th>
                                <th>الصدر (سم)</th>
                                <th>الخصر (سم)</th>
                                <th>الأرداف (سم)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>XS</td><td>80-84</td><td>60-64</td><td>86-90</td></tr>
                            <tr><td>S</td><td>84-88</td><td>64-68</td><td>90-94</td></tr>
                            <tr><td>M</td><td>88-92</td><td>68-72</td><td>94-98</td></tr>
                            <tr><td>L</td><td>92-96</td><td>72-76</td><td>98-102</td></tr>
                            <tr><td>XL</td><td>96-100</td><td>76-80</td><td>102-106</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="fashion-size-tips">
                    <h4>نصائح للقياس:</h4>
                    <ul>
                        <li>استخدم شريط قياس مرن</li>
                        <li>قس وأنت ترتدي الملابس الداخلية فقط</li>
                        <li>تأكد من أن الشريط مستقيم حول الجسم</li>
                        <li>لا تشد الشريط بقوة</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    createIngredientsContent(product) {
        return `
            <div class="fashion-ingredients">
                <div class="fashion-ingredients-list">
                    <h4>المكونات الرئيسية:</h4>
                    <ul>
                        <li><strong>حمض الهيالورونيك:</strong> يرطب البشرة بعمق</li>
                        <li><strong>فيتامين C:</strong> يحارب علامات التقدم في السن</li>
                        <li><strong>الكولاجين:</strong> يحسن مرونة البشرة</li>
                        <li><strong>زيت الأرغان:</strong> يغذي ويحمي البشرة</li>
                    </ul>
                </div>
                <div class="fashion-ingredients-benefits">
                    <h4>الفوائد:</h4>
                    <div class="fashion-benefits-grid">
                        <div class="fashion-benefit">
                            <i class="sicon-droplet"></i>
                            <span>ترطيب مكثف</span>
                        </div>
                        <div class="fashion-benefit">
                            <i class="sicon-shield"></i>
                            <span>حماية من الأشعة</span>
                        </div>
                        <div class="fashion-benefit">
                            <i class="sicon-refresh"></i>
                            <span>تجديد الخلايا</span>
                        </div>
                        <div class="fashion-benefit">
                            <i class="sicon-heart"></i>
                            <span>مناسب للبشرة الحساسة</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createShoppingCartContent() {
        return `
            <div class="fashion-shopping-cart">
                <div class="fashion-cart-items">
                    <div class="fashion-cart-item">
                        <img src="https://via.placeholder.com/80x100/E8B4B8/4A154B?text=منتج" alt="منتج" class="fashion-cart-item__image">
                        <div class="fashion-cart-item__details">
                            <h4 class="fashion-cart-item__title">فستان أنيق شتوي</h4>
                            <p class="fashion-cart-item__options">اللون: وردي، المقاس: M</p>
                            <div class="fashion-cart-item__price">299 ريال</div>
                        </div>
                        <div class="fashion-cart-item__quantity">
                            <button class="fashion-qty-btn">-</button>
                            <span class="fashion-qty-value">1</span>
                            <button class="fashion-qty-btn">+</button>
                        </div>
                        <button class="fashion-cart-item__remove">
                            <i class="sicon-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="fashion-cart-summary">
                    <div class="fashion-summary-row">
                        <span>المجموع الفرعي:</span>
                        <span>299 ريال</span>
                    </div>
                    <div class="fashion-summary-row">
                        <span>الشحن:</span>
                        <span>مجاني</span>
                    </div>
                    <div class="fashion-summary-row fashion-summary-total">
                        <span>المجموع:</span>
                        <span>299 ريال</span>
                    </div>
                    <button class="fashion-btn fashion-btn--primary fashion-btn--lg" style="width: 100%; margin-top: 1rem;">
                        إتمام الشراء
                    </button>
                </div>
            </div>
        `;
    }
    
    // Static method for easy initialization
    static init(options = {}) {
        return new FashionModalSystem(options);
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    window.fashionModals = FashionModalSystem.init({
        coverage: '90%',
        luxuryTransitions: true,
        closeOnOverlay: true,
        closeOnEscape: true,
        autoFocus: true
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FashionModalSystem;
}

// Global access
window.FashionModalSystem = FashionModalSystem;
