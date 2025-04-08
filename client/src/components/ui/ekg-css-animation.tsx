import React, { useState, useEffect, useRef } from 'react';

/**
 * EkgCssAnimation - A simple, CSS-based ECG animation guaranteed to run once
 * when the active prop changes to true
 * 
 * This component draws a line trace with one dot and then erases it with a trailing dot
 */
export default function EkgCssAnimation({
  lineColor = "rgba(255, 255, 255, 0.9)",
  width = 500,
  height = 200,
  strokeWidth = 2,
  active = false
}) {
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Calculate baseline Y position (horizontal line)
  const baselineY = height / 2;
  
  // Define a classical ECG waveform path with proper P, QRS, and T waves
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
  
  // Animation timing constants
  const drawingDuration = "3.5s";
  const erasingStartOffset = "2.7s";
  
  // Start animation when active prop changes to true
  useEffect(() => {
    if (active) {
      // Start animation with small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      
      // Cleanup animation state
      const cleanupTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 4000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
      };
    } else {
      setIsAnimating(false);
    }
  }, [active]);
  
  return (
    <div className="ekg-css-animation" style={{ width, height, position: 'relative' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* DRAWING PHASE - Only visible during first part of animation */}
        <g style={{ 
          opacity: isAnimating ? 1 : 0, 
          transition: isAnimating 
            ? 'opacity 0.1s ease-in, opacity 0.3s ease-out 2.7s' 
            : 'none'
        }}>
          {/* Main ECG trace that will appear */}
          <path
            d={ekgPath}
            fill="none"
            stroke={lineColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1500"
            strokeDashoffset="1500"
            style={{
              animation: isAnimating 
                ? `dash ${drawingDuration} linear forwards` 
                : 'none'
            }}
          />
          
          {/* Dot that leads the drawing */}
          {isAnimating && (
            <circle
              r={strokeWidth * 1.5}
              fill="white"
              style={{
                filter: `drop-shadow(0 0 ${strokeWidth * 2}px ${lineColor})`,
              }}
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
                keyTimes="0;0.25;0.3;0.4;0.99;1"
                dur={drawingDuration}
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="r"
                values={`${strokeWidth * 1.5};${strokeWidth * 1.5};${strokeWidth * 2.5};${strokeWidth * 1.5};${strokeWidth * 1.5}`}
                keyTimes="0;0.25;0.3;0.4;1"
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
              ? `appear 0.1s ease-in ${erasingStartOffset} forwards` 
              : 'none' 
          }}>
            {/* Eraser dot that follows the path */}
            <circle
              r={strokeWidth * 1.8}
              fill="white"
              style={{
                filter: `drop-shadow(0 0 ${strokeWidth * 2}px ${lineColor})`,
              }}
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
                  ? `wipe-right ${drawingDuration} linear ${erasingStartOffset} forwards` 
                  : 'none'
              }}
            />
          </g>
        )}
      </svg>
      
      {/* CSS Animations - Global styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes appear {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes wipe-right {
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