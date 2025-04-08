import React, { useState, useEffect } from 'react';
import './ekg-animation.css';

interface EkgTraceProps {
  active: boolean;
  width?: number;
  height?: number;
  lineColor?: string;
  strokeWidth?: number;
}

/**
 * A completely reliable ECG trace animation with guaranteed 
 * identical behavior on every activation
 */
export default function EkgTrace({
  active,
  width = 800,
  height = 150,
  lineColor = "#FFFFFF",
  strokeWidth = 3
}: EkgTraceProps) {
  // Using both a counter for remounting and a local active state
  const [counter, setCounter] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // This effect ensures the animation completely restarts on every activation
  useEffect(() => {
    // When the component becomes active
    if (active) {
      // First fully deactivate
      setIsActive(false);
      
      // Using a longer delay for complete cleanup in the browser
      const timer = setTimeout(() => {
        // Force remount by incrementing counter
        setCounter(prevCounter => prevCounter + 1);
        // Then activate the animation
        setIsActive(true);
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      // Simply deactivate when necessary
      setIsActive(false);
    }
  }, [active]);
  
  // The stationary component is rendered when inactive
  if (!isActive) return null;
  
  // The ECG path data - identical for all animations
  const ekgPath = `M 0,${height/2} 
    L 100,${height/2} 
    L 120,${height/2 - 5} 
    L 140,${height/2 + 5} 
    L 160,${height/2} 
    L 180,${height/2} 
    L 200,${height/2} 
    L 220,${height/2 - 40} 
    L 240,${height/2 + 50} 
    L 260,${height/2} 
    L 280,${height/2} 
    L 300,${height/2 - 10} 
    L 320,${height/2 + 10} 
    L 340,${height/2} 
    L 800,${height/2}`;
  
  // Render a completely fresh instance of the animation with each counter change
  return (
    <div 
      className="ekg-svg-wrapper" 
      key={`trace-${counter}`}
      data-active="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
      <svg 
        className="ekg-svg" 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Shadow path with glow effect for depth */}
        <path
          d={ekgPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            animation: 'ekg-dash 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            filter: 'blur(8px)'
          }}
        />
        
        {/* Main bright visible path */}
        <path
          d={ekgPath}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            animation: 'ekg-dash 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          }}
        />
        
        {/* Glowing dot that follows the path */}
        <circle
          r={6}
          fill="white"
          style={{
            filter: 'drop-shadow(0 0 8px white)',
            animation: 'ekg-dot 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          }}
        >
          {/* Motion path animation for the dot */}
          <animateMotion
            dur="3.5s"
            repeatCount="1"
            keyTimes="0; 0.2; 0.4; 0.6; 0.8; 1"
            keyPoints="0; 0.15; 0.35; 0.6; 0.85; 1"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            path={ekgPath}
          />
        </circle>
      </svg>
    </div>
  );
}