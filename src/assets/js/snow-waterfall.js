/**
 * Snow Waterfall Effect
 * Optimized canvas-based realistic snowfall animation
 * Mobile-safe with automatic disable on small screens
 */

(function() {
  'use strict';

  // Check if mobile device - disable on mobile for performance
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth < 768;
  
  if (isMobile || isSmallScreen) {
    console.log('Snow disabled on mobile/small screen for performance');
    return;
  }

  // Configuration
  const config = {
    flakeCount: window.SNOW_INTENSITY || 120,
    maxSize: 5,
    minSize: 2,
    maxSpeed: 2,
    minSpeed: 0.5,
    wind: 0.3,
    opacity: 0.92
  };

  // Canvas setup
  let canvas, ctx, flakes = [];
  let animationId = null;
  let isPaused = false;
  let scrollTimeout = null;

  function initCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'snow-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: ${config.opacity};
    `;
    document.body.appendChild(canvas);
    
    ctx = canvas.getContext('2d');
    resizeCanvas();
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reinitialize flakes on resize if needed
    if (flakes.length === 0) {
      createFlakes();
    }
  }

  // Snowflake class
  class Snowflake {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
      this.speed = Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
      this.wind = (Math.random() - 0.5) * config.wind;
      this.opacity = Math.random() * 0.6 + 0.4;
      this.swing = Math.random() * 0.5;
      this.swingOffset = Math.random() * Math.PI * 2;
    }

    update() {
      // Vertical movement
      this.y += this.speed;
      
      // Horizontal drift with subtle swing
      this.x += this.wind + Math.sin(this.y * 0.01 + this.swingOffset) * this.swing;
      
      // Reset when flake goes off screen
      if (this.y > canvas.height) {
        this.y = -10;
        this.x = Math.random() * canvas.width;
      }
      
      if (this.x > canvas.width) {
        this.x = 0;
      } else if (this.x < 0) {
        this.x = canvas.width;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function createFlakes() {
    flakes = [];
    for (let i = 0; i < config.flakeCount; i++) {
      flakes.push(new Snowflake());
    }
  }

  function animate() {
    if (isPaused) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    flakes.forEach(flake => {
      flake.update();
      flake.draw();
    });

    animationId = requestAnimationFrame(animate);
  }

  function pauseOnScroll() {
    isPaused = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isPaused = false;
    }, 150);
  }

  function init() {
    initCanvas();
    createFlakes();
    animate();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', pauseOnScroll, { passive: true });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', pauseOnScroll);
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose control methods for external use
  window.SnowWaterfall = {
    pause: () => { isPaused = true; },
    resume: () => { isPaused = false; },
    destroy: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      flakes = [];
    }
  };

})();
