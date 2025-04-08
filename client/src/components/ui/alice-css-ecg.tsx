import React, { useState, useEffect, useRef } from 'react';

/**
 * AliceCssEcg - A futuristic, smaller CSS-based ECG animation next to Alice's name
 * Guaranteed to run once per active prop change
 */
export default function AliceCssEcg({
  color = "#a5b4fc", // Changed to indigo color
  active = false,
}) {
  // Keep track if animation has started
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Generate unique mask ID to prevent conflicts with multiple animations
  const maskId = useRef(`alice-mask-${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Scale the animation to fit in the header area
  const width = 100;
  const height = 28;
  const centerY = height / 2;
  
  // Mini version of a futuristic ECG waveform with more complex waveform patterns
  // with all waves returning to the horizontal baseline
  const ekgPath = `
    M 0,${centerY}
    H ${width * 0.10}
    C ${width * 0.13},${centerY} ${width * 0.15},${centerY - height * 0.25} ${width * 0.18},${centerY}
    H ${width * 0.24}
    L ${width * 0.28},${centerY + height * 0.2}
    L ${width * 0.32},${centerY - height * 0.4}
    L ${width * 0.36},${centerY - height * 0.6}
    L ${width * 0.40},${centerY + height * 0.3}
    L ${width * 0.44},${centerY - height * 0.25}
    L ${width * 0.48},${centerY}
    H ${width * 0.58}
    C ${width * 0.65},${centerY - height * 0.35} ${width * 0.7},${centerY - height * 0.25} ${width * 0.75},${centerY}
    H ${width}
  `;
  
  // Calculate the path length for stroke-dasharray/offset
  const mainPathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(300); // Default estimate
  
  // Start animation when active prop changes to true
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      
      // Ensure animation state is properly cleaned up
      const cleanupTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500); // Give enough time for all animations to finish
      
      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
      };
    } else {
      setIsAnimating(false);
    }
  }, [active]);
  
  // Measure the actual path length
  useEffect(() => {
    if (mainPathRef.current) {
      try {
        const actualLength = mainPathRef.current.getTotalLength();
        if (actualLength > 0) {
          setPathLength(actualLength);
        }
      } catch (e) {
        // Fallback if getTotalLength not supported
        console.log("Using estimated path length");
      }
    }
  }, []);
  
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
      >
        {/* Enhanced shadow path with futuristic glow effect */}
        <path
          d={ekgPath}
          fill="none"
          stroke="rgba(165, 180, 252, 0.4)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(4px) drop-shadow(0 0 2px rgba(165, 180, 252, 0.8))',
            opacity: isAnimating ? 0.5 : 0,
            strokeDasharray: pathLength,
            strokeDashoffset: isAnimating ? 0 : pathLength,
            transition: isAnimating ? `stroke-dashoffset 1s linear, opacity 0.1s linear` : 'none'
          }}
        />
        
        {/* Main ECG line implementation with mask for eraser effect */}
        <defs>
          <mask id={`${maskId}-eraser-mask`}>
            {/* White background which means "visible" in masks */}
            <rect x="0" y="0" width={width} height={height} fill="white" />
            
            {/* Black erasing rectangle that grows from left to right after delay */}
            {isAnimating && (
              <rect
                x="0"
                y="0"
                width="0"
                height={height}
                fill="black"
              >
                <animate
                  attributeName="width"
                  from="0"
                  to={width}
                  begin="0.7s"
                  dur="0.5s"
                  fill="freeze"
                />
              </rect>
            )}
          </mask>
        </defs>
        
        {/* The main ECG line with mask applied - only visible where mask is white */}
        <path
          ref={mainPathRef}
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: isAnimating ? 0 : pathLength,
            transition: isAnimating ? `stroke-dashoffset 1s linear` : 'none',
            opacity: isAnimating ? 1 : 0,
            mask: isAnimating ? `url(#${maskId}-eraser-mask)` : 'none'
          }}
        />
        
        {/* Futuristic lead dot that draws the path */}
        {isAnimating && (
          <circle
            r={2.5}
            fill="#a5b4fc"
            style={{
              filter: 'drop-shadow(0 0 5px rgba(165, 180, 252, 0.9)) brightness(1.2)',
            }}
          >
            <animateMotion
              dur="1s"
              path={ekgPath}
              repeatCount="1"
              fill="freeze"
            />
            <animate 
              attributeName="opacity"
              values="0.8;0.8;1;0.8;0.8;0"
              keyTimes="0;0.4;0.5;0.6;0.99;1"
              dur="1s"
              repeatCount="1"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="2.5;2.5;4;2.5;2.5"
              keyTimes="0;0.4;0.5;0.6;1"
              dur="1s"
              repeatCount="1"
              fill="freeze"
            />
          </circle>
        )}
        
        {/* Enhanced eraser dot with futuristic bright glowing effect */}
        {isAnimating && (
          <>
            {/* Inner bright core of eraser with intense glow */}
            <circle
              r={2.5}
              fill="#c7d2fe" // Light indigo
              style={{
                filter: 'drop-shadow(0 0 6px rgba(165, 180, 252, 0.9))',
                position: 'relative'
              }}
              opacity="0" // Start invisible
            >
              <animateMotion
                dur="0.5s"
                path={ekgPath}
                begin="0.7s" // Start when erasing begins
                repeatCount="1"
                fill="freeze"
              />
              <animate 
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.1;0.9;1"
                dur="0.5s"
                begin="0.7s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="r"
                values="2.5;3.5;4.5;2.5"
                keyTimes="0;0.4;0.5;1"
                dur="0.5s"
                begin="0.7s"
                repeatCount="1"
                fill="freeze"
              />
            </circle>
            
            {/* Outer glow for enhanced futuristic visibility */}
            <circle
              r={4}
              fill="rgba(165, 180, 252, 0.25)"
              style={{
                filter: 'blur(4px) brightness(1.2)',
                position: 'relative'
              }}
              opacity="0"
            >
              <animateMotion
                dur="0.5s"
                path={ekgPath}
                begin="0.7s"
                repeatCount="1"
                fill="freeze"
              />
              <animate 
                attributeName="opacity"
                values="0;0.8;0.8;0"
                keyTimes="0;0.1;0.9;1"
                dur="0.5s"
                begin="0.7s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="r"
                values="4;7;7;4"
                keyTimes="0;0.4;0.5;1"
                dur="0.5s"
                begin="0.7s"
                repeatCount="1"
                fill="freeze"
              />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
}