(function () {
  if (window.sallaSnowInitialized) return;
  window.sallaSnowInitialized = true;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'salla-snow-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.95;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  class Snowflake {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height;
      this.size = Math.random() * 3 + 1;
      this.speed = Math.random() * 2 + 0.3;
      this.wind = (Math.random() - 0.5) * 0.8;
      this.opacity = Math.random() * 0.5 + 0.3;
    }
    update() {
      this.y += this.speed;
      this.x += this.wind;
      if (this.y > height) this.y = -10;
      if (this.x > width) this.x = 0;
      if (this.x < 0) this.x = width;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  const flakes = [];
  for (let i = 0; i < 100; i++) flakes.push(new Snowflake());

  function animate() {
    ctx.clearRect(0, 0, width, height);
    flakes.forEach(f => { f.update(); f.draw(); });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });

  animate();
})();
