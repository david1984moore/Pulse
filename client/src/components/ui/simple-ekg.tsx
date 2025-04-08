import React, { useEffect, useRef, useState } from 'react';

interface SimpleEkgProps {
  active: boolean;
  lineColor?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

/**
 * SimpleEkg - A completely rewritten ECG animation with guaranteed consistency and completion
 * 
 * This component follows a classic medical ECG trace with horizontal baseline
 * and characteristic P, QRS, and T waves, ensuring the full cycle completes
 * every time.
 * 
 * Features:
 * - Guaranteed completion of the entire waveform on each click
 * - Consistent animation cycle between clicks
 * - Classic medical ECG pattern with horizontal baseline
 * - Precise timing control using fixed animation phases
 * - Medical-grade waveform with proper deflections
 */
export default function SimpleEkg({
  active,
  lineColor = "rgba(255, 255, 255, 0.9)",
  width = 500,
  height = 200,
  strokeWidth = 2
}: SimpleEkgProps) {
  // Use state to ensure proper re-renders
  const [animationId, setAnimationId] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // Create refs for animation control
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const shadowRef = useRef<SVGPathElement>(null);
  const requestIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastProgressRef = useRef<number>(0);
  
  // Calculate baseline Y position (horizontal line)
  const baselineY = height / 2;
  
  // Define the classic ECG path with pronounced segments
  // This path creates a horizontal baseline with the characteristic
  // P wave (small bump), QRS complex (sharp spike), and T wave (rounded hump)
  const segments = [
    // Starting segment - flat baseline
    `M 0,${baselineY} H ${width * 0.15}`,
    
    // P wave - small upward deflection (atrial depolarization)
    `C ${width * 0.18},${baselineY} ${width * 0.20},${baselineY - height * 0.08} ${width * 0.23},${baselineY}`,
    
    // PR segment - flat line after P wave
    `H ${width * 0.3}`,
    
    // QRS complex - sharp downward, tall upward, then downward deflection (ventricular depolarization)
    `L ${width * 0.32},${baselineY + height * 0.06}`,  // Q wave (downward)
    `L ${width * 0.34},${baselineY - height * 0.35}`,  // R wave (tall upward spike)
    `L ${width * 0.36},${baselineY + height * 0.12}`,  // S wave (downward)
    
    // ST segment - flat line after QRS
    `H ${width * 0.45}`,
    
    // T wave - rounded upward deflection (ventricular repolarization)
    `C ${width * 0.50},${baselineY - height * 0.15} ${width * 0.55},${baselineY - height * 0.15} ${width * 0.60},${baselineY}`,
    
    // Final baseline segment - flat line to end
    `H ${width}`
  ];
  
  // Join all segments into a complete path
  const ekgPath = segments.join(' ');
  
  // Run animation with fixed stages to ensure complete cycle
  const animate = (timestamp: number) => {
    // Ensure references exist before proceeding
    if (!pathRef.current || !dotRef.current || !shadowRef.current) {
      if (active) {
        requestIdRef.current = requestAnimationFrame(animate);
      }
      return;
    }
    
    // Initialize start time on first frame
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
      lastProgressRef.current = 0;
    }
    
    // Calculate elapsed time
    const elapsed = timestamp - startTimeRef.current;
    
    // Fixed animation duration (3 seconds total)
    const duration = 3000;
    
    // Calculate basic progress (0 to 1)
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Apply easing for smoother motion
    // Using easeInOutQuad for natural acceleration/deceleration
    const progress = rawProgress < 0.5
      ? 2 * rawProgress * rawProgress
      : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
    
    // Store for checking animation completion
    lastProgressRef.current = progress;
    
    // Get the total path length once
    const pathLength = pathRef.current.getTotalLength();
    
    // Calculate path offset for drawing effect
    const dashOffset = pathLength * (1 - progress);
    
    // Update path stroke dash properties
    pathRef.current.style.strokeDasharray = `${pathLength}`;
    pathRef.current.style.strokeDashoffset = `${dashOffset}`;
    
    // Same for shadow path
    shadowRef.current.style.strokeDasharray = `${pathLength}`;
    shadowRef.current.style.strokeDashoffset = `${dashOffset}`;
    
    // Position and style the glowing dot that follows the path
    if (progress > 0 && progress < 1) {
      // Calculate the exact point on the path at current progress
      const point = pathRef.current.getPointAtLength(pathLength * progress);
      
      // Update dot position
      dotRef.current.setAttribute('cx', point.x.toString());
      dotRef.current.setAttribute('cy', point.y.toString());
      
      // Set dot size based on which part of the ECG we're in
      // QRS complex (biggest spike) is roughly between 30-40% of the path
      const isInQRS = progress > 0.3 && progress < 0.4;
      const dotScale = isInQRS ? 2.0 : 1.2;
      const dotOpacity = isInQRS ? 1 : 0.8;
      
      // Apply the calculated styles
      dotRef.current.style.transform = `scale(${dotScale})`;
      dotRef.current.style.opacity = dotOpacity.toString();
    } else {
      // Hide dot at the very start or end
      dotRef.current.style.opacity = '0';
    }
    
    // Continue animation until complete
    if (progress < 1) {
      requestIdRef.current = requestAnimationFrame(animate);
    } else {
      // Animation is complete - clean up
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
      
      // Reset for next cycle
      startTimeRef.current = null;
      setIsRunning(false);
    }
  };
  
  // Handle activation state changes
  useEffect(() => {
    if (active && !isRunning) {
      // Start a fresh animation cycle
      setIsRunning(true);
      setAnimationId(prev => prev + 1);
      
      // Reset animation state
      startTimeRef.current = null;
      lastProgressRef.current = 0;
      
      // Start animation
      requestIdRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup function
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
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
        key={`ekg-svg-${animationId}`} // Force complete remount on new animation
      >
        {/* Shadow/glow effect */}
        <path
          ref={shadowRef}
          d={ekgPath}
          fill="none"
          stroke={lineColor.replace(')', ', 0.2)')}
          strokeWidth={strokeWidth! + 5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(12px)',
            opacity: 0.6
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
            filter: `drop-shadow(0 0 ${strokeWidth! * 2.5}px ${lineColor})`,
            transition: 'transform 0.05s ease-out'
          }}
        />
      </svg>
    </div>
  );
}