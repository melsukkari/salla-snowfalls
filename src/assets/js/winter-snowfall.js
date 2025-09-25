/**
 * Winter Wonderland Snowfall Animation
 * Canvas-based realistic snowfall effect for Salla themes
 */

class WinterSnowfall {
    constructor(options = {}) {
        this.canvas = options.canvas || document.getElementById('winter-snow-canvas');
        this.ctx = null;
        this.snowflakes = [];
        this.animationId = null;
        
        // Configuration
        this.config = {
            intensity: options.intensity || 'medium',
            windEffect: options.windEffect !== false,
            particleCount: parseInt(options.particleCount) || 150,
            maxSize: options.maxSize || 4,
            minSize: options.minSize || 1,
            fallSpeed: options.fallSpeed || 1,
            windStrength: options.windStrength || 0.5,
            ...options
        };
        
        // Performance settings
        this.isVisible = true;
        this.lastTime = 0;
        this.fps = 60;
        this.fpsInterval = 1000 / this.fps;
        
        this.init();
    }
    
    init() {
        if (!this.canvas) {
            console.warn('Winter Snowfall: Canvas element not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.createSnowflakes();
        this.bindEvents();
        this.start();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        
        // Set canvas styles
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createSnowflakes() {
        this.snowflakes = [];
        
        const intensityMultiplier = {
            'light': 0.5,
            'medium': 1,
            'heavy': 1.8
        };
        
        const count = Math.floor(this.config.particleCount * (intensityMultiplier[this.config.intensity] || 1));
        
        for (let i = 0; i < count; i++) {
            this.snowflakes.push(this.createSnowflake());
        }
    }
    
    createSnowflake() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize,
            speed: Math.random() * 2 + 0.5,
            drift: Math.random() * 2 - 1,
            opacity: Math.random() * 0.8 + 0.2,
            angle: 0,
            spin: Math.random() * 0.02 - 0.01
        };
    }
    
    updateSnowflake(snowflake, deltaTime) {
        // Update position
        snowflake.y += snowflake.speed * this.config.fallSpeed * deltaTime * 0.1;
        
        // Wind effect
        if (this.config.windEffect) {
            snowflake.x += Math.sin(snowflake.angle) * snowflake.drift * this.config.windStrength;
            snowflake.angle += snowflake.spin;
        }
        
        // Reset snowflake when it goes off screen
        if (snowflake.y > this.canvas.height + 10) {
            snowflake.y = -10;
            snowflake.x = Math.random() * this.canvas.width;
        }
        
        if (snowflake.x > this.canvas.width + 10) {
            snowflake.x = -10;
        } else if (snowflake.x < -10) {
            snowflake.x = this.canvas.width + 10;
        }
    }
    
    drawSnowflake(snowflake) {
        this.ctx.save();
        
        // Set snowflake appearance
        this.ctx.globalAlpha = snowflake.opacity;
        this.ctx.fillStyle = '#ffffff';
        
        // Create snowflake shape
        this.ctx.beginPath();
        
        if (snowflake.size > 2) {
            // Larger snowflakes get a more detailed shape
            this.drawDetailedSnowflake(snowflake);
        } else {
            // Small snowflakes are simple circles
            this.ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawDetailedSnowflake(snowflake) {
        const { x, y, size } = snowflake;
        
        this.ctx.translate(x, y);
        this.ctx.rotate(snowflake.angle);
        
        // Draw snowflake arms
        for (let i = 0; i < 6; i++) {
            this.ctx.rotate(Math.PI / 3);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(0, -size);
            this.ctx.moveTo(0, -size * 0.7);
            this.ctx.lineTo(-size * 0.3, -size * 0.9);
            this.ctx.moveTo(0, -size * 0.7);
            this.ctx.lineTo(size * 0.3, -size * 0.9);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
        }
    }
    
    animate(currentTime) {
        if (!this.isVisible) return;
        
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= this.fpsInterval) {
            this.lastTime = currentTime - (deltaTime % this.fpsInterval);
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update and draw snowflakes
            this.snowflakes.forEach(snowflake => {
                this.updateSnowflake(snowflake, deltaTime);
                this.drawSnowflake(snowflake);
            });
        }
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    start() {
        if (!this.animationId) {
            this.lastTime = performance.now();
            this.animate(this.lastTime);
        }
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    pause() {
        this.isVisible = false;
    }
    
    resume() {
        this.isVisible = true;
        if (!this.animationId) {
            this.start();
        }
    }
    
    updateIntensity(intensity) {
        this.config.intensity = intensity;
        this.createSnowflakes();
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.createSnowflakes();
    }
    
    bindEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Handle visibility change for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Handle reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionPreference = (e) => {
            if (e.matches) {
                this.stop();
                this.canvas.style.display = 'none';
            } else {
                this.canvas.style.display = 'block';
                this.start();
            }
        };
        
        mediaQuery.addListener(handleMotionPreference);
        handleMotionPreference(mediaQuery);
        
        // Handle performance optimization based on device
        this.optimizeForDevice();
    }
    
    optimizeForDevice() {
        // Reduce particles on mobile devices
        if (window.innerWidth < 768) {
            this.config.particleCount = Math.floor(this.config.particleCount * 0.6);
            this.fps = 30;
            this.fpsInterval = 1000 / this.fps;
        }
        
        // Further reduce on very small screens
        if (window.innerWidth < 480) {
            this.config.particleCount = Math.floor(this.config.particleCount * 0.4);
            this.fps = 20;
            this.fpsInterval = 1000 / this.fps;
        }
        
        this.createSnowflakes();
    }
    
    destroy() {
        this.stop();
        
        // Remove event listeners
        window.removeEventListener('resize', this.resizeCanvas);
        document.removeEventListener('visibilitychange', this.pause);
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Reset arrays
        this.snowflakes = [];
    }
    
    // Static method for easy initialization
    static init(options = {}) {
        return new WinterSnowfall(options);
    }
}

// Auto-initialize if canvas exists and snow is enabled
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('winter-snow-canvas');
    const isSnowEnabled = document.body.getAttribute('data-snow-enabled') === 'true';
    
    if (canvas && isSnowEnabled) {
        window.winterSnowfall = WinterSnowfall.init({
            canvas: canvas,
            intensity: 'medium',
            windEffect: true,
            particleCount: 150
        });
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WinterSnowfall;
}

// Global access
window.WinterSnowfall = WinterSnowfall;
