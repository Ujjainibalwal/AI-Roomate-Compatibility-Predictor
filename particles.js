/* ============================================
   Particle Background System
   Lightweight canvas-based particle animation
   ============================================ */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;

    // Performance-adaptive particle count
    this.maxParticles = window.innerWidth < 768 ? 40 : 70;
    this.connectionDistance = window.innerWidth < 768 ? 100 : 130;

    this.colors = {
      particle: { r: 124, g: 58, b: 237 },    // Purple
      connection: { r: 6, g: 182, b: 212 },    // Cyan
      particleAlt: { r: 236, g: 72, b: 153 },  // Magenta
    };

    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      const useAlt = Math.random() > 0.7;
      const color = useAlt ? this.colors.particleAlt : this.colors.particle;

      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.5,
        baseOpacity: Math.random() * 0.4 + 0.15,
        opacity: 0,
        color: color,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  bindEvents() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resize();
        this.createParticles();
      }, 200);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  drawParticle(p, time) {
    // Pulsing opacity
    const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.15 + 0.85;
    p.opacity = p.baseOpacity * pulse;

    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
    this.ctx.fill();

    // Subtle glow for larger particles
    if (p.radius > 1.5) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity * 0.1})`;
      this.ctx.fill();
    }
  }

  drawConnections() {
    const conn = this.colors.connection;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectionDistance) {
          const opacity = (1 - dist / this.connectionDistance) * 0.2;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(${conn.r}, ${conn.g}, ${conn.b}, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }

  updateParticles() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges with padding
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;

      // Mouse repulsion
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x -= dx * force * 0.02;
          p.y -= dy * force * 0.02;
        }
      }
    });
  }

  animate() {
    const time = performance.now();
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.updateParticles();
    this.drawConnections();
    this.particles.forEach(p => this.drawParticle(p, time));

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

/* Export for use in app */
window.ParticleSystem = ParticleSystem;
