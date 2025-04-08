import React, { useRef, useEffect } from 'react';

interface ECGTraceProps {
  width?: number;
  height?: number;
  color?: string;
  glowColor?: string; 
  glowIntensity?: number;
  onComplete?: () => void;
}

export function ECGTrace({
  width = 800,
  height = 200,
  color = '#4ADEBD',
  glowColor = 'rgba(74, 222, 189, 0.6)',
  glowIntensity = 10,
  onComplete
}: ECGTraceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Make sure we get pixel-perfect lines
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // ECG parameters
    const amplitude = height * 0.25; // Height of the waves
    const baseline = height / 2;     // Middle of the canvas
    const speed = 2;                 // Speed of trace movement
    
    let position = 0;                // Current x position
    let cleared = false;             // Flag to track if canvas was cleared for next animation run
    let animationFrameId: number;    // Animation frame ID for cleanup
    
    // Define ECG pattern points as ratios
    const pattern = [
      // P wave (small bump)
      { dx: 0.01, dy: 0.05 },
      { dx: 0.02, dy: 0.1 },
      { dx: 0.03, dy: 0 },
      
      // PR segment (flat)
      { dx: 0.04, dy: 0 },
      
      // QRS complex (the spike)
      { dx: 0.05, dy: -0.1 },  // Q wave
      { dx: 0.06, dy: 1 },     // R wave (main spike)
      { dx: 0.07, dy: -0.2 },  // S wave
      
      // ST segment (flat)
      { dx: 0.12, dy: 0 },
      
      // T wave (rounded bump)
      { dx: 0.16, dy: 0.2 },
      { dx: 0.2, dy: 0 },
      
      // TP segment (flat interval between beats)
      { dx: 0.4, dy: 0 }
    ];
    
    // Calculate total pattern width in relative units
    const totalPatternWidth = pattern[pattern.length - 1].dx;
    
    // Clear the canvas with a fade effect
    const clearCanvas = () => {
      if (!ctx) return;
      
      // Create gradient effect for clearing - darker in center, full clear at edges
      const fadeWidth = width * 0.05;
      ctx.globalCompositeOperation = 'destination-out';
      
      // Gradually fade out the existing content
      const gradient = ctx.createLinearGradient(0, 0, fadeWidth, 0);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, fadeWidth, height);
      
      // Reset composition mode
      ctx.globalCompositeOperation = 'source-over';
    };
    
    // Draw a segment of the ECG
    const drawECGSegment = (x: number, y: number) => {
      if (!ctx) return;
      
      // Set line style
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      
      // Add a glow effect
      if (glowIntensity > 0) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowIntensity;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      // Draw the trace
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + speed, y);
      ctx.stroke();
    };
    
    // Calculate y position based on pattern and current x
    const getYPosition = (x: number): number => {
      // Convert absolute position to relative pattern position
      const patternPosition = (x / width) % totalPatternWidth;
      
      // Find the segment we're in
      let startPoint = pattern[0];
      let endPoint = pattern[pattern.length - 1];
      
      for (let i = 0; i < pattern.length - 1; i++) {
        if (patternPosition >= pattern[i].dx && patternPosition <= pattern[i + 1].dx) {
          startPoint = pattern[i];
          endPoint = pattern[i + 1];
          break;
        }
      }
      
      // Interpolate y position based on current x position relative to segment
      const segmentProgress = (patternPosition - startPoint.dx) / (endPoint.dx - startPoint.dx);
      const interpolatedY = startPoint.dy + segmentProgress * (endPoint.dy - startPoint.dy);
      
      // Scale to canvas and apply baseline
      return baseline - interpolatedY * amplitude;
    };
    
    // Animation function
    const animate = () => {
      // Clear a thin slice of the canvas ahead of the trace for a nice fade effect
      clearCanvas();
      
      // Calculate current y position based on pattern 
      const y = getYPosition(position);
      
      // Draw the next segment of the ECG trace
      drawECGSegment(position, y);
      
      // Advance position
      position += speed;
      
      // Check if we've completed 2 full patterns (one full cycle)
      if (position > width * totalPatternWidth * 2) {
        // If this is the first time we've reached the end
        if (!cleared) {
          // Clear canvas for next animation
          ctx.clearRect(0, 0, width, height);
          cleared = true;
          
          // Call onComplete callback if provided
          if (onComplete) {
            onComplete();
          }
          
          // Cancel the animation
          cancelAnimationFrame(animationFrameId);
          return;
        }
      }
      
      // Continue animation
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start the animation
    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, color, glowColor, glowIntensity, onComplete]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%' }}
      className="ecg-trace-canvas"
    />
  );
}