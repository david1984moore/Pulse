import { useState, useEffect } from 'react';
import './ekg-animation.css';

interface EkgAnimationProps {
  runAnimation: boolean;
  onComplete?: () => void;
  color?: string;
  width?: number;
  height?: number;
}

// This function creates a very simple EKG line using HTML/CSS only
export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#00FF00',
  width = 160,
  height = 30
}: EkgAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Control visibility and trigger completion function
  useEffect(() => {
    if (runAnimation) {
      setIsVisible(true);
      
      // Call onComplete after a fixed duration
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 7000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [runAnimation, onComplete]);
  
  if (!isVisible) return null;

  // Create a simple ECG line with pure CSS
  return (
    <div className="ecg-animation">
      <div className="heartbeat"></div>
    </div>
  );
}