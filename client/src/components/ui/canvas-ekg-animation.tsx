import React, { useRef, useEffect } from 'react';

interface CanvasEkgAnimationProps {
  runAnimation: boolean;
  width: number | string;
  height: number | string;
  backgroundColor: string;
}

export default function CanvasEkgAnimation({ 
  runAnimation, 
  width = '100%', 
  height = 40,
  backgroundColor = '#3B82F6' 
}: CanvasEkgAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const positionRef = useRef<number>(0);

  // ECG pattern parameters
  const ekgPattern = [
    { x: 0, y: 0.5 },    // Start at midpoint
    { x: 0.1, y: 0.5 },  // Flat line
    { x: 0.15, y: 0.2 }, // P wave
    { x: 0.2, y: 0.5 },  // Back to baseline
    { x: 0.25, y: 0.5 }, // Flat before QRS
    { x: 0.3, y: 0.1 },  // Q wave
    { x: 0.35, y: 0.9 }, // R peak (tall)
    { x: 0.4, y: 0.1 },  // S wave (dip)
    { x: 0.45, y: 0.5 }, // Back to baseline
    { x: 0.5, y: 0.5 },  // ST segment
    { x: 0.6, y: 0.7 },  // T wave
    { x: 0.7, y: 0.5 },  // Back to baseline
    { x: 0.8, y: 0.5 },  // Flat line continues
    { x: 1.0, y: 0.5 }   // End at midpoint
  ];

  // Clear canvas and set background
  const clearCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  };

  // Draw the ECG line from start position to current position
  const drawEkgLine = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    position: number
  ) => {
    const lineWidth = 2;
    const scaleFactor = width * 0.75; // Allow for some padding
    const cycleWidth = width * 0.3; // One ECG cycle takes 30% of canvas width
    
    // Set up the glowing line effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add glow effect
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.beginPath();
    
    // Calculate how many complete cycles to draw
    const cycles = Math.floor(position / cycleWidth);
    const remainingWidth = position % cycleWidth;
    const normalizedRemaining = remainingWidth / cycleWidth;
    
    // Draw the completed full cycles
    for (let c = 0; c < cycles; c++) {
      const cycleStartX = c * cycleWidth;
      
      // Draw each segment in the pattern for this cycle
      for (let i = 0; i < ekgPattern.length - 1; i++) {
        const startX = cycleStartX + ekgPattern[i].x * cycleWidth;
        const startY = height * (1 - ekgPattern[i].y);
        const endX = cycleStartX + ekgPattern[i + 1].x * cycleWidth;
        const endY = height * (1 - ekgPattern[i + 1].y);
        
        if (i === 0 && c === 0) {
          ctx.moveTo(startX, startY);
        }
        ctx.lineTo(endX, endY);
      }
    }
    
    // Draw the partial cycle
    if (normalizedRemaining > 0) {
      const cycleStartX = cycles * cycleWidth;
      
      // Find the appropriate points to draw in the partial cycle
      for (let i = 0; i < ekgPattern.length - 1; i++) {
        const pt1 = ekgPattern[i];
        const pt2 = ekgPattern[i + 1];
        
        // Skip if this segment is beyond our current position
        if (pt1.x > normalizedRemaining) break;
        
        const startX = cycleStartX + pt1.x * cycleWidth;
        const startY = height * (1 - pt1.y);
        
        // If the next point is beyond position, we need to interpolate
        if (pt2.x > normalizedRemaining) {
          const ratio = (normalizedRemaining - pt1.x) / (pt2.x - pt1.x);
          const endX = cycleStartX + normalizedRemaining * cycleWidth;
          const endY = height * (1 - (pt1.y + ratio * (pt2.y - pt1.y)));
          
          if (i === 0 && cycles === 0) {
            ctx.moveTo(startX, startY);
          }
          ctx.lineTo(endX, endY);
          break;
        } else {
          const endX = cycleStartX + pt2.x * cycleWidth;
          const endY = height * (1 - pt2.y);
          
          if (i === 0 && cycles === 0) {
            ctx.moveTo(startX, startY);
          }
          ctx.lineTo(endX, endY);
        }
      }
    }
    
    // Draw the trail/fade effect
    const gradient = ctx.createLinearGradient(
      Math.max(0, position - width * 0.3), 0, 
      position, 0
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
    
    ctx.strokeStyle = gradient;
    ctx.stroke();
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get actual canvas dimensions
    const { width, height } = canvas;
    
    // Clear canvas
    clearCanvas(ctx, width, height);
    
    // Update position
    positionRef.current += width / 200; // Speed of animation
    
    // Draw ECG line
    drawEkgLine(ctx, width, height, positionRef.current);
    
    // Stop when line reaches the end
    if (positionRef.current > width * 1.3) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    // Continue animation
    animationRef.current = requestAnimationFrame(animate);
  };

  // Start or stop animation based on runAnimation prop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get actual canvas dimensions
    const { width, height } = canvas;
    
    // Set canvas background initially
    clearCanvas(ctx, width, height);
    
    // Start animation if runAnimation is true
    if (runAnimation) {
      // Reset position
      positionRef.current = 0;
      
      // Start animation
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Stop animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Clear canvas
      clearCanvas(ctx, width, height);
    }
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [runAnimation]);

  return (
    <canvas 
      ref={canvasRef} 
      width={typeof width === 'number' ? width : 300}
      height={typeof height === 'number' ? height : 40}
      style={{ 
        width: typeof width === 'string' ? width : `${width}px`, 
        height: typeof height === 'string' ? height : `${height}px`,
        display: 'block',
      }}
    />
  );
}