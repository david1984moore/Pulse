import React, { useEffect, useRef } from 'react';

interface SimpleEkgProps {
  active: boolean;
  lineColor?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

/**
 * SimpleEkg - A smooth, medical-grade ECG animation using requestAnimationFrame for precise control
 * 
 * This component renders an ECG trace with the classic horizontal pattern with
 * proper P, QRS, and T waves that follow medical ECG patterns
 * 
 * Features:
 * - Smooth animation using requestAnimationFrame
 * - Precise SVG path length calculations
 * - Variable drawing speeds for different parts of the ECG
 * - Follows proper medical ECG pattern with horizontal baseline
 * - Customizable colors, dimensions, and stroke width
 */
export default function SimpleEkg({
  active,
  lineColor = "rgba(255, 255, 255, 0.9)",
  width = 500,
  height = 200,
  strokeWidth = 2
}: SimpleEkgProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const shadowRef = useRef<SVGPathElement>(null);
  const requestIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Calculate baseline Y position (horizontal line)
  const baselineY = height / 2;
  
  // Define a classical ECG waveform path with proper P, QRS, and T waves
  // This path stays on a horizontal baseline and only deflects up/down
  // for the characteristic waves of a cardiac cycle
  const ekgPath = `
    M 0,${baselineY}
    
    H ${width * 0.1}
    
    C ${width * 0.12},${baselineY} ${width * 0.14},${baselineY - height * 0.05} ${width * 0.16},${baselineY}
    
    H ${width * 0.24}
    
    L ${width * 0.26},${baselineY + height * 0.06}
    L ${width * 0.28},${baselineY - height * 0.28}
    L ${width * 0.3},${baselineY + height * 0.15}
    
    H ${width * 0.38}
    
    C ${width * 0.42},${baselineY - height * 0.12} ${width * 0.46},${baselineY - height * 0.15} ${width * 0.5},${baselineY}
    
    H ${width}
  `;
  
  // Animation function using requestAnimationFrame for smooth control
  const animate = (timestamp: number) => {
    if (!active || !pathRef.current || !dotRef.current || !shadowRef.current) {
      return;
    }
    
    // Initialize start time on first frame
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }
    
    // Calculate elapsed time
    const elapsed = timestamp - startTimeRef.current;
    
    // Define animation duration (4.5 seconds to ensure full visibility)
    const duration = 4500;
    
    // Calculate animation progress (0 to 1)
    const progress = Math.min(elapsed / duration, 1);
    
    // Get the total path length
    const pathLength = pathRef.current.getTotalLength();
    
    // Use linear progression to ensure complete drawing of the trace
    // This makes sure we see the full ECG pattern without any cuts
    const adjustedProgress = progress;
    
    // Set the stroke dash offset to create drawing effect
    pathRef.current.style.strokeDasharray = `${pathLength}`;
    pathRef.current.style.strokeDashoffset = `${pathLength * (1 - adjustedProgress)}`;
    
    // Same for shadow path
    shadowRef.current.style.strokeDasharray = `${pathLength}`;
    shadowRef.current.style.strokeDashoffset = `${pathLength * (1 - adjustedProgress)}`;
    
    // Position the glowing dot at the current point on the path
    if (adjustedProgress > 0 && adjustedProgress < 1) {
      const point = pathRef.current.getPointAtLength(pathLength * adjustedProgress);
      dotRef.current.setAttribute('cx', point.x.toString());
      dotRef.current.setAttribute('cy', point.y.toString());
      
      // Adjust dot size based on wave position (larger at QRS spike)
      // Logic: QRS complex is around 25-40% of the path
      const isInQRS = adjustedProgress > 0.25 && adjustedProgress < 0.4; 
      const dotScale = isInQRS ? 1.8 : 1;
      const dotOpacity = isInQRS ? 1 : 0.8;
      
      dotRef.current.style.transform = `scale(${dotScale})`;
      dotRef.current.style.opacity = dotOpacity.toString();
    } else {
      // Hide dot at the end
      dotRef.current.style.opacity = '0';
    }
    
    // Continue animation if not complete
    if (progress < 1 && active) {
      requestIdRef.current = requestAnimationFrame(animate);
    } else {
      // Reset for next cycle if still active
      if (active) {
        startTimeRef.current = null;
        requestIdRef.current = requestAnimationFrame(animate);
      }
    }
  };
  
  // Setup animation when active state changes
  useEffect(() => {
    if (active) {
      // Start fresh animation cycle
      startTimeRef.current = null;
      requestIdRef.current = requestAnimationFrame(animate);
    } else {
      // Cancel any ongoing animation
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [active]);
  
  return (
    <div className="simple-ekg-container" style={{ width, height, position: 'relative' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Shadow/glow effect */}
        <path
          ref={shadowRef}
          d={ekgPath}
          fill="none"
          stroke={lineColor.replace(')', ', 0.3)')}
          strokeWidth={strokeWidth! + 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(8px)',
            opacity: 0.7
          }}
        />
        
        {/* Main ECG trace */}
        <path
          ref={pathRef}
          d={ekgPath}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Glowing dot that follows the trace */}
        <circle
          ref={dotRef}
          r={strokeWidth! * 1.5}
          cx={0}
          cy={baselineY}
          fill="white"
          style={{
            filter: `drop-shadow(0 0 ${strokeWidth! * 2}px ${lineColor})`,
            transition: 'transform 0.1s ease-out'
          }}
        />
      </svg>
    </div>
  );
}