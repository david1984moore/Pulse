import React, { useState, useEffect, useRef } from 'react';

/**
 * AliceCssEcg - A smaller CSS-based ECG animation next to Alice's name
 * Guaranteed to run once per active prop change
 */
export default function AliceCssEcg({
  color = "#FFFFFF",
  active = false,
}) {
  // Keep track if animation has started
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Scale the animation to fit in the header area
  const width = 100;
  const height = 28;
  const centerY = height / 2;
  
  // Mini version of the classic ECG waveform path with proper P, QRS, and T waves
  // with all waves returning to the horizontal baseline
  const ekgPath = `
    M 0,${centerY}
    H ${width * 0.15}
    C ${width * 0.18},${centerY} ${width * 0.2},${centerY - height * 0.2} ${width * 0.25},${centerY}
    H ${width * 0.35}
    L ${width * 0.4},${centerY + height * 0.15}
    L ${width * 0.45},${centerY - height * 0.5}
    L ${width * 0.5},${centerY + height * 0.25}
    L ${width * 0.55},${centerY}
    H ${width * 0.6}
    C ${width * 0.65},${centerY - height * 0.3} ${width * 0.7},${centerY - height * 0.3} ${width * 0.75},${centerY}
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
        {/* Create a random ID to prevent conflicts when multiple instances exist */}
        {(() => {
          const maskId = `ecg-mask-${Math.random().toString(36).substring(2, 9)}`;
          return (
            <>
              {/* Define clip path for erasing effect */}
              <defs>
                <clipPath id={maskId}>
                  <rect x="0" y="0" width={width} height={height} />
                  
                  {/* Eraser that creates a hole in the clipPath */}
                  {isAnimating && (
                    <circle
                      r={4}
                      cx="0"
                      cy="0"
                    >
                      <animateMotion
                        dur="1s"
                        path={ekgPath}
                        begin="0.7s"
                        repeatCount="1"
                        fill="freeze"
                      />
                    </circle>
                  )}
                </clipPath>
              </defs>
              
              {/* Shadow path with glow effect */}
              <path
                d={ekgPath}
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: 'blur(2px)',
                  opacity: isAnimating ? 0.3 : 0,
                  strokeDasharray: pathLength,
                  strokeDashoffset: isAnimating ? 0 : pathLength,
                  transition: isAnimating ? `stroke-dashoffset 1s linear, opacity 0.1s linear` : 'none'
                }}
                clipPath={`url(#${maskId})`}
              />
              
              {/* Main bright visible path - clipPath will make the eraser dot cut a hole */}
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
                  opacity: isAnimating ? 1 : 0
                }}
                clipPath={`url(#${maskId})`}
              />
              
              {/* Lead dot that draws the path - not clipped */}
              {isAnimating && (
                <circle
                  r={2.5}
                  fill="white"
                  style={{
                    filter: 'drop-shadow(0 0 3px white)',
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
                    values="2.5;2.5;3.5;2.5;2.5"
                    keyTimes="0;0.4;0.5;0.6;1"
                    dur="1s"
                    repeatCount="1"
                    fill="freeze"
                  />
                </circle>
              )}
              
              {/* Eraser dot - identical to the lead dot but appears after lead is done */}
              {isAnimating && (
                <circle
                  r={2.5}
                  fill="white"
                  style={{
                    filter: 'drop-shadow(0 0 3px white)',
                  }}
                >
                  <animateMotion
                    dur="1s"
                    path={ekgPath}
                    begin="0.7s"
                    repeatCount="1"
                    fill="freeze"
                  />
                  <animate 
                    attributeName="opacity"
                    values="0;0.8;0.8;0"
                    keyTimes="0;0.1;0.9;1"
                    dur="1s"
                    begin="0.7s"
                    repeatCount="1"
                    fill="freeze"
                  />
                  <animate
                    attributeName="r"
                    values="2.5;2.5;3.5;2.5"
                    keyTimes="0;0.4;0.5;1"
                    dur="1s"
                    begin="0.7s"
                    repeatCount="1"
                    fill="freeze"
                  />
                </circle>
              )}
            </>
          );
        })()}
      </svg>
    </div>
  );
}