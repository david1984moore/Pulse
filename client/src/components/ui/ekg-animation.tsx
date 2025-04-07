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
  color = '#3b82f6',
  width = 100,
  height = 25
}: EkgAnimationProps) {
  // Create a key state to force re-render and restart animation
  const [animationKey, setAnimationKey] = useState(0);
  
  // Use a ref to track if we're in the middle of an animation cycle
  const isAnimatingRef = useRef(false);
  
  // Use refs to handle cleanup and prevent issues with stale state
  const timerRef = useRef<number | null>(null);

  // Handle animation trigger
  useEffect(() => {
    // Only trigger on isActive going from false->true
    if (isActive && !isAnimatingRef.current) {
      // We're now animating
      isAnimatingRef.current = true;
      
      // Clear any existing timer
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      
      // Force a fresh render with a new key
      setAnimationKey(prev => prev + 1);
      
      // Set up cleanup - we use a timer to track when animation should be complete
      timerRef.current = window.setTimeout(() => {
        isAnimatingRef.current = false;
        timerRef.current = null;
      }, duration + 100); // Add buffer time
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isActive, duration]);
  
  // Don't render anything when not active
  if (!isActive) {
    return null;
  }
  
  // Create a realistic hospital ECG waveform with medical accuracy
  const points = [
    // Start flat
    [0, height/2],
    [width*0.1, height/2],
    
    // P wave
    [width*0.15, height/2],
    [width*0.18, height/2 - height*0.1],
    [width*0.21, height/2],
    
    // PR segment
    [width*0.25, height/2],
    
    // QRS complex
    [width*0.28, height/2 + height*0.05],
    [width*0.30, height/2 - height*0.6],
    [width*0.33, height/2 + height*0.2],
    
    // ST segment
    [width*0.36, height/2],
    
    // T wave
    [width*0.45, height/2 - height*0.15],
    [width*0.52, height/2],
    
    // End flat
    [width*0.75, height/2],
    [width, height/2]
  ].map(point => point.join(',')).join(' ');
  
  // The animation CSS for the trace
  const css = `
    @keyframes ekgDraw_${animationKey} {
      0% {
        stroke-dasharray: 1, ${width * 2};
        stroke-dashoffset: ${width * 2};
      }
      100% {
        stroke-dasharray: ${width * 2}, 0;
        stroke-dashoffset: 0;
      }
    }
    
    .ekg-line-${animationKey} {
      stroke: ${color};
      stroke-width: 2.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      filter: drop-shadow(0 0 1.5px rgba(59, 130, 246, 0.6));
      animation-name: ekgDraw_${animationKey};
      animation-duration: ${duration}ms;
      animation-timing-function: ease-out;
      animation-delay: 0s;
      animation-iteration-count: 1;
      animation-fill-mode: forwards;
      animation-play-state: running;
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
      {/* SVG with key to force re-render */}
      <svg
        key={animationKey}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <polyline
          className={`ekg-line-${animationKey}`}
          points={points}
        />
      </svg>
      
      {/* Dynamically created style element with animation */}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  );
}