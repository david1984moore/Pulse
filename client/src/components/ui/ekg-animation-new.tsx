import { useState, useEffect, useRef } from 'react';
import './ekg-animation.css';

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
  color = '#6366f1',
  width = 160,
  height = 30
}: EkgAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animationId, setAnimationId] = useState(0);
  
  // Generate EKG data similar to the Python matplotlib approach
  const generateEkgData = (offset: number, stepSize = 0.05) => {
    const samples = Math.floor(width / stepSize);
    const data = [];
    const midY = height / 2;
    const amplitude = height * 0.3;
    
    for (let i = 0; i < samples; i++) {
      // Normalize x to 0-1 range then adjust for offset
      const x = (i * stepSize);
      const normalizedX = ((x + offset) % width) / width * 2 * Math.PI * 2; // 2 cycles in the visible area
      
      // Base sine wave
      let y = midY;
      
      // Baseline with occasional heartbeat waveform
      // First determine if we're in a heartbeat segment
      const cyclePoint = normalizedX % (2 * Math.PI);
      
      if (cyclePoint > 0.2 && cyclePoint < 1.0) {
        // P wave
        if (cyclePoint < 0.3) {
          y = midY - Math.sin((cyclePoint - 0.2) * 10) * amplitude * 0.3;
        }
        // QRS complex
        else if (cyclePoint >= 0.4 && cyclePoint < 0.6) {
          const qrsPhase = (cyclePoint - 0.4) * 5; // normalize to 0-1 range
          if (qrsPhase < 0.2) {
            // Q wave (small downward)
            y = midY + amplitude * 0.2 * (qrsPhase / 0.2);
          } else if (qrsPhase < 0.5) {
            // R wave (sharp upward)
            y = midY + amplitude * 0.2 - amplitude * 1.0 * ((qrsPhase - 0.2) / 0.3);
          } else if (qrsPhase < 0.8) {
            // S wave (downward after R)
            y = midY - amplitude * 0.8 + amplitude * 1.0 * ((qrsPhase - 0.5) / 0.3);
          } else {
            // Return to baseline
            y = midY + amplitude * 0.2 - amplitude * 0.2 * ((qrsPhase - 0.8) / 0.2);
          }
        }
        // T wave
        else if (cyclePoint >= 0.7 && cyclePoint < 0.9) {
          y = midY - Math.sin((cyclePoint - 0.7) * 5) * amplitude * 0.4;
        }
      }
      
      data.push({ x, y });
    }
    
    return data;
  };
  
  // Draw a frame of the animation
  const drawFrame = (offset: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background for medical look
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      const y = (height * i) / 4;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      const x = (width * i) / 8;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Generate EKG data with current offset
    const ekgData = generateEkgData(offset);
    
    // Draw the EKG line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Create a subtle glow effect
    ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
    ctx.shadowBlur = 3;
    
    // Draw the continuous line
    ekgData.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    
    // Draw glowing dot at the most recent position
    // Find the most recent EKG point (near starting edge)
    const dotPosition = ekgData[5]; // Very close to start, but not the first point
    if (dotPosition) {
      // Outer glow
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.arc(dotPosition.x, dotPosition.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner dot
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'white';
      ctx.arc(dotPosition.x, dotPosition.y, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    }
  };
  
  // Animation loop
  useEffect(() => {
    if (!runAnimation || !isVisible) return;
    
    let offset = 0;
    const speed = 0.5; // Speed of the animation (pixels per frame)
    const startTime = Date.now();
    const duration = 6000; // Animation duration in ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Update offset to scroll the EKG
      offset += speed;
      if (offset > width) {
        offset = 0;
      }
      
      // Draw the current frame
      drawFrame(offset);
      
      // Continue animation if still running
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [runAnimation, isVisible, width, height, color, onComplete]);
  
  // Initialize animation when runAnimation changes
  useEffect(() => {
    if (runAnimation) {
      setIsVisible(false);
      
      // Small delay to ensure clean animation start
      setTimeout(() => {
        setAnimationId(prev => prev + 1);
        setIsVisible(true);
      }, 50);
    } else {
      cancelAnimationFrame(animationRef.current);
      setIsVisible(false);
    }
  }, [runAnimation]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      key={animationId}
      className="ekg-container"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        marginLeft: '8px',
        position: 'relative',
        backgroundColor: 'black',
        borderRadius: '4px',
        overflow: 'hidden',
        animation: 'pulse 2.0s linear infinite',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="ekg-canvas"
      />
    </div>
  );
}