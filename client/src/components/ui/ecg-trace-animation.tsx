import React, { useRef, useEffect, useState } from 'react';
import { ECGTrace } from './ecg-trace';

interface ECGTraceAnimationProps {
  lineColor?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  active?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  onComplete?: () => void;
}

/**
 * ECGTraceAnimation - Canvas-based ECG animation that mimics a cardiac monitor
 * 
 * This is the replacement for the EkgCssAnimation component, using a more efficient
 * and realistic canvas-based approach
 */
export default function ECGTraceAnimation({
  lineColor = "rgba(255, 255, 255, 0.9)",
  width = 500,
  height = 200,
  strokeWidth = 2,
  active = false,
  glowColor = "rgba(96, 165, 250, 0.8)",
  glowIntensity = 15,
  onComplete
}: ECGTraceAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationDoneRef = useRef(false);
  
  // Start animation when active prop changes to true
  useEffect(() => {
    if (active && !isAnimating) {
      setIsAnimating(true);
      animationDoneRef.current = false;
    } else if (!active) {
      setIsAnimating(false);
      animationDoneRef.current = false;
    }
  }, [active, isAnimating]);
  
  // Handle animation completion
  const handleAnimationComplete = () => {
    // Prevent duplicate calls
    if (!animationDoneRef.current) {
      animationDoneRef.current = true;
      setIsAnimating(false);
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  return (
    <div className="ecg-trace-animation" style={{ width: '100%', height: height }}>
      {active && (
        <ECGTrace 
          height={height}
          color={lineColor}
          glowColor={glowColor}
          glowIntensity={glowIntensity}
          onComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}