import { useState, useEffect } from 'react';
import './ekg-animation.css';

interface EkgAnimationProps {
  runAnimation: boolean;
  onComplete?: () => void;
  color?: string;
  width?: number;
  height?: number;
}

// Super simple span-only implementation to avoid DOM nesting issues
export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#00FF00',
  width = 160,
  height = 30
}: EkgAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Control visibility and completion
  useEffect(() => {
    if (runAnimation) {
      setIsVisible(true);
      
      // Simulate animation completion
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [runAnimation, onComplete]);
  
  if (!isVisible) return null;

  // Simple static green line - no animation - just to show something
  return (
    <span className="ekg-animation-wrapper">
      <span className="ekg-line">━━━∿∿∿╭╮╰╯━━━∿∿</span>
    </span>
  );
}