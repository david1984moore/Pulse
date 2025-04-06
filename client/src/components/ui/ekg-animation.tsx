import { useState, useEffect } from 'react';

interface EkgAnimationProps {
  isActive: boolean;
  duration?: number; // Duration in milliseconds
  color?: string;
  width?: number;
  height?: number;
}

export function EkgAnimation({ 
  isActive,
  duration = 1000,
  color = '#3b82f6', // Default blue color
  width = 100,
  height = 25
}: EkgAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);
  
  if (!showAnimation) return null;
  
  // EKG signal points (heartbeat pattern)
  const points = [
    [0, height/2],      // Start with flat line
    [width*0.1, height/2],
    [width*0.15, height/2], // P wave
    [width*0.2, height*0.4],
    [width*0.25, height/2],
    [width*0.3, height/2],  // Q
    [width*0.35, height/2 - height*0.7], // R spike (high peak)
    [width*0.4, height/2 + height*0.3],  // S
    [width*0.45, height/2], // Back to baseline
    [width*0.5, height/2],
    [width*0.55, height/2 - height*0.2], // T wave
    [width*0.6, height/2],
    [width*0.65, height/2],
    [width*0.7, height/2],  // Flat line again
    [width*0.8, height/2],
    [width*0.9, height/2],
    [width, height/2]      // End
  ].map(point => point.join(',')).join(' ');
  
  // CSS animation for drawing the EKG trace with ease-out timing
  const animationStyles = `
    @keyframes draw {
      0% {
        stroke-dashoffset: ${width * 2};
      }
      70% {
        stroke-dashoffset: ${width * 0.7};
      }
      100% {
        stroke-dashoffset: 0;
      }
    }
    
    .animate-draw {
      stroke-dasharray: ${width * 2};
      stroke-dashoffset: ${width * 2};
      animation: draw ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
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
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw"
        />
      </svg>

      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
    </div>
  );
}