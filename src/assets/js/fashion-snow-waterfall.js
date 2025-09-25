/**
 * Fashion Snow Waterfall Animation
 * Elegant, subtle snow animation for luxury fashion/cosmetics themes
 */

class FashionSnowWaterfall {
    constructor(options = {}) {
        this.canvas = options.canvas || document.getElementById('fashion-snow-canvas');
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        
        // Luxury Configuration
        this.config = {
            intensity: options.intensity || 'subtle',
            style: options.style || 'waterfall',
            particleCount: parseInt(options.particleCount) || 80,
            elegantMode: options.elegantMode !== false,
            maxSize: options.maxSize || 3,
            minSize: options.minSize || 0.5,
            fallSpeed: options.fallSpeed || 0.8,
            windStrength: options.windStrength || 0.3,
            opacity: options.opacity || 0.6,
            colors: options.colors || ['#E8B4B8', '#F7E7CE', '#D4AF37', '#FEFEFE'],
            ...options
        };
        
        // Performance settings
        this.isVisible = true;
        this.lastTime = 0;
        this.fps = 60;
        this.fpsInterval = 1000 / this.fps;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        
        // Waterfall effect properties
        this.waterfallColumns = [];
        this.columnCount = 0;
        
        this.init();
    }
    
    init() {
        if (!this.canvas) {
            console.warn('Fashion Snow Waterfall: Canvas element not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.createWaterfallColumns();
        this.createParticles();
        this.bindEvents();
        this.start();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        
        // Set canvas styles for luxury appearance
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.opacity = this.config.opacity;
        this.canvas.style.mixBlendMode = 'multiply';
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.devicePixelRatio;
        this.canvas.height = rect.height * this.devicePixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx?.scale(this.devicePixelRatio, this.devicePixelRatio);
        
        // Recalculate columns on resize
        this.createWaterfallColumns();
    }
    
    createWaterfallColumns() {
        this.columnCount = Math.floor(this.canvas.width / (this.devicePixelRatio * 60));
        this.waterfallColumns = [];
        
        for (let i = 0; i < this.columnCount; i++) {
            this.waterfallColumns.push({
                x: (i * 60) + Math.random() * 40,
                intensity: Math.random() * 0.5 + 0.3,
                speed: Math.random() * 0.5 + 0.5,
                particles: []
            });
        }
    }
    
    createParticles() {
        this.particles = [];
        
        const intensityMultiplier = {
            'light': 0.4,
            'subtle': 0.7,
            'medium': 1,
            'heavy': 1.5
        };
        
        const count = Math.floor(this.config.particleCount * (intensityMultiplier[this.config.intensity] || 0.7));
        
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        const column = this.waterfallColumns[Math.floor(Math.random() * this.waterfallColumns.length)];
        
        return {
            x: column ? column.x + (Math.random() * 30 - 15) : Math.random() * this.canvas.width / this.devicePixelRatio,
            y: Math.random() * this.canvas.height / this.devicePixelRatio,
            size: Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize,
            speed: Math.random() * 1.5 + 0.5,
            drift: Math.random() * 1 - 0.5,
            opacity: Math.random() * 0.6 + 0.2,
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            angle: 0,
            spin: Math.random() * 0.02 - 0.01,
            life: Math.random() * 100 + 50,
            maxLife: 150,
            column: column,
            type: Math.random() > 0.7 ? 'sparkle' : 'snow'
        };
    }
    
    updateParticle(particle, deltaTime) {
        const dt = deltaTime * 0.016; // Normalize to 60fps
        
        // Waterfall effect - particles follow column flow
        if (particle.column && this.config.style === 'waterfall') {
            const columnInfluence = 0.3;
            const targetX = particle.column.x + Math.sin(particle.y * 0.01) * 10;
            particle.x += (targetX - particle.x) * columnInfluence * dt;
            particle.speed = particle.column.speed * particle.column.intensity;
        }
        
        // Update position
        particle.y += particle.speed * this.config.fallSpeed * dt * 60;
        
        // Elegant wind effect
        if (this.config.elegantMode) {
            particle.x += Math.sin(particle.angle + particle.y * 0.005) * particle.drift * this.config.windStrength * dt;
            particle.angle += particle.spin;
        }
        
        // Life cycle for sparkles
        if (particle.type === 'sparkle') {
            particle.life -= dt * 60;
            particle.opacity = (particle.life / particle.maxLife) * 0.8;
        }
        
        // Reset particle when it goes off screen or dies
        if (particle.y > this.canvas.height / this.devicePixelRatio + 10 || 
            (particle.type === 'sparkle' && particle.life <= 0)) {
            this.resetParticle(particle);
        }
        
        if (particle.x > this.canvas.width / this.devicePixelRatio + 10) {
            particle.x = -10;
        } else if (particle.x < -10) {
            particle.x = this.canvas.width / this.devicePixelRatio + 10;
        }
    }
    
    resetParticle(particle) {
        particle.y = -10;
        particle.x = particle.column ? 
            particle.column.x + (Math.random() * 30 - 15) : 
            Math.random() * this.canvas.width / this.devicePixelRatio;
        
        if (particle.type === 'sparkle') {
            particle.life = particle.maxLife;
            particle.opacity = Math.random() * 0.6 + 0.2;
        }
    }
    
    drawParticle(particle) {
        this.ctx.save();
        
        // Set particle appearance
        this.ctx.globalAlpha = particle.opacity * this.config.opacity;
        
        if (particle.type === 'sparkle') {
            this.drawSparkle(particle);
        } else {
            this.drawSnowflake(particle);
        }
        
        this.ctx.restore();
    }
    
    drawSnowflake(particle) {
        const { x, y, size, color } = particle;
        
        // Create gradient for luxury effect
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '00'); // Transparent
        
        this.ctx.fillStyle = gradient;
        
        if (size > 1.5) {
            // Detailed snowflake for larger particles
            this.ctx.translate(x, y);
            this.ctx.rotate(particle.angle);
            
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 0.5;
            this.ctx.lineCap = 'round';
            
            // Draw 6-pointed snowflake
            for (let i = 0; i < 6; i++) {
                this.ctx.rotate(Math.PI / 3);
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, -size);
                
                // Add branches
                this.ctx.moveTo(0, -size * 0.6);
                this.ctx.lineTo(-size * 0.3, -size * 0.8);
                this.ctx.moveTo(0, -size * 0.6);
                this.ctx.lineTo(size * 0.3, -size * 0.8);
                
                this.ctx.stroke();
            }
        } else {
            // Simple circle for small particles
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawSparkle(particle) {
        const { x, y, size, color } = particle;
        
        this.ctx.fillStyle = color;
        this.ctx.translate(x, y);
        this.ctx.rotate(particle.angle);
        
        // Draw diamond sparkle
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size * 0.5, 0);
        this.ctx.lineTo(0, size);
        this.ctx.lineTo(-size * 0.5, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add cross lines for sparkle effect
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(-size, 0);
        this.ctx.lineTo(size, 0);
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(0, size);
        this.ctx.stroke();
    }
    
    animate(currentTime) {
        if (!this.isVisible) return;
        
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= this.fpsInterval) {
            this.lastTime = currentTime - (deltaTime % this.fpsInterval);
            
            // Clear canvas with subtle background
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update and draw particles
            this.particles.forEach(particle => {
                this.updateParticle(particle, deltaTime);
                this.drawParticle(particle);
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
        this.createParticles();
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.createParticles();
        
        if (newConfig.opacity !== undefined) {
            this.canvas.style.opacity = newConfig.opacity;
        }
    }
    
    bindEvents() {
        // Handle window resize
        const resizeHandler = () => {
            this.resizeCanvas();
        };
        window.addEventListener('resize', resizeHandler);
        
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
        
        // Performance optimization
        this.optimizeForDevice();
        
        // Store resize handler for cleanup
        this.resizeHandler = resizeHandler;
    }
    
    optimizeForDevice() {
        // Reduce particles and effects on mobile devices
        if (window.innerWidth < 768) {
            this.config.particleCount = Math.floor(this.config.particleCount * 0.5);
            this.fps = 30;
            this.fpsInterval = 1000 / this.fps;
        }
        
        // Further reduce on very small screens
        if (window.innerWidth < 480) {
            this.config.particleCount = Math.floor(this.config.particleCount * 0.3);
            this.fps = 20;
            this.fpsInterval = 1000 / this.fps;
            this.config.opacity *= 0.7;
            this.canvas.style.opacity = this.config.opacity;
        }
        
        // Reduce particles on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            this.config.particleCount = Math.floor(this.config.particleCount * 0.6);
            this.fps = 24;
            this.fpsInterval = 1000 / this.fps;
        }
        
        this.createParticles();
    }
    
    destroy() {
        this.stop();
        
        // Remove event listeners
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Reset arrays
        this.particles = [];
        this.waterfallColumns = [];
    }
    
    // Static method for easy initialization
    static init(options = {}) {
        return new FashionSnowWaterfall(options);
    }
}

// Auto-initialize if canvas exists and snow is enabled
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('fashion-snow-canvas');
    const isSnowEnabled = document.body.getAttribute('data-snow-enabled') === 'true';
    
    if (canvas && isSnowEnabled) {
        window.fashionSnowWaterfall = FashionSnowWaterfall.init({
            canvas: canvas,
            intensity: 'subtle',
            style: 'waterfall',
            particleCount: 80,
            elegantMode: true,
            colors: ['#E8B4B8', '#F7E7CE', '#D4AF37', '#FEFEFE']
        });
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FashionSnowWaterfall;
}

// Global access
window.FashionSnowWaterfall = FashionSnowWaterfall;
