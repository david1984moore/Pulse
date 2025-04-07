/**
 * EKG Animation Component - Creates a single-run hospital-style ECG trace
 * 
 * This component creates an ECG/EKG heartbeat trace animation that runs exactly once
 * when triggered, with no repeats. It completely unmounts itself after completion.
 */
import React, { useRef, useLayoutEffect } from 'react';

interface EkgAnimationProps {
  runAnimation: boolean;  // Trigger to start the animation
  onComplete?: () => void; // Callback when animation finishes
  color?: string;         // Line color
  width?: number;         // Component width
  height?: number;        // Component height
}

export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#3b82f6',
  width = 100,
  height = 25
}: EkgAnimationProps) {
  // We'll use refs to interact directly with DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const polylineRef = useRef<SVGPolylineElement>(null);
  const animationStarted = useRef<boolean>(false);
  
  // Run exactly once when the component mounts and runAnimation is true
  useLayoutEffect(() => {
    // Only run animation if triggered and not already running
    if (runAnimation && !animationStarted.current) {
      // Mark as started
      animationStarted.current = true;
      
      // Grab the polyline element
      const polyline = polylineRef.current;
      
      if (!polyline) return;
      
      // Get total length of the path for precise animation
      const pathLength = polyline.getTotalLength();
      
      // Set initial state - fully hidden
      polyline.style.strokeDasharray = `${pathLength}`;
      polyline.style.strokeDashoffset = `${pathLength}`;
      
      // Force a reflow to ensure initial state is applied
      void polyline.getBoundingClientRect();
      
      // Define animation specs
      const animDuration = 1500; // ms
      
      // Create and apply the animation
      const animation = polyline.animate(
        [
          { strokeDashoffset: pathLength }, // Start (hidden)
          { strokeDashoffset: 0 }           // End (fully visible)
        ],
        {
          duration: animDuration,
          easing: 'ease-out',
          fill: 'forwards'
        }
      );
      
      // When animation completes
      animation.onfinish = () => {
        // Hold the final state briefly
        setTimeout(() => {
          // Notify parent component
          if (onComplete) onComplete();
        }, 200);
      };
      
      // Cleanup in case component unmounts during animation
      return () => {
        animation.cancel();
      };
    }
  }, [runAnimation, onComplete]);
  
  // If not triggered, don't render anything
  if (!runAnimation) {
    return null;
  }
  
  // ECG/EKG waveform points - mimics a realistic single heartbeat
  const points = [
    [0, height/2],         // Start at baseline
    [width*0.1, height/2], // Continue baseline
    
    // P wave (atrial depolarization)
    [width*0.15, height/2],
    [width*0.18, height/2 - height*0.1],
    [width*0.21, height/2],
    
    // PR segment
    [width*0.25, height/2],
    
    // QRS complex (ventricular depolarization)
    [width*0.28, height/2 + height*0.05], // Q wave
    [width*0.30, height/2 - height*0.6],  // R wave (tall spike)
    [width*0.33, height/2 + height*0.2],  // S wave
    
    // ST segment
    [width*0.36, height/2],
    
    // T wave (ventricular repolarization)
    [width*0.45, height/2 - height*0.15],
    [width*0.52, height/2],
    
    // Return to baseline
    [width*0.75, height/2],
    [width, height/2]
  ].map(point => point.join(',')).join(' ');
  
  return (
    <div 
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-block',
        position: 'relative',
        marginLeft: '8px',
        marginTop: '2px',
        overflow: 'hidden'
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <polyline
          ref={polylineRef}
          points={points}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            filter: 'drop-shadow(0 0 1.5px rgba(59, 130, 246, 0.6))'
          }}
        />
      </svg>
    </div>
  );
}