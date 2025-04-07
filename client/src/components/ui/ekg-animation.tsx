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
  color = '#10b981', // Medical green color for more hospital-like appearance
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
    /* Background grid lines for hospital monitor effect */
    .ekg-grid line {
      stroke: rgba(0, 0, 0, 0.05);
      stroke-width: 0.5;
    }
    
    /* Draw the line from left to right */
    @keyframes drawLine {
      0% {
        stroke-dasharray: ${width * 2};
        stroke-dashoffset: ${width * 2};
        opacity: 0.8;
      }
      20% {
        opacity: 1;
      }
      100% {
        stroke-dasharray: ${width * 2};
        stroke-dashoffset: 0;
        opacity: 1;
      }
    }
    
    /* Add glow effect */
    @keyframes glowPulse {
      0%, 100% {
        filter: drop-shadow(0 0 1px rgba(16, 185, 129, 0.7));
      }
      50% {
        filter: drop-shadow(0 0 3px rgba(16, 185, 129, 1));
      }
    }
    
    /* The animation that controls the EKG line */
    .ekg-line {
      stroke: ${color};
      stroke-width: 2.2px;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      animation: 
        drawLine ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
        glowPulse ${duration * 0.3}ms ease-in-out;
      will-change: stroke-dasharray, stroke-dashoffset, filter;
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
        {/* Background grid for hospital monitor effect */}
        <g className="ekg-grid">
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((y, i) => (
            <line 
              key={`h-${i}`} 
              x1="0" 
              y1={height * y} 
              x2={width} 
              y2={height * y} 
            />
          ))}
          
          {/* Vertical grid lines */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line 
              key={`v-${i}`} 
              x1={width * (i/10)} 
              y1="0" 
              x2={width * (i/10)} 
              y2={height} 
            />
          ))}
        </g>
        
        {/* The actual ECG trace */}
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