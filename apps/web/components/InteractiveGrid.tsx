'use client';
import { useEffect, useRef } from 'react';

export default function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement?.clientHeight || 600;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    window.addEventListener('resize', resize);

    let animationFrameId: number;
    let time = 0;

    // Grid configuration
    const cols = 50;
    const rows = 40;
    const spacingX = 35;
    const spacingY = 35;

    const draw = () => {
      time += 0.01;
      
      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;

      // Clear with white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const points: {x: number, y: number, z: number}[] = [];

      // Generate 3D points
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          let x = (i - cols / 2) * spacingX;
          let z = j * spacingY;
          
          // Subtle terrain wave
          const distFromCenter = Math.sqrt(x * x + (z - 200) * (z - 200));
          let y = Math.sin(distFromCenter * 0.015 - time) * 20 
                + Math.cos(x * 0.03) * 15 
                + Math.sin(z * 0.03) * 15;

          // Subtle Mouse interaction lift
          const projectedMouseZ = Math.max(0, (height - mouseY) * 1.2);
          const projectedMouseX = (mouseX - width / 2) * 1.2;
          
          const dx = x - projectedMouseX;
          const dz = z - projectedMouseZ;
          const distToMouse = Math.sqrt(dx * dx + dz * dz);
          
          if (distToMouse < 200) {
            y += Math.max(0, 1 - distToMouse / 200) * 30;
          }

          // Basic 3D to 2D projection
          const fov = 1000;
          const zOffset = 250;
          const scale = fov / (fov + z + zOffset);
          
          const screenX = width / 2 + x * scale;
          const screenY = height * 0.4 + y * scale + z * 0.5; 

          points.push({ x: screenX, y: screenY, z });
        }
      }

      // Draw grid
      ctx.strokeStyle = `rgba(0, 0, 0, 0.08)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const p = points[j * cols + i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const p = points[j * cols + i];
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();

      // Simple red dot at mouse projection (like original image)
      ctx.fillStyle = '#ef4444'; 
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Subtle trailing ring
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 12, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 right-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
