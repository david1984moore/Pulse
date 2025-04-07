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
  color = '#00FF00',
  width = 160,
  height = 30
}: EkgAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dataBufferRef = useRef<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [animationId, setAnimationId] = useState(0);
  
  // Pre-generate a realistic ECG pattern based on the SciChart example
  const generateEcgPattern = () => {
    // We'll create a pattern that's approximately 2 seconds of ECG
    const pattern: number[] = [];
    const patternLength = 100;
    
    // Baseline
    for (let i = 0; i < 10; i++) pattern.push(0);
    
    // P-wave (small bump)
    for (let i = 0; i < 6; i++) {
      pattern.push(Math.sin(i / 6 * Math.PI) * 0.15);
    }
    
    // Back to baseline briefly
    for (let i = 0; i < 6; i++) pattern.push(0);
    
    // QRS complex
    pattern.push(-0.05); // Q-wave (small downward deflection)
    pattern.push(-0.1);
    pattern.push(0.05);  // Moving up to R
    pattern.push(0.9);   // R-wave (sharp upward spike)
    pattern.push(1.0);
    pattern.push(0.9);
    pattern.push(0.0);   // Moving down to S
    pattern.push(-0.35); // S-wave (downward after R)
    pattern.push(-0.2);
    pattern.push(-0.1);
    pattern.push(0.0);   // Back to baseline
    
    // ST segment (flat)
    for (let i = 0; i < 10; i++) pattern.push(0);
    
    // T-wave (rounded bump)
    for (let i = 0; i < 10; i++) {
      pattern.push(Math.sin(i / 10 * Math.PI) * 0.3);
    }
    
    // Back to baseline for remainder 
    while (pattern.length < patternLength) {
      pattern.push(0);
    }
    
    return pattern;
  };
  
  // Initialize the data buffer
  useEffect(() => {
    // Generate the pattern and repeat it to fill the buffer
    const ecgPattern = generateEcgPattern();
    const fullBuffer: number[] = [];
    
    // Fill buffer with multiple repetitions of the pattern
    for (let i = 0; i < 10; i++) {
      fullBuffer.push(...ecgPattern);
    }
    
    dataBufferRef.current = fullBuffer;
  }, []);
  
  // Draw one frame of the ECG animation
  const drawFrame = (scrollPosition: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with dark blue background like SciChart example
    ctx.fillStyle = '#0B0B2D';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid (dark blue lines)
    ctx.strokeStyle = '#1C1C45';
    ctx.lineWidth = 0.8;
    
    // Major grid lines (vertical)
    for (let i = 0; i <= width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    // Major grid lines (horizontal)
    for (let i = 0; i <= height; i += 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    // Draw the ECG trace
    const dataBuffer = dataBufferRef.current;
    const dataLength = dataBuffer.length;
    const midY = height / 2;
    const amplitude = height * 0.4;
    
    if (dataLength === 0) return;
    
    // Set up bright green line style with glow like SciChart
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    
    // Drawing the continuous scrolling line
    ctx.beginPath();
    
    // Start at the leftmost pixel on screen
    const startIndex = Math.floor(scrollPosition) % dataLength;
    let pointsDrawn = 0;
    let currentIndex = startIndex;
    
    while (pointsDrawn < width) {
      const x = pointsDrawn;
      const dataPoint = dataBuffer[currentIndex % dataLength];
      const y = midY - dataPoint * amplitude; // Transform data to screen coordinates
      
      if (pointsDrawn === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      currentIndex++;
      pointsDrawn++;
    }
    
    ctx.stroke();
    
    // Reset shadow blur
    ctx.shadowBlur = 0;
  };
  
  // Animation loop
  useEffect(() => {
    if (!runAnimation || !isVisible) return;
    
    let scrollPosition = 0;
    const scrollSpeed = 1; // Pixels per frame to scroll
    const startTime = Date.now();
    const duration = 6000; // Animation duration in ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Update scroll position
      scrollPosition += scrollSpeed;
      
      // Draw current frame
      drawFrame(scrollPosition);
      
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
        borderRadius: '4px',
        overflow: 'hidden',
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