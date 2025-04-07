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
  color = '#FFFFFF',
  width = 160,
  height = 30
}: EkgAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const offsetXRef = useRef<number>(0);
  const dataPointsRef = useRef<number[]>([]);
  const trailPointsRef = useRef<{x: number, y: number}[]>([]);
  
  // Initialize ECG data points for a sleek, sexy heart monitor trace
  useEffect(() => {
    // Generate the ECG pattern data points
    const generateEcgPattern = () => {
      const points: number[] = [];
      
      // Flat baseline
      for (let i = 0; i < 20; i++) {
        points.push(0);
      }
      
      // P-wave (small bump)
      for (let i = 0; i < 8; i++) {
        points.push(0.08 * Math.sin(i * Math.PI / 8));
      }
      
      // Brief flat segment
      for (let i = 0; i < 3; i++) {
        points.push(0);
      }
      
      // QRS complex - sharper, sexier design
      points.push(-0.05); // Q
      points.push(-0.1);
      points.push(0.8);  // R (tall spike)
      points.push(-0.5); // S (deep drop)
      points.push(-0.2);
      points.push(-0.05);
      
      // ST segment
      for (let i = 0; i < 4; i++) {
        points.push(0);
      }
      
      // T-wave - smoother, more elegant
      for (let i = 0; i < 10; i++) {
        points.push(0.2 * Math.sin(i * Math.PI / 10));
      }
      
      // Return to baseline
      for (let i = 0; i < 20; i++) {
        points.push(0);
      }
      
      return points;
    };
    
    dataPointsRef.current = generateEcgPattern();
  }, []);
  
  // Draw the ECG waveform with a sleek, sexy style
  const drawECG = () => {
    const canvas = canvasRef.current;
    if (!canvas || dataPointsRef.current.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;
    const amplitudeScale = h / 2.5; // Taller amplitude for more dramatic effect
    
    // Clear with transparent background to blend with card header
    ctx.clearRect(0, 0, w, h);
    
    // Save current points for trail effect
    const newPoints: {x: number, y: number}[] = [];
    
    // Draw main ECG line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    
    const dataPoints = dataPointsRef.current;
    const totalPoints = dataPoints.length;
    
    for (let i = 0; i < w; i++) {
      // Calculate data point index with offset for scrolling effect
      const dataIndex = (i + Math.floor(offsetXRef.current)) % totalPoints;
      const value = dataPoints[dataIndex];
      
      const y = centerY - (value * amplitudeScale);
      
      // Save point for trail
      newPoints.push({x: i, y});
      
      if (i === 0) {
        ctx.moveTo(i, y);
      } else {
        ctx.lineTo(i, y);
      }
    }
    
    ctx.stroke();
    
    // Draw trail effect (follow-through)
    if (trailPointsRef.current.length > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      
      // Draw the trail slightly offset
      const trailOffset = 2;
      const trail = trailPointsRef.current;
      
      for (let i = 0; i < trail.length; i++) {
        const point = trail[i];
        if (i === 0) {
          ctx.moveTo(point.x + trailOffset, point.y);
        } else {
          ctx.lineTo(point.x + trailOffset, point.y);
        }
      }
      
      ctx.stroke();
      
      // Draw a second, fainter trail
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      
      for (let i = 0; i < trail.length; i++) {
        const point = trail[i];
        if (i === 0) {
          ctx.moveTo(point.x + (trailOffset * 2), point.y);
        } else {
          ctx.lineTo(point.x + (trailOffset * 2), point.y);
        }
      }
      
      ctx.stroke();
    }
    
    // Update trail points for next frame
    trailPointsRef.current = newPoints;
    
    // Update animation state for next frame - slightly faster for sexier motion
    offsetXRef.current = (offsetXRef.current + 1) % totalPoints;
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(drawECG);
  };
  
  // Handle animation start/stop
  useEffect(() => {
    if (runAnimation) {
      setIsVisible(true);
      
      // Reset trail on new animation
      trailPointsRef.current = [];
      
      // Reset offset for consistent starting position
      offsetXRef.current = 0;
      
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

  // Using canvas with inline-block style to avoid DOM nesting issues
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle',
        margin: '0 0 0 8px',
        borderRadius: '4px'
      }} 
    />
  );
}