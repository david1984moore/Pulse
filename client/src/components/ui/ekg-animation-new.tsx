
import { useState, useEffect, useRef } from 'react';
import './ekg-animation.css';

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
  width = 160,
  height = 28
}: EkgAnimationProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (runAnimation) {
      setIsVisible(false);
      
      setTimeout(() => {
        setAnimationKey(prev => prev + 1);
        setIsVisible(true);
      }, 50);
      
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 4000); // Total animation duration
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [runAnimation, onComplete]);
  
  if (!runAnimation || !isVisible) return null;

  return (
    <div
      key={animationKey}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-block',
        position: 'relative',
        marginLeft: '8px',
        marginTop: '2px'
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          className="ekg-line"
          points={`
            0,${height/2} 
            ${width*0.1},${height/2} 
            ${width*0.15},${height/2} 
            ${width*0.2},${height/2-1} 
            ${width*0.25},${height/2+1} 
            ${width*0.3},${height/2} 
            ${width*0.35},${height/2-height*0.3} 
            ${width*0.38},${height/2-height*0.7} 
            ${width*0.4},${height/2+height*0.5} 
            ${width*0.45},${height/2-height*0.1} 
            ${width*0.5},${height/2} 
            ${width*0.6},${height/2} 
            ${width*0.65},${height/2} 
            ${width*0.7},${height/2} 
            ${width*0.75},${height/2} 
            ${width*0.8},${height/2} 
            ${width*0.85},${height/2} 
            ${width},${height/2}
          `}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <polyline
          className="ekg-echo"
          points={`
            0,${height/2} 
            ${width*0.1},${height/2} 
            ${width*0.15},${height/2} 
            ${width*0.2},${height/2-1} 
            ${width*0.25},${height/2+1} 
            ${width*0.3},${height/2} 
            ${width*0.35},${height/2-height*0.3} 
            ${width*0.38},${height/2-height*0.7} 
            ${width*0.4},${height/2+height*0.5} 
            ${width*0.45},${height/2-height*0.1} 
            ${width*0.5},${height/2} 
            ${width*0.6},${height/2} 
            ${width*0.65},${height/2} 
            ${width*0.7},${height/2} 
            ${width*0.75},${height/2} 
            ${width*0.8},${height/2} 
            ${width*0.85},${height/2} 
            ${width},${height/2}
          `}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <polyline
          className="ekg-echo-2"
          points={`
            0,${height/2} 
            ${width*0.1},${height/2} 
            ${width*0.15},${height/2} 
            ${width*0.2},${height/2-1} 
            ${width*0.25},${height/2+1} 
            ${width*0.3},${height/2} 
            ${width*0.35},${height/2-height*0.3} 
            ${width*0.38},${height/2-height*0.7} 
            ${width*0.4},${height/2+height*0.5} 
            ${width*0.45},${height/2-height*0.1} 
            ${width*0.5},${height/2} 
            ${width*0.6},${height/2} 
            ${width*0.65},${height/2} 
            ${width*0.7},${height/2} 
            ${width*0.75},${height/2} 
            ${width*0.8},${height/2} 
            ${width*0.85},${height/2} 
            ${width},${height/2}
          `}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
