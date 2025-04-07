import React, { useEffect, useRef } from 'react';

interface AliceEcgProps {
  active: boolean;
  color?: string;
}

export default function AliceEcg({ active, color = "#FFFFFF" }: AliceEcgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const previousPointsRef = useRef<{x: number, y: number}[]>([]);
  
  // Function to draw the ECG line with a glowing effect and trailing fade
  const drawEcgLine = (ctx: CanvasRenderingContext2D, elapsed: number) => {
    const { width, height } = ctx.canvas;
    const centerY = height / 2;
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, width, height);
    
    // Set line style for the main ECG line
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Calculate animation progress
    const cycleTime = 1200; // 1.2 second for one complete cycle
    const progress = (elapsed % cycleTime) / cycleTime;
    const animatedPosition = progress * width;
    
    // Store points for the ECG trace
    const points: {x: number, y: number}[] = [];
    
    // Create ECG pattern data
    for (let i = 0; i <= width; i++) {
      const x = i;
      let y = centerY;
      
      // Normalized position for the pattern (0 to 1)
      const normalizedX = i / width;
      
      // Create the classic ECG pattern
      // Flatline
      if (normalizedX < 0.1) {
        y = centerY;
      }
      // P wave (small bump)
      else if (normalizedX >= 0.1 && normalizedX < 0.2) {
        const pPhase = (normalizedX - 0.1) / 0.1; // 0 to 1 within P wave
        y = centerY - 4 * Math.sin(pPhase * Math.PI);
      }
      // PR segment (brief flat section)
      else if (normalizedX >= 0.2 && normalizedX < 0.25) {
        y = centerY;
      }
      // QRS complex (the main spike)
      else if (normalizedX >= 0.25 && normalizedX < 0.28) {
        // Q wave - small downward deflection
        const qPhase = (normalizedX - 0.25) / 0.03;
        y = centerY + 4 * qPhase;
      }
      else if (normalizedX >= 0.28 && normalizedX < 0.31) {
        // R wave - large upward spike
        const rPhase = (normalizedX - 0.28) / 0.03;
        y = centerY + 4 - 20 * rPhase;
      }
      else if (normalizedX >= 0.31 && normalizedX < 0.34) {
        // S wave - downward deflection after spike
        const sPhase = (normalizedX - 0.31) / 0.03;
        y = centerY - 16 + 22 * sPhase;
      }
      // ST segment (brief flat section)
      else if (normalizedX >= 0.34 && normalizedX < 0.4) {
        y = centerY + 6;
      }
      // T wave (rounded bump)
      else if (normalizedX >= 0.4 && normalizedX < 0.5) {
        const tPhase = (normalizedX - 0.4) / 0.1;
        y = centerY + 6 - 8 * Math.sin(tPhase * Math.PI);
      }
      // Flatline to end
      else {
        y = centerY;
      }
      
      points.push({ x, y });
    }
    
    // Save previous points for trail effect
    if (previousPointsRef.current.length === 0) {
      previousPointsRef.current = [...points];
    }
    
    // Draw the visible portion of the ECG line based on progress
    const visibleIndex = Math.floor(animatedPosition);
    
    // Draw trail/echo effect first (behind main line)
    if (previousPointsRef.current.length > 0) {
      // Draw fading trail with decreasing opacity
      for (let trailFactor = 0.8; trailFactor > 0.1; trailFactor -= 0.2) {
        const trailOpacity = trailFactor * 0.5;
        const trailDistance = Math.floor(15 * trailFactor);
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${trailOpacity})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 3 * trailFactor;
        
        let started = false;
        for (let i = 0; i <= visibleIndex; i++) {
          // Offset indices for trail effect
          const trailIndex = i - trailDistance;
          if (trailIndex < 0 || trailIndex >= previousPointsRef.current.length) continue;
          
          const { x, y } = previousPointsRef.current[trailIndex];
          
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    }
    
    // Draw main bright line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    let started = false;
    for (let i = 0; i <= visibleIndex; i++) {
      const { x, y } = points[i] || { x: 0, y: centerY };
      
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Add bright glowing leading edge
    if (visibleIndex >= 0 && visibleIndex < points.length) {
      const leadPoint = points[visibleIndex];
      ctx.beginPath();
      ctx.arc(leadPoint.x, leadPoint.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 15;
      ctx.fill();
    }
    
    // Store current points for next frame's trail
    if (progress > 0.98) { // Reset trail on cycle completion
      previousPointsRef.current = [];
    } else {
      previousPointsRef.current = [...points];
    }
  };
  
  // Animation loop
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    
    if (ctx) {
      drawEcgLine(ctx, elapsed);
    }
    
    if (active) {
      animationFrameId.current = requestAnimationFrame(animate);
    }
  };
  
  // Effect to start/stop the animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear on mount
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (active) {
      // Reset start time and previous points for smooth animations
      startTimeRef.current = 0;
      previousPointsRef.current = [];
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      // Stop animation and clear canvas when inactive
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [active]);
  
  return (
    <div className="inline-flex items-center justify-center overflow-hidden ml-2">
      <canvas
        ref={canvasRef}
        width={100}
        height={28}
        className="transition-opacity duration-300"
        style={{ 
          opacity: active ? 1 : 0,
          filter: `drop-shadow(0 0 6px ${color})`
        }}
      />
    </div>
  );
}