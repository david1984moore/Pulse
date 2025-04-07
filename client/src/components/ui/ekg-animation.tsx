import { useState, useEffect, useRef } from 'react';

interface EkgAnimationProps {
  isActive: boolean;
  duration?: number;
  color?: string;
  width?: number;
  height?: number;
}

export function EkgAnimation({ 
  isActive,
  duration = 2000,
  color = '#3b82f6', // Default blue color to match app
  width = 100,
  height = 25
}: EkgAnimationProps) {
  // Only render animation when isActive is true
  if (!isActive) return null;
  
  // Create a realistic hospital ECG waveform
  // This models a standard cardiac cycle with proper P-QRS-T components
  const points = [
    // Start at baseline
    [0, height/2],
    [width*0.1, height/2],
    
    // P wave (atrial depolarization)
    [width*0.15, height/2],
    [width*0.18, height/2 - height*0.1],
    [width*0.21, height/2],
    
    // PR segment (flat)
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
    
    // End with baseline
    [width*0.75, height/2],
    [width, height/2]
  ].map(point => point.join(',')).join(' ');
  
  // Create animation styles for drawing the line
  const animationStyles = `
    /* Draw the line from left to right with continous tail following */
    @keyframes drawEkgTrace {
      0% {
        stroke-dasharray: 0.1, ${width * 2};
        stroke-dashoffset: ${width * 2};
      }
      
      /* Show just a small dot/point at the beginning */
      5% {
        stroke-dasharray: 1, ${width * 2};
        stroke-dashoffset: ${width * 1.9};
      }
      
      /* Start expanding the visible trace - show more of the beginning */
      20% {
        stroke-dasharray: ${width * 0.3}, ${width * 2};
        stroke-dashoffset: ${width * 1.6};
      }
      
      /* Middle point - half of the trace is drawn, with tail following */
      50% {
        stroke-dasharray: ${width * 0.7}, ${width * 2};
        stroke-dashoffset: ${width * 1.0};
      }
      
      /* Near the end - most of the trace is visible with the tail still following */
      80% {
        stroke-dasharray: ${width * 0.9}, ${width * 2};
        stroke-dashoffset: ${width * 0.4};
      }
      
      /* End with the full trace drawn and visible */
      100% {
        stroke-dasharray: ${width * 2}, 0;
        stroke-dashoffset: 0;
      }
    }
    
    /* The ECG trace line */
    .ekg-line {
      stroke: ${color};
      stroke-width: 2.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      filter: drop-shadow(0 0 1.5px rgba(59, 130, 246, 0.6));
      animation: drawEkgTrace ${duration}ms ease-out forwards;
      will-change: stroke-dasharray, stroke-dashoffset;
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
        marginTop: '2px'
      }}
    >
      {/* SVG for the ECG trace */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Just the ECG trace line - no background grid */}
        <polyline
          className="ekg-line"
          points={points}
        />
      </svg>
      
      {/* Inject the animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
    </div>
  );
}