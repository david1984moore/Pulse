import { useState, useEffect } from 'react';

interface EkgAnimationProps {
  trigger: boolean;
  duration?: number;
  color?: string;
  width?: number;
  height?: number;
}

export function EkgAnimation({ 
  trigger,
  duration = 2000,
  color = '#3b82f6',
  width = 100,
  height = 25
}: EkgAnimationProps) {
  // Simple animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [key, setKey] = useState(0);

  // When trigger changes to true, start a new animation cycle
  useEffect(() => {
    if (trigger && !isAnimating) {
      // Start animation
      setIsAnimating(true);
      // Force a new animation with key
      setKey(prev => prev + 1);
      
      // Set timeout to end animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      
      // Clean up
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  // No animation = no display
  if (!isAnimating) {
    return null;
  }
  
  // Create a realistic hospital ECG waveform with proper cardiac features
  const points = [
    // Start flat baseline
    [0, height/2],
    [width*0.1, height/2],
    
    // P wave (atrial depolarization)
    [width*0.15, height/2],
    [width*0.18, height/2 - height*0.1],
    [width*0.21, height/2],
    
    // PR segment (conduction delay at AV node)
    [width*0.25, height/2],
    
    // QRS complex (ventricular depolarization)
    [width*0.28, height/2 + height*0.05], // Q wave
    [width*0.30, height/2 - height*0.6],  // R wave (tall spike)
    [width*0.33, height/2 + height*0.2],  // S wave
    
    // ST segment (early ventricular repolarization)
    [width*0.36, height/2],
    
    // T wave (ventricular repolarization)
    [width*0.45, height/2 - height*0.15],
    [width*0.52, height/2],
    
    // End with baseline
    [width*0.75, height/2],
    [width, height/2]
  ].map(point => point.join(',')).join(' ');
  
  // CSS for the animation
  const animationCSS = `
    @keyframes drawEkg_${key} {
      0% { stroke-dasharray: 1, ${width * 2}; stroke-dashoffset: ${width * 2}; }
      100% { stroke-dasharray: ${width * 2}, 0; stroke-dashoffset: 0; }
    }
    
    .ekg-line-${key} {
      stroke: ${color};
      stroke-width: 2.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      filter: drop-shadow(0 0 1.5px rgba(59, 130, 246, 0.6));
      animation: drawEkg_${key} ${duration}ms ease-out forwards;
      animation-iteration-count: 1;
    }
  `;
  
  return (
    <div className="ekg-animation" style={{
      width: `${width}px`,
      height: `${height}px`,
      display: 'inline-block',
      position: 'relative',
      marginLeft: '8px',
      marginTop: '2px'
    }}>
      {/* SVG for the heartbeat line */}
      <svg
        key={key}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <polyline
          className={`ekg-line-${key}`}
          points={points}
        />
      </svg>
      
      {/* Inject animation CSS */}
      <style dangerouslySetInnerHTML={{ __html: animationCSS }} />
    </div>
  );
}