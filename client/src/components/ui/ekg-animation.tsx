/**
 * EKG Animation Component - Pure CSS, single-run animation for ECG/EKG trace
 * 
 * Uses a precise CSS animation that runs exactly once per trigger with no repetition
 */
import React, { useRef } from 'react';

interface EkgAnimationProps {
  runAnimation: boolean;  // When true, animation will run once
  onComplete?: () => void; // Called when animation completes
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
  // Use a reference for animation tracking
  const animationKey = useRef(0);
  
  // If not triggered, don't render anything
  if (!runAnimation) {
    return null;
  }
  
  // Increment key to ensure fresh animation on each trigger
  animationKey.current++;
  
  // ECG/EKG waveform points - realistic heartbeat pattern
  const points = [
    [0, height/2],         // Start at baseline
    [width*0.1, height/2], // Baseline
    
    // P wave (atrial depolarization)
    [width*0.15, height/2 - height*0.1],
    [width*0.18, height/2],
    
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
  
  // Create a unique ID for this animation instance
  const uniqueId = `ekg-${animationKey.current}-${Date.now()}`;
  
  // Pure CSS animation that will run exactly once (no looping)
  const stylesheet = `
    @keyframes ekg-trace-${uniqueId} {
      0% {
        stroke-dashoffset: ${width * 2};
      }
      100% {
        stroke-dashoffset: -${width * 0.5};
      }
    }
  `;
  
  // Use setTimeout to trigger completion callback
  if (onComplete) {
    setTimeout(() => {
      onComplete();
    }, 600); // Animation duration + small buffer
  }
  
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
      <style>{stylesheet}</style>
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
            strokeDasharray: `${width * 0.4} ${width * 2}`,
            animation: `ekg-trace-${uniqueId} 500ms ease-out forwards`,
            animationIterationCount: 1
          }}
        />
      </svg>
    </div>
  );
}