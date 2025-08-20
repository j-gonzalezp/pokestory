import React, { useCallback, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  offset: number;
  radius: number;
  opacity: number;
}

const ParallaxBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

 
  const initParticles = useCallback((canvas: HTMLCanvasElement): Particle[] => {
    const particles: Particle[] = [];
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 20000);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1,
        offset: Math.random() * Math.PI * 2,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    return particles;
  }, []);

  
  const animate = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
   
    ctx.fillStyle = 'rgba(248, 250, 252, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const time = Date.now() * 0.001;
    

    particlesRef.current.forEach((particle) => {
      
      particle.y += particle.speed * 0.5;
      particle.x += Math.sin(time * 0.5 + particle.offset) * 0.3;
      
    
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;
      
    
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.fill();
    });
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    particlesRef.current = initParticles(canvas);
  }, [initParticles]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
 
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    particlesRef.current = initParticles(canvas);
 
    animationFrameRef.current = requestAnimationFrame(animate);
    
  
    window.addEventListener('resize', handleResize);
  
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [animate, handleResize, initParticles]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default ParallaxBackground;
