/**
 * Simple Pulse EKG Animation
 * A streamlined, reliable EKG animation that runs once when triggered.
 */
import { useEffect, useRef, useState } from 'react';

// Add the CSS to the document (only once)
const addEkgStyles = () => {
  if (!document.getElementById('ekg-styles')) {
    const style = document.createElement('style');
    style.id = 'ekg-styles';
    style.textContent = `
      @keyframes pulse-ekg {
        0% {
          stroke-dashoffset: 1000;
          opacity: 0.8;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          stroke-dashoffset: 0;
          opacity: 0.8;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Run this once on component load
addEkgStyles();

interface EkgAnimationProps {
  runAnimation: boolean;   // When true, animation will run exactly once
  onComplete?: () => void; // Called when animation completes
  color?: string;          // Line color (default: blue)
  width?: number;          // Component width in pixels
  height?: number;         // Component height in pixels
}

export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#3b82f6',
  width = 160,
  height = 28
}: EkgAnimationProps) {
  // Track whether we should show the SVG
  const [showEkg, setShowEkg] = useState(false);
  
  // Track animation state
  const animationRef = useRef({
    isRunning: false,
    timeoutId: 0
  });
  
  // Unique ID for this instance
  const ekgId = useRef(`ekg-${Math.random().toString(36).substring(2, 11)}`);
  
  // React to both changes in runAnimation and cleanup when false
  useEffect(() => {
    // Handle animation start
    if (runAnimation && !animationRef.current.isRunning) {
      // Mark as running
      animationRef.current.isRunning = true;
      
      // Show the EKG trace
      setShowEkg(true);
      
      // Set up timer to hide the EKG after animation completes
      animationRef.current.timeoutId = window.setTimeout(() => {
        // Hide the trace
        setShowEkg(false);
        
        // Mark as not running
        animationRef.current.isRunning = false;
        
        // Signal completion
        if (onComplete) {
          onComplete();
        }
      }, 1800); // Match animation duration plus a little extra time
    } 
    // Handle forced reset/cleanup 
    else if (!runAnimation && animationRef.current.isRunning) {
      // Clear any pending timeout
      if (animationRef.current.timeoutId) {
        clearTimeout(animationRef.current.timeoutId);
      }
      
      // Reset animation state
      setShowEkg(false);
      animationRef.current.isRunning = false;
    }
    
    // Clean up on unmount
    return () => {
      if (animationRef.current.timeoutId) {
        clearTimeout(animationRef.current.timeoutId);
      }
    };
  }, [runAnimation, onComplete]);
  
  // Render the SVG directly in the component
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-block',
        position: 'relative',
        marginLeft: '8px',
        marginTop: '2px'
      }}
    >
      {showEkg && (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={`
              M 0,${height/2}
              L ${width*0.2},${height/2}
              Q ${width*0.25},${height/2-3} ${width*0.3},${height/2}
              L ${width*0.38},${height/2}
              L ${width*0.42},${height/2+3}
              L ${width*0.45},${height/2-height*0.6}
              L ${width*0.5},${height/2+height*0.2}
              L ${width*0.55},${height/2}
              Q ${width*0.65},${height/2-height*0.25} ${width*0.75},${height/2}
              L ${width},${height/2}
            `}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.8))',
              strokeDasharray: '1000',
              strokeDashoffset: '1000',
              animation: 'pulse-ekg 1.5s ease-out forwards'
            }}
          />
        </svg>
      )}
    </div>
  );
}