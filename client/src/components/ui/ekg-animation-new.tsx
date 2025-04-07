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
  const svgRef = useRef<SVGSVGElement>(null);
  const [position, setPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Simplified ECG line with no background - just the trace
  useEffect(() => {
    if (!runAnimation) {
      setIsVisible(false);
      return;
    }
    
    setIsVisible(true);
    let animationFrame: number;
    let startTime: number;
    
    // Animation function
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Move at a constant speed - complete cycle takes about 5 seconds
      const newPosition = (elapsed / 5000) % 1;
      setPosition(newPosition);
      
      // Continue animation until total duration is reached
      if (elapsed < 7000) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Animation finished
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [runAnimation, onComplete]);
  
  // Don't render when not visible
  if (!isVisible) return null;
  
  // Calculate path from position
  const createEcgPath = () => {
    // The viewBox is wider than the visible area to allow for smooth scrolling
    const totalWidth = width * 2;
    // Initial path is at position based on current animation progress
    const startX = -width + (position * width * 2);
    const midY = height / 2;
    
    // Draw a single ECG cycle
    return `
      M ${startX},${midY}
      h 10
      
      <!-- P Wave (small bump) -->
      c 2,0 3,-5 5,-5 s 3,5 5,5
      
      <!-- PR Interval (straight line) -->
      h 5
      
      <!-- QRS Complex (main spike) -->
      l 1,2 1,-20 3,25 2,-7
      
      <!-- ST Segment (straight line) -->
      h 8
      
      <!-- T Wave (rounded bump) -->
      c 2,0 3,-7 5,-7 s 3,7 5,7
      
      <!-- Baseline -->
      h 25
      
      <!-- Start another cycle -->
      <!-- P Wave (small bump) -->
      c 2,0 3,-5 5,-5 s 3,5 5,5
      
      <!-- PR Interval (straight line) -->
      h 5
      
      <!-- QRS Complex (main spike) -->
      l 1,2 1,-20 3,25 2,-7
      
      <!-- ST Segment (straight line) -->
      h 8
      
      <!-- T Wave (rounded bump) -->
      c 2,0 3,-7 5,-7 s 3,7 5,7
      
      <!-- Baseline to end -->
      h 25
    `;
  };
  
  return (
    <span className="ekg-inline-wrapper" style={{ marginLeft: '8px', display: 'inline-block' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'hidden' }}
      >
        <path
          d={createEcgPath()}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="ecg-line"
        />
      </svg>
    </span>
  );
}