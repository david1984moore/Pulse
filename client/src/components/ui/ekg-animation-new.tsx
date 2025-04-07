import { useState, useEffect, useRef } from 'react';
import './ekg-animation.css';

interface EkgAnimationProps {
  runAnimation: boolean;
  onComplete?: () => void;
  color?: string;
  width?: number;
  height?: number;
}

// Create a continuous sliding EKG animation
export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#6366f1',
  width = 160,
  height = 30
}: EkgAnimationProps) {
  const [visible, setVisible] = useState(false);
  const animationRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number>(0);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [position, setPosition] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  // Define a single EKG beat pattern
  const patternWidth = width * 0.75; // Width of a single EKG beat pattern
  const segmentHeight = height * 0.6; // Height of the EKG spike

  // Function to convert position (0-100) to actual path coordinates
  const getPathPoints = (position: number): {x: number, y: number} => {
    // This maps the relative position within a single EKG pattern
    // to the corresponding y-coordinate
    const midY = height / 2;
    const patternPos = (position % 100) / 100; // Normalize to 0-1 for one pattern
    
    let x = patternPos * patternWidth;
    let y = midY; // Default is the middle line

    // Baseline segment (0-25%)
    if (patternPos <= 0.25) {
      y = midY;
    } 
    // P-wave (small bump) (25-35%)
    else if (patternPos > 0.25 && patternPos <= 0.35) {
      const t = (patternPos - 0.25) / 0.1; // Normalize to 0-1 for this segment
      y = midY - Math.sin(Math.PI * t) * (height * 0.15);
    }
    // PR segment (return to baseline) (35-45%)
    else if (patternPos > 0.35 && patternPos <= 0.45) {
      y = midY;
    }
    // QRS complex (45-60%)
    else if (patternPos > 0.45 && patternPos <= 0.6) {
      const t = (patternPos - 0.45) / 0.15; // Normalize to 0-1 for QRS
      
      if (t <= 0.2) { // Q wave (initial downward)
        y = midY + t * 5 * (height * 0.1);
      } else if (t <= 0.4) { // R wave (sharp upward)
        y = midY + (height * 0.1) - ((t - 0.2) * 5 * (height * 0.7));
      } else if (t <= 0.6) { // S wave (downward after peak)
        y = midY - (height * 0.6) + ((t - 0.4) * 5 * (height * 0.7));
      } else { // Return to baseline
        y = midY + (height * 0.1) - ((t - 0.6) * 2.5 * (height * 0.1));
      }
    }
    // ST segment (60-75%)
    else if (patternPos > 0.6 && patternPos <= 0.75) {
      y = midY;
    }
    // T wave (75-90%)
    else if (patternPos > 0.75 && patternPos <= 0.9) {
      const t = (patternPos - 0.75) / 0.15; // Normalize to 0-1 for T wave
      y = midY - Math.sin(Math.PI * t) * (height * 0.2);
    }
    // Final baseline (90-100%)
    else {
      y = midY;
    }

    return { x, y };
  };

  // Generate points for a continuous path with multiple beats
  const generatePath = (offset = 0) => {
    const points = [];
    const segments = 100; // Number of segments to create a smooth curve
    const repetitions = 3; // Generate multiple patterns for smooth scrolling
    
    for (let i = 0; i < segments * repetitions; i++) {
      const pos = (i / segments) * 100 + offset;
      const { x, y } = getPathPoints(pos);
      points.push(`${x},${y}`);
    }
    
    return points.join(' ');
  };

  // Animation frame function
  const animate = (timestamp: number) => {
    if (!animationStartTimeRef.current) {
      animationStartTimeRef.current = timestamp;
    }

    const elapsed = timestamp - animationStartTimeRef.current;
    
    // Move slower - full animation takes 10 seconds
    const animationDuration = 10000;
    const newPosition = (elapsed / animationDuration) * 100;
    
    setPosition(newPosition % 200); // Loop between 0 and 200 for continuous effect
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Set a fixed duration for the animation
    if (!completionTimeoutRef.current && elapsed > animationDuration * 0.8) {
      completionTimeoutRef.current = setTimeout(() => {
        if (onComplete) onComplete();
      }, animationDuration * 0.2);
    }
  };

  // Start/stop animation based on runAnimation prop
  useEffect(() => {
    if (runAnimation) {
      // Reset state for a clean animation
      setVisible(false);
      animationStartTimeRef.current = 0;
      
      // Clear any existing completion timeout
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
      
      // Clean start with small delay
      setTimeout(() => {
        setPosition(0);
        setAnimationKey(prev => prev + 1);
        setVisible(true);
        
        // Start animation loop
        animationRef.current = requestAnimationFrame(animate);
      }, 50);
    } else {
      // Clean up animation on stop
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
      
      setVisible(false);
    }
    
    // Clean up on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [runAnimation]);

  // Don't render when not visible
  if (!visible) return null;
  
  // Convert scroll position to translation for continuous scrolling
  const translateX = -position * (patternWidth / 100);
  
  // Points for the EKG trace
  const pathPoints = generatePath(0);
  
  // Get current dot position
  const { x: dotX, y: dotY } = getPathPoints(position);

  return (
    <div
      key={animationKey}
      className="ekg-wrapper"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        marginLeft: '8px',
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden' // Hide parts of the path that go out of bounds
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="ekg-svg"
      >
        {/* Background grid */}
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

        {/* Main scrolling group */}
        <g transform={`translate(${translateX}, 0)`}>
          {/* Continuous EKG line */}
          <polyline
            points={pathPoints}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ekg-line"
          />
        </g>
        
        {/* Current position dot */}
        <circle
          className="ekg-dot"
          cx={(width / 2) + (dotX - (patternWidth / 2))}
          cy={dotY}
          r="2"
          fill="white"
        />
      </svg>
    </div>
  );
}