/**
 * EKG Animation Component - Simple, clean, once-per-click ECG trace
 * Uses CSS for animation because it's more reliable across browsers
 */
import React, { useEffect, useState } from 'react';

interface EkgAnimationProps {
  runAnimation: boolean;  // When true, animation will run
  onComplete?: () => void; // Called when animation is done
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
  // Use key to force complete component remount on each trigger
  const [key, setKey] = useState(0);
  
  // Watch for animation trigger
  useEffect(() => {
    if (runAnimation) {
      // Increment key to force a fresh component instance
      setKey(prev => prev + 1);
      
      // Set a timer to call onComplete after animation finishes
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000); // Animation duration + small buffer
      
      return () => clearTimeout(timer);
    }
  }, [runAnimation, onComplete]);
  
  // If not triggered, render nothing
  if (!runAnimation) {
    return null;
  }
  
  // ECG heartbeat path points
  const points = [
    [0, height/2],         // Start at baseline
    [width*0.1, height/2], // Baseline
    
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
  
  // CSS for animation
  const cssAnimation = `
    @keyframes drawLine${key} {
      0% {
        stroke-dasharray: ${width * 3};
        stroke-dashoffset: ${width * 3};
      }
      100% {
        stroke-dasharray: ${width * 3};
        stroke-dashoffset: 0;
      }
    }
  `;
  
  return (
    <div 
      key={key}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-block',
        position: 'relative',
        marginLeft: '8px',
        marginTop: '2px'
      }}
    >
      <style>{cssAnimation}</style>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <polyline
          points={points}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            filter: 'drop-shadow(0 0 1.5px rgba(59, 130, 246, 0.6))',
            animation: `drawLine${key} 1.8s ease-out forwards`,
            animationIterationCount: 1
          }}
        />
      </svg>
    </div>
  );
}