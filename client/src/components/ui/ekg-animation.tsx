// Super simple EKG animation that runs exactly once when activated
import { useState, useEffect } from 'react';

// Interface for the component props
interface EkgAnimationProps {
  runAnimation: boolean;
  onComplete?: () => void;
  color?: string;
  width?: number;
  height?: number;
}

export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#3b82f6',
  width = 100,
  height = 25
}: EkgAnimationProps) {
  // Animation key to force new animation on each trigger
  const [animationKey, setAnimationKey] = useState(0);
  
  // Visibility state
  const [isVisible, setIsVisible] = useState(false);
  
  // When runAnimation changes to true, start a new animation cycle
  useEffect(() => {
    if (runAnimation && !isVisible) {
      // Show the animation
      setIsVisible(true);
      
      // Increment key to force new animation
      setAnimationKey(prev => prev + 1);
      
      // Set timeout to automatically hide and clean up after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 2000); // Match duration of animation
      
      return () => clearTimeout(timer);
    }
  }, [runAnimation, onComplete]);
  
  // If not visible, render nothing
  if (!isVisible) {
    return null;
  }
  
  // ECG trace points - creates a realistic heartbeat pattern
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
    
    // ST segment & T wave (ventricular repolarization)
    [width*0.36, height/2],
    [width*0.45, height/2 - height*0.15],
    [width*0.52, height/2],
    
    // Return to baseline
    [width*0.75, height/2],
    [width, height/2]
  ].map(point => point.join(',')).join(' ');
  
  // Create animation CSS for this specific instance
  const animationCSS = `
    @keyframes drawEkg_${animationKey} {
      0% { 
        stroke-dasharray: 0, ${width * 2}; 
        stroke-dashoffset: ${width * 2}; 
      }
      100% { 
        stroke-dasharray: ${width * 2}, 0; 
        stroke-dashoffset: 0; 
      }
    }
  `;
  
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
      {/* Inject animation keyframes */}
      <style>{animationCSS}</style>
      
      {/* SVG for the EKG line */}
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
            animation: `drawEkg_${animationKey} 2s ease-out forwards`,
            animationIterationCount: '1'
          }}
        />
      </svg>
    </div>
  );
}