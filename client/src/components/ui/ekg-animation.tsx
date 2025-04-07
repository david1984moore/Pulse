import { useState, useEffect, useRef } from 'react';

interface EkgAnimationProps {
  isActive: boolean;
  duration?: number; // Duration in milliseconds
  color?: string;
  width?: number;
  height?: number;
}

export function EkgAnimation({ 
  isActive,
  duration = 2000, // 2 seconds for a more visible effect
  color = '#3b82f6', // Default blue color
  width = 100,
  height = 25
}: EkgAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Keep track of the last isActive state to prevent multiple triggers
  const lastActiveState = useRef(false);
  
  // Clear existing timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  
  // Handle animation start/stop only on isActive transitions
  useEffect(() => {
    // Only trigger animation on a false->true transition of isActive
    if (isActive && !lastActiveState.current) {
      // Clean up any existing animation
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Start the animation
      setShowAnimation(true);
      
      // Set a timer to hide the animation after it completes
      timerRef.current = setTimeout(() => {
        setShowAnimation(false);
        timerRef.current = null;
      }, duration * 2); // Extend the duration to keep the trace visible longer
    }
    
    // Update the ref to current isActive state
    lastActiveState.current = isActive;
  }, [isActive, duration]);
  
  if (!showAnimation) return null;
  
  // Enhanced EKG signal points for a smoother, more attractive trace
  const points = [
    [0, height/2],                       // Start with flat line (isoelectric)
    [width*0.25, height/2],              // Flat line continues
    [width*0.3, height/2 - height*0.08], // P wave (small rounded bump)
    [width*0.35, height/2],              // Back to baseline before QRS complex
    [width*0.38, height/2 - height*0.1], // Q wave (small dip)
    [width*0.42, height/2 - height*0.65], // R wave (tall spike, slightly higher)
    [width*0.44, height/2 + height*0.25], // S wave (deeper downward deflection)
    [width*0.48, height/2],              // Back to baseline after QRS
    [width*0.58, height/2 - height*0.15], // T wave (more noticeable bump)
    [width*0.65, height/2],              // Back to baseline
    [width*0.85, height/2],              // Flat line continues
    [width, height/2]                    // End with flat line
  ].map(point => point.join(',')).join(' ');
  
  // Create dual-phase animation effect with more visible trace
  // First keyframes control the leading point (pen)
  // Second keyframes control the tail completion
  const animationStyles = `
    @keyframes drawLeadingPoint {
      0% {
        stroke-dasharray: 5, ${width * 3}; /* Smaller leading dot (5px) for smoother animation */
        stroke-dashoffset: ${width * 3};
      }
      15% {
        stroke-dasharray: 5, ${width * 3};
        stroke-dashoffset: ${width * 2.75}; /* Gradual start */
      }
      30% {
        stroke-dasharray: 5, ${width * 3};
        stroke-dashoffset: ${width * 2.3}; /* Starting to speed up */
      }
      45% {
        stroke-dasharray: 5, ${width * 3};
        stroke-dashoffset: ${width * 1.6}; /* Moving faster before peak */
      }
      60% {
        stroke-dasharray: 5, ${width * 3};
        stroke-dashoffset: ${width * 1.0}; /* Fastest at QRS complex */
      }
      75% {
        stroke-dasharray: 5, ${width * 3};
        stroke-dashoffset: ${width * 0.6}; /* Begin to slow down */
      }
      85% {
        stroke-dasharray: 5, ${width * 3};
        stroke-dashoffset: ${width * 0.3}; /* Slow near end */
      }
      95% {
        stroke-dasharray: 5, ${width * 3};
        stroke-dashoffset: ${width * 0.1}; /* Very slow at the end */
      }
      100% {
        stroke-dasharray: 5, ${width * 3};
        stroke-dashoffset: 0; /* Complete the line */
      }
    }
    
    @keyframes completeTail {
      0%, 65% {
        /* Keep dash array unchanged for longer to let more of the trace remain visible */
        stroke-dasharray: 5, ${width * 3};
      }
      85% {
        /* Start the tail later to leave more trace visible */
        stroke-dasharray: 5, ${width * 3};
      }
      100% {
        stroke-dasharray: 0, 0; /* Tail catches up and completes */
      }
    }
    
    /* Animation to keep the trace visible longer */
    @keyframes fadeOut {
      0%, 80% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    
    .animate-draw {
      stroke-linecap: round;
      stroke-linejoin: round;
      will-change: stroke-dasharray, stroke-dashoffset; /* Performance optimization */
      animation: 
        drawLeadingPoint ${duration}ms cubic-bezier(0.42, 0, 0.58, 1) forwards,
        completeTail ${duration * 1.8}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards,
        fadeOut ${duration * 2}ms cubic-bezier(0.42, 0, 0.58, 1) forwards; /* Slow fade out */
    }
  `;
  
  return (
    <div
      className="ekg-animation"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-block',
        position: 'relative',
        marginLeft: '8px',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw"
          filter="drop-shadow(0 0 2px rgba(59, 130, 246, 0.7))"
        />
      </svg>

      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
    </div>
  );
}