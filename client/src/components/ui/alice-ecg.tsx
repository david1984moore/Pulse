import React, { useEffect, useRef, useState } from 'react';
import './ekg-animation.css';

interface AliceEcgProps {
  active: boolean;
  color?: string;
}

/**
 * Thoroughly rewritten Alice ECG animation with guaranteed completion and 
 * consistent behavior between cycles
 */
export default function AliceEcg({ active, color = "#FFFFFF" }: AliceEcgProps) {
  // Use state to ensure proper re-renders
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // Create refs for animation control
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const shadowRef = useRef<SVGPathElement>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Scale the animation to fit in the header area
  const width = 100;
  const height = 28;
  const centerY = height / 2;
  
  // Define the classic ECG segments for a mini header display
  const segments = [
    // Start at baseline
    `M 0,${centerY} H ${width * 0.15}`,
    
    // P wave - small bump
    `C ${width * 0.18},${centerY} ${width * 0.20},${centerY - height * 0.15} ${width * 0.23},${centerY}`,
    
    // PR segment - flat
    `H ${width * 0.35}`,
    
    // QRS complex - down, sharp up, down
    `L ${width * 0.38},${centerY + height * 0.1}`,
    `L ${width * 0.42},${centerY - height * 0.4}`,
    `L ${width * 0.46},${centerY + height * 0.2}`,
    
    // ST segment - flat
    `H ${width * 0.55}`,
    
    // T wave - smooth rounded bump
    `C ${width * 0.62},${centerY - height * 0.25} ${width * 0.68},${centerY - height * 0.25} ${width * 0.75},${centerY}`,
    
    // Return to baseline and finish
    `H ${width}`
  ];
  
  // Combine segments into a full path
  const ekgPath = segments.join(' ');
  
  // Animation function using requestAnimationFrame
  const animate = (time: number) => {
    // Skip if any references are missing
    if (!pathRef.current || !shadowRef.current || !dotRef.current) {
      if (active) requestRef.current = requestAnimationFrame(animate);
      return;
    }
    
    // Start time tracking on first frame
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }
    
    // Calculate elapsed time
    const elapsed = time - startTimeRef.current;
    
    // Use a fixed animation duration
    const duration = 1500; // 1.5 seconds total for mini version
    
    // Calculate raw progress
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Use easing for smoother motion
    const progress = rawProgress < 0.5
      ? 2 * rawProgress * rawProgress
      : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
    
    // Get the total path length
    const pathLength = pathRef.current.getTotalLength();
    
    // Apply dash offset for drawing effect
    pathRef.current.style.strokeDasharray = `${pathLength}`;
    pathRef.current.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
    
    shadowRef.current.style.strokeDasharray = `${pathLength}`;
    shadowRef.current.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
    
    // Position and style the dot
    if (progress > 0 && progress < 1) {
      // Calculate point position
      const point = pathRef.current.getPointAtLength(pathLength * progress);
      dotRef.current.setAttribute('cx', point.x.toString());
      dotRef.current.setAttribute('cy', point.y.toString());
      
      // QRS complex is roughly 35-45% into the animation
      const isInQRS = progress > 0.35 && progress < 0.45;
      const dotScale = isInQRS ? 1.5 : 1;
      const dotOpacity = isInQRS ? 1 : 0.8;
      
      dotRef.current.style.transform = `scale(${dotScale})`;
      dotRef.current.style.opacity = dotOpacity.toString();
    } else {
      // Hide dot at very beginning or end
      dotRef.current.style.opacity = '0';
    }
    
    // Continue animation if not complete
    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      // Properly clean up at completion
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      
      // Reset for next cycle
      startTimeRef.current = null;
      setIsRunning(false);
    }
  };
  
  // Set up animation when active state changes
  useEffect(() => {
    if (active && !isRunning) {
      // Reset animation state and start fresh
      setIsRunning(true);
      setAnimationKey(prev => prev + 1);
      startTimeRef.current = null;
      
      // Start new animation cycle
      requestRef.current = requestAnimationFrame(animate);
    }
    
    // Clean up any running animation
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [active, isRunning]);
  
  // When not active, render empty space with same dimensions
  if (!active) {
    return <div className="ml-2 w-[100px] h-[28px]"></div>;
  }
  
  return (
    <div 
      className="inline-flex items-center justify-center overflow-hidden ml-2"
      style={{ 
        position: 'relative',
        width: width,
        height: height,
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        className="transition-opacity duration-300"
        key={`alice-svg-${animationKey}`} // Force remount with new key
      >
        {/* Shadow with glow effect */}
        <path
          ref={shadowRef}
          d={ekgPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(2px)'
          }}
        />
        
        {/* Main visible path */}
        <path
          ref={pathRef}
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Luminous following dot */}
        <circle
          ref={dotRef}
          r={2.5}
          cx={0}
          cy={centerY}
          fill="white"
          style={{
            filter: 'drop-shadow(0 0 3px white)',
            transition: 'transform 0.05s ease-out'
          }}
        />
      </svg>
    </div>
  );
}