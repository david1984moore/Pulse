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
  
  // Initialize ECG data points for a hospital monitor style
  useEffect(() => {
    // Data pattern for a classic hospital ECG with flat line + heartbeat
    const generateEcgPattern = () => {
      const points: number[] = [];
      
      // Hospital-style ECG pattern (values between -1 and 1)
      // Flat line
      for (let i = 0; i < 50; i++) {
        points.push(0);
      }
      
      // P-wave (small bump)
      for (let i = 0; i < 10; i++) {
        points.push(0.1 * Math.sin(i * Math.PI / 10));
      }
      
      // Slight pause
      for (let i = 0; i < 5; i++) {
        points.push(0);
      }
      
      // QRS complex
      points.push(-0.1); // Q
      points.push(-0.2);
      points.push(0.9);  // R (big spike up)
      points.push(-0.4); // S (drop below baseline)
      points.push(-0.2);
      
      // Return to baseline
      for (let i = 0; i < 5; i++) {
        points.push(-0.1 + (i * 0.1 / 5));
      }
      
      // T-wave
      for (let i = 0; i < 10; i++) {
        points.push(0.2 * Math.sin(i * Math.PI / 10));
      }
      
      // Flat line to end
      for (let i = 0; i < 50; i++) {
        points.push(0);
      }
      
      return points;
    };
    
    dataPointsRef.current = generateEcgPattern();
  }, []);
  
  // Draw the ECG waveform with hospital style
  const drawECG = () => {
    const canvas = canvasRef.current;
    if (!canvas || dataPointsRef.current.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;
    const amplitudeScale = h / 3; // Scale to use 1/3 of the height
    
    // Hospital monitor background style
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, w, h);
    
    // Draw horizontal grid lines (faint)
    ctx.strokeStyle = 'rgba(0, 50, 0, 0.2)';
    ctx.lineWidth = 0.5;
    const gridSize = 5;
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines (faint)
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    // Draw ECG line
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 2;
    ctx.beginPath();
    
    const dataPoints = dataPointsRef.current;
    const totalPoints = dataPoints.length;
    
    for (let i = 0; i < w; i++) {
      // Calculate data point index with offset for scrolling effect
      const dataIndex = (i + Math.floor(offsetXRef.current)) % totalPoints;
      const value = dataPoints[dataIndex];
      
      const y = centerY - (value * amplitudeScale);
      
      if (i === 0) {
        ctx.moveTo(i, y);
      } else {
        ctx.lineTo(i, y);
      }
    }
    
    ctx.stroke();
    
    // Update animation state for next frame
    offsetXRef.current = (offsetXRef.current + 0.5) % totalPoints;
    
    // Continue animation loop
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
        borderRadius: '3px'
      }} 
    />
  );
}