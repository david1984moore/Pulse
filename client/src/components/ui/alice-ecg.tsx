import React, { useEffect, useRef } from 'react';
import './ekg-animation.css';

interface AliceEcgProps {
  active: boolean;
  color?: string;
}

/**
 * Completely rewritten Alice ECG animation with smooth frame-based animation
 */
export default function AliceEcg({ active, color = "#FFFFFF" }: AliceEcgProps) {
  const animationRef = useRef<SVGSVGElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);
  
  // Scale the animation to fit in the header area
  const width = 100;
  const height = 28;
  const centerY = height / 2;
  
  // Mini version of the EKG path with smooth bezier curves
  const ekgPath = `
    M 0,${centerY} 
    H 15
    C 20,${centerY} 25,${centerY-4} 30,${centerY}
    C 35,${centerY+4} 40,${centerY-2} 45,${centerY}
    C 50,${centerY+1} 55,${centerY-14} 60,${centerY+6}
    C 65,${centerY-3} 70,${centerY+3} 75,${centerY}
    C 80,${centerY-1} 85,${centerY+1} 90,${centerY}
    H 100
  `;
  
  // Animation loop for smooth control
  const animate = (time: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }
    
    const elapsed = time - startTimeRef.current;
    
    // Animation duration is 1.2 seconds - faster for the header version
    const duration = 1200;
    
    // Make sure the svg ref is available
    if (animationRef.current) {
      // Get the path and circle elements
      const path = animationRef.current.querySelector('.alice-path') as SVGPathElement;
      const shadow = animationRef.current.querySelector('.alice-shadow') as SVGPathElement;
      const dot = animationRef.current.querySelector('.alice-dot') as SVGCircleElement;
      
      if (path && shadow && dot) {
        // Calculate progress (0 to 1)
        let progress = Math.min(elapsed / duration, 1);
        
        // Smooth out the timing with a slight easing
        const adjustedProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
        
        // Get the path length
        const pathLength = path.getTotalLength();
        
        // Set stroke dasharray and offset for drawing effect
        path.style.strokeDasharray = `${pathLength}`;
        path.style.strokeDashoffset = `${pathLength * (1 - adjustedProgress)}`;
        
        shadow.style.strokeDasharray = `${pathLength}`;
        shadow.style.strokeDashoffset = `${pathLength * (1 - adjustedProgress)}`;
        
        // Position the dot along the path based on progress
        if (adjustedProgress > 0 && adjustedProgress < 1) {
          const point = path.getPointAtLength(pathLength * adjustedProgress);
          dot.setAttribute('cx', point.x.toString());
          dot.setAttribute('cy', point.y.toString());
          
          // Make dot size pulse at the spike
          const isInSpike = adjustedProgress > 0.5 && adjustedProgress < 0.7;
          const dotScale = isInSpike ? 1.2 : 1;
          
          dot.style.transform = `scale(${dotScale})`;
          dot.style.opacity = '1';
        } else if (adjustedProgress >= 1) {
          // Hide dot at the end
          dot.style.opacity = '0';
        }
        
        // If animation is complete, reset for next cycle
        if (progress >= 1) {
          startTimeRef.current = null;
          if (active) {
            // Keep animation running if still active
            requestRef.current = requestAnimationFrame(animate);
          }
          return;
        }
      }
    }
    
    // Continue animation
    if (active) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };
  
  // Set up and clean up animation
  useEffect(() => {
    if (active) {
      // Start animation
      requestRef.current = requestAnimationFrame(animate);
    } else {
      // Stop animation when inactive
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      
      // Reset state
      startTimeRef.current = null;
    }
    
    // Clean up
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [active]);
  
  // If not active, render empty space
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
        ref={animationRef}
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        className="transition-opacity duration-300"
      >
        {/* Shadow path with glow effect */}
        <path
          className="alice-shadow"
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
        
        {/* Main bright visible path */}
        <path
          className="alice-path"
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Glowing dot that follows the path */}
        <circle
          className="alice-dot"
          r={2.5}
          cx={0}
          cy={centerY}
          fill="white"
          style={{
            filter: 'drop-shadow(0 0 3px white)'
          }}
        />
      </svg>
    </div>
  );
}