import { useState, useEffect, useRef } from 'react';

interface EkgAnimationProps {
  runAnimation: boolean;
  onComplete?: () => void;
  color?: string;
  width?: number;
  height?: number;
}

export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#00FF00',
  width = 160,
  height = 30
}: EkgAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const xRef = useRef<number>(0);
  
  // Draw the ECG waveform
  const drawECG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerY = canvas.height / 2;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    
    // Start a new path for the main trace
    ctx.beginPath();
    
    // Draw a classic ECG pattern
    for (let i = 0; i < canvas.width; i++) {
      let x = i;
      let y = centerY;
      
      // Create P wave (small bump)
      if (i >= 10 && i < 20) {
        y = centerY - Math.sin((i - 10) * 0.3) * 3;
      } 
      // Create QRS complex (big spike)
      else if (i >= 30 && i < 50) {
        // Q wave (small downward deflection)
        if (i >= 30 && i < 35) {
          y = centerY + (i - 30) * 1;
        } 
        // R wave (large upward spike)
        else if (i >= 35 && i < 40) {
          y = centerY + 5 - ((i - 35) * 3);
        }
        // S wave (downward deflection after R)
        else if (i >= 40 && i < 50) {
          y = centerY - 10 + ((i - 40) * 2);
        }
      }
      // Create T wave (rounded bump after QRS)
      else if (i >= 60 && i < 80) {
        y = centerY - Math.sin((i - 60) * 0.2) * 5;
      }
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    // Stroke the path
    ctx.stroke();
    
    // Create a subtle glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Update x position for animation
    xRef.current = (xRef.current + 1) % 5;
    if (xRef.current === 0) {
      // Shift the canvas content left by 1 pixel
      const imageData = ctx.getImageData(1, 0, canvas.width - 1, canvas.height);
      ctx.putImageData(imageData, 0, 0);
      // Clear the rightmost pixel
      ctx.clearRect(canvas.width - 1, 0, 1, canvas.height);
    }
    
    // Continue the animation loop
    animationFrameRef.current = requestAnimationFrame(drawECG);
  };
  
  // Handle animation start/stop
  useEffect(() => {
    if (runAnimation) {
      setIsVisible(true);
      
      // Start the animation loop
      animationFrameRef.current = requestAnimationFrame(drawECG);
      
      // Trigger completion after a fixed duration
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 5000);
      
      return () => {
        // Clean up animation and timer
        cancelAnimationFrame(animationFrameRef.current);
        clearTimeout(timer);
      };
    } else {
      setIsVisible(false);
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [runAnimation, onComplete]);
  
  if (!isVisible) return null;

  // Canvas will be inline-block to avoid DOM nesting issues
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle',
        margin: '0 0 0 8px'
      }} 
    />
  );
}