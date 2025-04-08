import React, { useState, useEffect, useRef } from 'react';

/**
 * EkgCssAnimation - A futuristic, advanced, CSS-based ECG animation guaranteed to run once
 * when the active prop changes to true
 * 
 * This component uses CSS animations rather than JS to ensure reliable completion
 * and prevent issues with animation cycles being cut short or never running.
 */
export default function EkgCssAnimation({
  lineColor = "rgba(165, 180, 252, 0.9)", // Changed to indigo color
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
  
  // Define a futuristic ECG waveform path with proper P, QRS, and T waves
  // Ensures all waves properly return to the horizontal baseline
  // Added more complex waveform for futuristic look
  const ekgPath = `
    M 0,${baselineY}
    
    H ${width * 0.08}
    
    C ${width * 0.10},${baselineY} ${width * 0.12},${baselineY - height * 0.06} ${width * 0.14},${baselineY}
    
    H ${width * 0.20}
    
    L ${width * 0.22},${baselineY + height * 0.05}
    L ${width * 0.24},${baselineY - height * 0.2}
    L ${width * 0.25},${baselineY - height * 0.3}
    L ${width * 0.26},${baselineY + height * 0.18}
    L ${width * 0.28},${baselineY - height * 0.1}
    L ${width * 0.30},${baselineY}
    
    H ${width * 0.35}
    
    C ${width * 0.38},${baselineY - height * 0.08} ${width * 0.40},${baselineY - height * 0.15} ${width * 0.42},${baselineY}
    
    H ${width * 0.48}
    
    L ${width * 0.50},${baselineY + height * 0.04}
    L ${width * 0.52},${baselineY - height * 0.24}
    L ${width * 0.54},${baselineY + height * 0.12}
    L ${width * 0.56},${baselineY}
    
    H ${width * 0.65}
    
    C ${width * 0.70},${baselineY - height * 0.1} ${width * 0.75},${baselineY - height * 0.14} ${width * 0.8},${baselineY}
    
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
        
        {/* Create a clip path that gets smaller as the eraser moves */}
        <defs>
          <clipPath id={`visible-area-${maskId}`}>
            {/* This rectangle gets smaller as the eraser moves */}
            <rect 
              x="-10" 
              y="-10" 
              width={isAnimating ? width + 20 : 0} 
              height={height + 20}
              style={{
                transition: isAnimating ? 'none' : 'none'
              }}
            >
              {isAnimating && (
                <animate
                  attributeName="width"
                  values={`${width + 20};${width + 20};0`}
                  keyTimes="0;0.7;1"
                  dur="5.5s"
                  fill="freeze"
                />
              )}
            </rect>
          </clipPath>
        </defs>
        
        {/* Main path that's visible only inside the clip path */}
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
            clipPath: `url(#visible-area-${maskId})`
          }}
        />
        
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