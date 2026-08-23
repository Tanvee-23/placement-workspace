import React, { useRef, useEffect, useCallback } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 140;
  const MOUSE_RADIUS = 200;

  const createParticles = useCallback((w, h) => {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        hue: Math.random() > 0.5 ? 185 : 295,  // cyan or magenta
        alpha: Math.random() * 0.5 + 0.3,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      w = window.innerWidth;
      h = document.documentElement.scrollHeight;
      canvas.width = w;
      canvas.height = h;
      if (particlesRef.current.length === 0) {
        particlesRef.current = createParticles(w, h);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY + window.scrollY
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Mouse interaction — push particles away gently
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * 0.08;
          p.vy -= Math.sin(angle) * force * 0.08;
        }

        // Dampen velocity
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Draw particle with glow
        const glowAlpha = dist < MOUSE_RADIUS ? p.alpha + (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.4 : p.alpha;
        const glowRadius = dist < MOUSE_RADIUS ? p.radius + (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 2 : p.radius;

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${glowAlpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 65%, 0.6)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < CONNECTION_DIST) {
            const lineAlpha = (1 - cdist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(${p.hue}, 100%, 65%, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw mouse glow orb
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.06)');
        gradient.addColorStop(0.4, 'rgba(167, 139, 250, 0.03)');
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Observe document height changes for canvas resizing
    const resizeObserver = new ResizeObserver(() => {
      const newH = document.documentElement.scrollHeight;
      if (canvas.height !== newH) {
        canvas.height = newH;
        h = newH;
      }
    });
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [createParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
