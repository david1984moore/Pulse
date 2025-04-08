import React, { useEffect, useRef } from 'react';
import './ekg-animation.css';

interface SimpleEkgProps {
  active: boolean;
  width?: number;
  height?: number;
  lineColor?: string;
  strokeWidth?: number;
}

/**
 * A completely simplified single-cycle ECG trace with clean tail
 */
export default function SimpleEkg({
  active,
  width = 800,
  height = 150,
  lineColor = "#FFFFFF",
  strokeWidth = 3
}: SimpleEkgProps) {
  const animationRef = useRef<SVGSVGElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  
  // Define the path coordinates for the ECG trace
  const centerY = height / 2;
  
  // Our SVG path data with extra control points for smooth follow-through
  const ekgBasePath = `
    M 0,${centerY} 
    H 100 
    C 110,${centerY-3} 120,${centerY-10} 130,${centerY-5} 
    C 140,${centerY} 150,${centerY+5} 160,${centerY}
    H 200 
    C 210,${centerY} 220,${centerY-20} 230,${centerY-40} 
    S 240,${centerY+50} 250,${centerY+10} 
    C 260,${centerY-20} 270,${centerY} 280,${centerY}
    C 290,${centerY} 300,${centerY-8} 310,${centerY+8} 
    C 320,${centerY-4} 330,${centerY+4} 340,${centerY-2}
    C 350,${centerY+2} 360,${centerY-1} 370,${centerY+1}
    C 380,${centerY} 390,${centerY} 400,${centerY}
    H ${width}
  `;
  
  // Animation loop for smooth control
  const animate = (time: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
      previousTimeRef.current = time;
    }
    
    const elapsed = time - startTimeRef.current;
    
    // Animation duration is 3.5 seconds
    const duration = 3500;
    
    // Make sure the svg ref is available
    if (animationRef.current) {
      // Get the path and circle elements
      const path = animationRef.current.querySelector('.ekg-main-path') as SVGPathElement;
      const shadow = animationRef.current.querySelector('.ekg-shadow-path') as SVGPathElement;
      const dot = animationRef.current.querySelector('.ekg-dot') as SVGCircleElement;
      
      if (path && shadow && dot) {
        // Calculate progress (0 to 1)
        let progress = Math.min(elapsed / duration, 1);
        
        // Adjust for timing curve - start slow, then fast through QRS, then tail off
        let adjustedProgress;
        if (progress < 0.3) {
          // Start slower
          adjustedProgress = progress * 0.8;
        } else if (progress < 0.6) {
          // Speed up through the main QRS complex
          adjustedProgress = 0.24 + ((progress - 0.3) * 1.4);
        } else {
          // Smooth finish
          adjustedProgress = 0.66 + ((progress - 0.6) * 0.85);
        }
        
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
          
          // Make dot size pulse based on whether we're in the QRS complex
          const isInQrsComplex = adjustedProgress > 0.35 && adjustedProgress < 0.5;
          const dotScale = isInQrsComplex ? 1.2 : 1;
          const dotOpacity = progress < 0.05 ? progress * 20 : 1;
          
          dot.style.transform = `scale(${dotScale})`;
          dot.style.opacity = dotOpacity.toString();
          
          // Increase glow during QRS complex
          const glowIntensity = isInQrsComplex ? 12 : 8;
          dot.style.filter = `drop-shadow(0 0 ${glowIntensity}px white)`;
        } else if (adjustedProgress >= 1) {
          // Hide dot at the end
          dot.style.opacity = '0';
        }
        
        // If animation is complete, clean up
        if (progress >= 1) {
          // Animation completed, reset refs for next cycle
          startTimeRef.current = null;
          requestRef.current = null;
          return;
        }
      }
    }
    
    // Continue animation
    previousTimeRef.current = time;
    if (active) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };
  
  // Set up and clean up animation
  useEffect(() => {
    if (active) {
      // Reset animation state
      startTimeRef.current = null;
      
      // Start animation
      requestRef.current = requestAnimationFrame(animate);
    }
    
    // Clean up
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [active]);
  
  // If not active, don't render
  if (!active) return null;
  
  return (
    <div className="simple-ekg-wrapper" style={{width: '100%', height: '100%'}}>
      <svg 
        ref={animationRef}
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{overflow: 'visible'}}
      >
        {/* Grid background for medical effect */}
        <defs>
          <pattern id="ecg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ecg-grid)" />
        
        {/* Shadow path with glow effect */}
        <path
          className="ekg-shadow-path"
          d={ekgBasePath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(10px)'
          }}
        />
        
        {/* Main visible trace */}
        <path
          className="ekg-main-path"
          d={ekgBasePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Glowing dot that follows the path */}
        <circle
          className="ekg-dot"
          r={6}
          cx={0}
          cy={centerY}
          fill="white"
          style={{
            filter: 'drop-shadow(0 0 8px white)',
          }}
        />
      </svg>
    </div>
  );
}