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
  
  // More realistic EKG signal points (QRS complex)
  const points = [
    [0, height/2],                      // Start with flat line (isoelectric)
    [width*0.3, height/2],              // Flat line continues
    [width*0.35, height/2 - height*0.1], // Q wave (small dip)
    [width*0.4, height/2 - height*0.6],  // R wave (tall spike)
    [width*0.45, height/2 + height*0.2], // S wave (downward deflection)
    [width*0.5, height/2],               // Back to baseline
    [width*0.55, height/2 - height*0.1], // T wave (small bump)
    [width*0.6, height/2],               // Back to baseline
    [width*0.85, height/2],              // Flat line continues
    [width, height/2]                    // End with flat line
  ].map(point => point.join(',')).join(' ');
  
  // Create leading point animation effect
  // Use a combination of dash array and dash offset for the drawing effect
  // This creates the appearance of a tracing line with a "pen point" leading the way
  const animationStyles = `
    @keyframes draw {
      0% {
        stroke-dasharray: 5, ${width * 3};
        stroke-dashoffset: ${width * 3};
      }
      15% {
        stroke-dasharray: 8, ${width * 3};
        stroke-dashoffset: ${width * 2.5}; /* Slower at beginning */
      }
      40% {
        stroke-dasharray: 10, ${width * 3};
        stroke-dashoffset: ${width * 1.8}; /* Speed up before peak */
      }
      60% {
        stroke-dasharray: 15, ${width * 3};
        stroke-dashoffset: ${width * 1.2}; /* Faster at peak */
      }
      80% {
        stroke-dasharray: 20, ${width * 3};
        stroke-dashoffset: ${width * 0.6}; /* Even faster going down */
      }
      100% {
        stroke-dasharray: 0, ${width * 3};
        stroke-dashoffset: 0; /* Complete the trace */
      }
    }
    
    .animate-draw {
      animation: draw ${duration}ms cubic-bezier(0.3, 0.1, 0.6, 1) forwards;
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