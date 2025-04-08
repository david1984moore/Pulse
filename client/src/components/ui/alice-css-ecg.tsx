import React, { useState, useEffect } from 'react';

/**
 * AliceCssEcg - A small CSS-based ECG animation next to Alice's name
 * This uses a simpler drawing/erasing technique for reliable animation
 */
export default function AliceCssEcg({
  color = "#FFFFFF",
  active = false,
}) {
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Scale the animation to fit in the header area
  const width = 100;
  const height = 28;
  const centerY = height / 2;
  
  // Mini version of the classic ECG waveform path
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
  
  // Animation timing constants
  const drawingDuration = "1s";
  const erasingStartOffset = "0.7s";
  
  // Start animation when active prop changes to true
  useEffect(() => {
    if (active) {
      // Start animation with small delay
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      
      // Cleanup animation state
      const cleanupTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
      };
    } else {
      setIsAnimating(false);
    }
  }, [active]);
  
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
        {/* DRAWING PHASE - Only visible during first part of animation */}
        <g style={{ 
          opacity: isAnimating ? 1 : 0, 
          transition: isAnimating 
            ? 'opacity 0.1s ease-in, opacity 0.2s ease-out 0.7s' 
            : 'none'
        }}>
          {/* Main ECG trace that will appear */}
          <path
            d={ekgPath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="300"
            strokeDashoffset="300"
            style={{
              animation: isAnimating 
                ? `dash-alice ${drawingDuration} linear forwards` 
                : 'none'
            }}
          />
          
          {/* Dot that leads the drawing */}
          {isAnimating && (
            <circle
              r={2.5}
              fill="white"
              style={{ filter: 'drop-shadow(0 0 3px white)' }}
            >
              <animateMotion
                dur={drawingDuration}
                path={ekgPath}
                repeatCount="1"
                fill="freeze"
              />
              <animate 
                attributeName="opacity"
                values="0.8;0.8;1;0.8;0.8;0"
                keyTimes="0;0.4;0.5;0.6;0.99;1"
                dur={drawingDuration}
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="r"
                values="2.5;2.5;3.5;2.5;2.5"
                keyTimes="0;0.4;0.5;0.6;1"
                dur={drawingDuration}
                repeatCount="1"
                fill="freeze"
              />
            </circle>
          )}
        </g>
        
        {/* ERASING PHASE - This section replaces the drawing with a dot that erases */}
        {isAnimating && (
          <g style={{ 
            opacity: 0, 
            animation: isAnimating 
              ? `appear-alice 0.1s ease-in ${erasingStartOffset} forwards` 
              : 'none' 
          }}>
            {/* Eraser dot that follows the path */}
            <circle
              r={2.8}
              fill="white"
              style={{ filter: 'drop-shadow(0 0 3px white)' }}
            >
              <animateMotion
                dur={drawingDuration}
                path={ekgPath}
                begin={erasingStartOffset}
                repeatCount="1"
                fill="freeze"
              />
              <animate 
                attributeName="opacity"
                values="0.9;0.9;0"
                keyTimes="0;0.9;1"
                dur={drawingDuration}
                begin={erasingStartOffset}
                repeatCount="1"
                fill="freeze"
              />
            </circle>
            
            {/* Eraser trail - this cleans up after the dot */}
            <rect 
              x="0" 
              y="0" 
              width={width} 
              height={height}
              fill="none"
              stroke="transparent"
              style={{
                animation: isAnimating 
                  ? `wipe-right-alice ${drawingDuration} linear ${erasingStartOffset} forwards` 
                  : 'none'
              }}
            />
          </g>
        )}
      </svg>
      
      {/* CSS Animations - Global styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash-alice {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes appear-alice {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes wipe-right-alice {
          from {
            clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%);
          }
          to {
            clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
          }
        }
      `}} />
    </div>
  );
}