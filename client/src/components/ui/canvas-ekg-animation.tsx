import React, { useEffect, useRef } from 'react';

interface CanvasEkgAnimationProps {
  active: boolean;
  backgroundColor?: string;
  lineColor?: string;
  width?: number;
  height?: number;
}

export default function CanvasEkgAnimation({ 
  active, 
  backgroundColor = "rgba(0, 0, 0, 0)", 
  lineColor = "#FFFFFF",
  width = 800,
  height = 120
}: CanvasEkgAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Function to draw the ECG pattern
  const drawEkg = (ctx: CanvasRenderingContext2D, elapsed: number) => {
    const { width, height } = ctx.canvas;
    const centerY = height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set background if specified
    if (backgroundColor !== "rgba(0, 0, 0, 0)") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Calculate animation progress (0 to 1)
    const duration = 2000; // 2 seconds for one full cycle
    const progress = Math.min((elapsed % duration) / duration, 1);
    
    // Leading edge position
    const leadX = width * progress;
    
    // Draw the ECG pattern
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Set up glow effect
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Start at the left edge
    ctx.moveTo(0, centerY);
    
    // Draw more efficiently with fewer points - calculate key points 
    // only rather than every pixel (performance optimization)
    const step = 6; // Larger step size means fewer calculations
    
    // Only draw up to the current position based on progress
    for (let x = 0; x <= leadX; x += step) {
      let y = centerY;
      const normalizedX = x / width;
      
      // Create realistic ECG pattern with fewer calculations
      // Baseline
      if (normalizedX < 0.1) {
        y = centerY;
      }
      // P wave
      else if (normalizedX >= 0.1 && normalizedX < 0.2) {
        const pPhase = (normalizedX - 0.1) / 0.1;
        y = centerY - 5 * Math.sin(pPhase * Math.PI); 
      }
      // PR segment
      else if (normalizedX >= 0.2 && normalizedX < 0.25) {
        y = centerY;
      }
      // QRS complex (key feature - keep more detail here)
      else if (normalizedX >= 0.25 && normalizedX < 0.27) {
        // Q wave
        const qPhase = (normalizedX - 0.25) / 0.02;
        y = centerY + 7 * qPhase;
      }
      else if (normalizedX >= 0.27 && normalizedX < 0.3) {
        // R wave (big spike)
        const rPhase = (normalizedX - 0.27) / 0.03;
        y = centerY + 7 - 40 * rPhase; 
      }
      else if (normalizedX >= 0.3 && normalizedX < 0.33) {
        // S wave
        const sPhase = (normalizedX - 0.3) / 0.03;
        y = centerY - 33 + 45 * sPhase;
      }
      // ST segment
      else if (normalizedX >= 0.33 && normalizedX < 0.4) {
        y = centerY + 12 - (12 * ((normalizedX - 0.33) / 0.07));
      }
      // T wave
      else if (normalizedX >= 0.4 && normalizedX < 0.5) {
        const tPhase = (normalizedX - 0.4) / 0.1;
        y = centerY - 10 * Math.sin(tPhase * Math.PI);
      }
      // Flatline to the end
      else {
        y = centerY;
      }
      
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    
    // Draw glowing leading edge circle
    if (leadX > 0 && leadX < width) {
      // Calculate y value at the leading edge
      let leadY = centerY;
      const normalizedLeadX = leadX / width;
      
      // Determine Y position using the same pattern logic
      if (normalizedLeadX < 0.1) {
        leadY = centerY;
      } else if (normalizedLeadX >= 0.1 && normalizedLeadX < 0.2) {
        const pPhase = (normalizedLeadX - 0.1) / 0.1;
        leadY = centerY - 5 * Math.sin(pPhase * Math.PI);
      } else if (normalizedLeadX >= 0.2 && normalizedLeadX < 0.25) {
        leadY = centerY;
      } else if (normalizedLeadX >= 0.25 && normalizedLeadX < 0.27) {
        const qPhase = (normalizedLeadX - 0.25) / 0.02;
        leadY = centerY + 7 * qPhase;
      } else if (normalizedLeadX >= 0.27 && normalizedLeadX < 0.3) {
        const rPhase = (normalizedLeadX - 0.27) / 0.03;
        leadY = centerY + 7 - 45 * rPhase;
      } else if (normalizedLeadX >= 0.3 && normalizedLeadX < 0.33) {
        const sPhase = (normalizedLeadX - 0.3) / 0.03;
        leadY = centerY - 38 + 50 * sPhase;
      } else if (normalizedLeadX >= 0.33 && normalizedLeadX < 0.4) {
        leadY = centerY + 12 - (12 * ((normalizedLeadX - 0.33) / 0.07));
      } else if (normalizedLeadX >= 0.4 && normalizedLeadX < 0.5) {
        const tPhase = (normalizedLeadX - 0.4) / 0.1;
        leadY = centerY - 10 * Math.sin(tPhase * Math.PI);
      } else {
        leadY = centerY;
      }
      
      // Draw the glowing dot at the leading edge
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 20;
      ctx.arc(leadX, leadY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Simplified trail effect - just a short gradient line for performance
    // This creates a similar visual effect with much fewer calculations
    if (leadX > 50) { // Only draw trail after we have enough of a line
      const trailLength = Math.min(leadX, 100); // Shorter trail for better performance
      
      const gradient = ctx.createLinearGradient(
        leadX - trailLength, 0, 
        leadX, 0
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 8;
      
      // Draw simplified trail with just 3 points - better performance
      const trailStartX = Math.max(0, leadX - trailLength);
      
      // Find the y-values at start, middle and end points
      const getYAtX = (x: number): number => {
        const normalizedX = x / width;
        
        // Simplified pattern calculation
        if (normalizedX < 0.2) {
          return centerY;
        } else if (normalizedX >= 0.27 && normalizedX < 0.31) {
          // QRS peak (most important visual feature)
          const rPhase = (normalizedX - 0.27) / 0.04;
          if (rPhase < 0.5) {
            return centerY - 30 * rPhase * 2;
          } else {
            return centerY - 30 + 40 * (rPhase - 0.5) * 2;
          }
        } else if (normalizedX >= 0.4 && normalizedX < 0.5) {
          // T-wave
          const tPhase = (normalizedX - 0.4) / 0.1;
          return centerY - 8 * Math.sin(tPhase * Math.PI);
        } else {
          return centerY;
        }
      };
      
      // Draw just the simplified trail with fewer points
      ctx.beginPath();
      ctx.moveTo(trailStartX, getYAtX(trailStartX));
      
      // Add a few key points
      const midX = trailStartX + (leadX - trailStartX) / 2;
      ctx.lineTo(midX, getYAtX(midX));
      ctx.lineTo(leadX, getYAtX(leadX));
      
      ctx.stroke();
    }
    
    // If cycle completed, stop animation if not set to continuous
    if (progress >= 1) {
      return true; // Signal animation completion
    }
    
    return false; // Animation still in progress
  };
  
  // Animation loop with performance optimizations
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    // Calculate elapsed time but don't continuously update
    // This helps prevent performance issues
    const elapsed = timestamp - startTimeRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    
    if (ctx) {
      const isComplete = drawEkg(ctx, elapsed);
      
      // If animation completed, stop the animation loop
      if (isComplete) {
        // Finished one cycle
        if (active) {
          // Only restart if still active (prevents continuous looping)
          startTimeRef.current = timestamp;
          // Schedule next frame only after completing current cycle
          animationFrameId.current = requestAnimationFrame(animate);
        } else {
          // Not active anymore, just stop
          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
          }
        }
      } else if (active) {
        // Still animating current cycle, continue
        animationFrameId.current = requestAnimationFrame(animate);
      }
    }
  };
  
  // Handle animation start/stop
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas initially
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Start or stop animation based on active prop
    if (active) {
      startTimeRef.current = null; // Reset start time
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      // Stop animation and clear canvas
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    // Cleanup on unmount or when active changes
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [active, backgroundColor, lineColor]);
  
  // Resize canvas to match container
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Get the parent container dimensions
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Clear canvas when resizing to prevent distortion
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="ekg-animation-container w-full relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}