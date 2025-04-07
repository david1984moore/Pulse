import { useState, useEffect } from 'react';
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
  color = '#6366f1',
  width = 160,
  height = 30
}: EkgAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animationId, setAnimationId] = useState(0);

  // Create simpler EKG path
  const createEkgPath = () => {
    const midY = height / 2;
    
    return `
      M 0,${midY} 
      L ${width * 0.3},${midY} 
      L ${width * 0.35},${midY - height * 0.15} 
      L ${width * 0.4},${midY - height * 0.5} 
      L ${width * 0.45},${midY + height * 0.25} 
      L ${width * 0.5},${midY} 
      L ${width * 0.7},${midY} 
      L ${width * 0.75},${midY - height * 0.2} 
      L ${width * 0.8},${midY} 
      L ${width},${midY}
    `;
  };

  // Set up animation
  useEffect(() => {
    if (runAnimation) {
      setVisible(false);
      setProgress(0);
      
      // Small delay to ensure clean animation start
      const startTimeout = setTimeout(() => {
        setAnimationId(id => id + 1);
        setVisible(true);
      }, 50);

      return () => clearTimeout(startTimeout);
    }
  }, [runAnimation]);

  // Animation logic
  useEffect(() => {
    if (!runAnimation || !visible) return;

    // Slow animation that progresses from 0 to 100 over 7 seconds
    const duration = 7000;
    const interval = 50; // Update every 50ms for smoothness
    const step = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          
          // Keep the completed EKG visible for a moment
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 2000);
          
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [runAnimation, visible, onComplete]);

  // Don't render anything when animation is not running
  if (!visible) return null;

  // Calculate where the dot should be on the path
  const dotPosition = () => {
    const x = width * (progress / 100);
    let y = height / 2;
    
    // Adjust y position based on progress
    if (progress > 35 && progress < 40) {
      // P wave
      y = height / 2 - height * 0.15 * ((progress - 35) / 5);
    } else if (progress >= 40 && progress < 45) {
      // QRS peak
      const peakProgress = (progress - 40) / 5;
      if (peakProgress < 0.5) {
        // R up
        y = height / 2 - height * 0.5 * (peakProgress * 2);
      } else {
        // S down
        y = height / 2 - height * 0.5 + height * 0.75 * ((peakProgress - 0.5) * 2);
      }
    } else if (progress > 70 && progress < 80) {
      // T wave
      const tProgress = (progress - 70) / 10;
      if (tProgress < 0.5) {
        y = height / 2 - height * 0.2 * (tProgress * 2);
      } else {
        y = height / 2 - height * 0.2 + height * 0.2 * ((tProgress - 0.5) * 2);
      }
    }
    
    return { x, y };
  };
  
  const { x, y } = dotPosition();
  const ekgPath = createEkgPath();
  
  return (
    <div 
      key={animationId}
      className="ekg-wrapper" 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        marginLeft: '8px',
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        className="ekg-svg"
      >
        {/* Background grid for medical look */}
        <g className="ekg-grid">
          {[0, 1, 2, 3, 4].map(i => (
            <line 
              key={`h-${i}`}
              x1="0" 
              y1={height * (i / 4)} 
              x2={width} 
              y2={height * (i / 4)} 
              stroke="rgba(99, 102, 241, 0.08)"
              strokeWidth="0.5"
            />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <line 
              key={`v-${i}`}
              x1={width * (i / 8)} 
              y1="0" 
              x2={width * (i / 8)} 
              y2={height} 
              stroke="rgba(99, 102, 241, 0.08)"
              strokeWidth="0.5"
            />
          ))}
        </g>
      
        {/* Complete EKG path (faded) */}
        <path
          d={ekgPath}
          fill="none"
          stroke="rgba(99, 102, 241, 0.15)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Animated EKG portion */}
        <path
          className="ekg-path"
          d={ekgPath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1000"
          strokeDashoffset={1000 - (progress / 100) * 1000}
        />
        
        {/* Glowing dot following the line */}
        <circle
          className="ekg-dot"
          cx={x}
          cy={y}
          r="2"
          fill="white"
        />
      </svg>
    </div>
  );
}