import React, { useState, useEffect, useRef } from 'react';

/**
 * EkgCssAnimation - A simple, CSS-based ECG animation guaranteed to run once
 * when the active prop changes to true
 * 
 * This component uses CSS animations rather than JS to ensure reliable completion
 * and prevent issues with animation cycles being cut short or never running.
 */
export default function EkgCssAnimation({
  lineColor = "rgba(255, 255, 255, 0.9)",
  width = 500,
  height = 200,
  strokeWidth = 2,
  active = false
}) {
  // Keep track if animation has started
  const [isAnimating, setIsAnimating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Generate unique mask ID to prevent conflicts with multiple animations
  const maskId = useRef(`trace-mask-${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Calculate baseline Y position (horizontal line)
  const baselineY = height / 2;
  
  // Define a classical ECG waveform path with proper P, QRS, and T waves
  // Ensures all waves properly return to the horizontal baseline
  const ekgPath = `
    M 0,${baselineY}
    
    H ${width * 0.1}
    
    C ${width * 0.12},${baselineY} ${width * 0.14},${baselineY - height * 0.05} ${width * 0.16},${baselineY}
    
    H ${width * 0.24}
    
    L ${width * 0.26},${baselineY + height * 0.06}
    L ${width * 0.28},${baselineY - height * 0.28}
    L ${width * 0.3},${baselineY + height * 0.15}
    L ${width * 0.32},${baselineY}
    
    H ${width * 0.38}
    
    C ${width * 0.42},${baselineY - height * 0.12} ${width * 0.46},${baselineY - height * 0.15} ${width * 0.5},${baselineY}
    
    H ${width}
  `;
  
  // Start animation when active prop changes to true
  useEffect(() => {
    if (active) {
      // Small delay to ensure DOM is fully ready
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      
      // Ensure animation state is cleaned up completely
      const cleanupTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 4000); // Give enough time for all animations to finish
      
      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
      };
    } else {
      setIsAnimating(false);
    }
  }, [active]);
  
  // Calculate the path length for stroke-dasharray/offset
  const mainPathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(1500); // Default estimate
  
  useEffect(() => {
    if (mainPathRef.current) {
      try {
        const actualLength = mainPathRef.current.getTotalLength();
        if (actualLength > 0) {
          setPathLength(actualLength);
        }
      } catch (e) {
        // Fallback if getTotalLength is not supported
        console.log("Using estimated path length");
      }
    }
  }, []);
  
  return (
    <div className="ekg-css-animation" style={{ width, height, position: 'relative' }}>
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Shadow/glow effect */}
        <path
          d={ekgPath}
          fill="none"
          stroke={lineColor.replace(')', ', 0.3)')}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(8px)',
            opacity: isAnimating ? 0.7 : 0,
            strokeDasharray: pathLength,
            strokeDashoffset: isAnimating ? 0 : pathLength,
            transition: isAnimating ? `stroke-dashoffset 3.5s linear, opacity 0.1s linear` : 'none'
          }}
        />
        
        {/* Visible ECG line that will be drawn and erased */}
        <defs>
          <linearGradient id={`eraser-gradient-${maskId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lineColor} />
            <stop offset="0%" stopColor="transparent" stopOpacity="0">
              {isAnimating && (
                <animate 
                  attributeName="offset" 
                  values="0%;0%;100%" 
                  keyTimes="0;0.7;1"
                  dur="4.5s" 
                  begin="0s"
                  fill="freeze"
                />
              )}
            </stop>
          </linearGradient>
        </defs>
        
        {/* This is the main ECG trace that will appear as dashed and will be drawn */}
        <path
          ref={mainPathRef}
          d={ekgPath}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: isAnimating ? 0 : pathLength,
            transition: isAnimating ? `stroke-dashoffset 3.5s linear` : 'none',
            opacity: isAnimating ? 1 : 0,
          }}
        />
        
        {/* This is the mask layer that will erase the path */}
        {isAnimating && (
          <path
            d={ekgPath}
            fill="none"
            stroke={`url(#eraser-gradient-${maskId})`}
            strokeWidth={strokeWidth * 1.5} // Slightly wider to ensure full coverage
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: 1,
            }}
          />
        )}
        
        {/* Lead dot that draws the trace */}
        {isAnimating && (
          <circle
            r={strokeWidth * 1.5}
            fill="white"
            style={{
              filter: `drop-shadow(0 0 ${strokeWidth * 2}px ${lineColor})`,
            }}
          >
            <animateMotion
              dur="3.5s"
              path={ekgPath}
              repeatCount="1"
              fill="freeze"
            />
            <animate 
              attributeName="opacity"
              values="0.8;0.8;1;0.8;0.8;0"
              keyTimes="0;0.25;0.3;0.4;0.99;1"
              dur="3.5s"
              repeatCount="1"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values={`${strokeWidth * 1.5};${strokeWidth * 1.5};${strokeWidth * 2.5};${strokeWidth * 1.5};${strokeWidth * 1.5}`}
              keyTimes="0;0.25;0.3;0.4;1"
              dur="3.5s"
              repeatCount="1"
              fill="freeze"
            />
          </circle>
        )}
        
        {/* Eraser dot with bright glowing effect that follows the erasing path */}
        {isAnimating && (
          <circle
            r={strokeWidth * 1.5}
            fill="white"
            style={{
              filter: `drop-shadow(0 0 ${strokeWidth * 2}px white)`,
              position: 'relative' // Ensure proper positioning
            }}
            opacity="0" // Start invisible
          >
            {/* Start this dot when the erasing effect begins */}
            <animateMotion
              dur="2s"
              path={ekgPath}
              begin="2.5s" // Start when erasing begins
              repeatCount="1"
              fill="freeze"
            />
            <animate 
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.1;0.9;1"
              dur="2s"
              begin="2.5s"
              repeatCount="1"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values={`${strokeWidth * 1.5};${strokeWidth * 2.5};${strokeWidth * 3};${strokeWidth * 1.5}`}
              keyTimes="0;0.4;0.5;1"
              dur="2s"
              begin="2.5s"
              repeatCount="1"
              fill="freeze"
            />
          </circle>
        )}
      </svg>
    </div>
  );
}