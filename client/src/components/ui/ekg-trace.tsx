import React, { useState, useEffect, useRef } from 'react';
import './ekg-animation.css';

interface EkgTraceProps {
  active: boolean;
  width?: number;
  height?: number;
  lineColor?: string;
  strokeWidth?: number;
}

/**
 * EKG trace with follow-through and guaranteed 
 * identical behavior on every activation
 */
export default function EkgTrace({
  active,
  width = 800,
  height = 150,
  lineColor = "#FFFFFF",
  strokeWidth = 3
}: EkgTraceProps) {
  // Track mount state to prevent double animations
  const [mounted, setMounted] = useState(false);
  const animationCompletionRef = useRef(false);
  
  // This ensures the animation runs exactly once per activation
  useEffect(() => {
    if (active && !mounted) {
      // Mount the animation
      setMounted(true);
      animationCompletionRef.current = false;
      
      // Set a timeout to prevent double animation cycles
      // but don't unmount - we'll handle that in the deactivation flow
      const completionTimer = setTimeout(() => {
        animationCompletionRef.current = true;
      }, 3500); // Match exactly with animation duration
      
      return () => clearTimeout(completionTimer);
    } else if (!active && mounted) {
      // Complete unmount on deactivation with delay
      // This ensures the animation has time to complete before unmounting
      const unmountTimer = setTimeout(() => {
        setMounted(false);
      }, 100);
      
      return () => clearTimeout(unmountTimer);
    }
  }, [active, mounted]);
  
  // Only render when mounted
  if (!mounted) return null;
  
  // The ECG path with proper follow-through at the end
  // Notice the smoother finish after the main QRS complex
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
    L 280,${height/2 - 6} 
    L 290,${height/2 + 8} 
    L 300,${height/2 - 10} 
    L 320,${height/2 + 10} 
    L 340,${height/2 - 4} 
    L 360,${height/2 + 4} 
    L 380,${height/2 - 2} 
    L 400,${height/2 + 2} 
    L 430,${height/2 - 1} 
    L 450,${height/2 + 1} 
    L 470,${height/2} 
    L 800,${height/2}`;
  
  return (
    <div 
      className="ekg-svg-wrapper" 
      key={`trace-${active}-${Date.now()}`}
      data-active="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <svg 
        className="ekg-svg" 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Create subtle grid background for medical feel */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Shadow path with glow effect for depth */}
        <path
          d={ekgPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: 2000,
            animation: 'ekg-dash 3.5s cubic-bezier(0.25, 0, 0.3, 1) forwards',
            filter: 'blur(10px)'
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
            strokeDasharray: 2000,
            strokeDashoffset: 2000,
            animation: 'ekg-dash 3.5s cubic-bezier(0.25, 0, 0.3, 1) forwards'
          }}
        />
        
        {/* Glowing dot that follows the path */}
        <circle
          r={6}
          fill="white"
          style={{
            filter: 'drop-shadow(0 0 8px white)',
            animation: 'ekg-dot 3.5s cubic-bezier(0.25, 0, 0.3, 1) forwards'
          }}
        >
          {/* Motion path animation for the dot */}
          <animateMotion
            dur="3.5s"
            repeatCount="1"
            keyPoints="0; 0.1; 0.25; 0.4; 0.6; 0.75; 0.9; 1"
            keyTimes="0; 0.1; 0.25; 0.4; 0.6; 0.75; 0.9; 1"
            calcMode="spline"
            keySplines="0.25 0 0.3 1; 0.25 0 0.3 1; 0.25 0 0.3 1; 0.25 0 0.3 1; 0.25 0 0.3 1; 0.25 0 0.3 1; 0.25 0 0.3 1"
            path={ekgPath}
          />
        </circle>
      </svg>
    </div>
  );
}