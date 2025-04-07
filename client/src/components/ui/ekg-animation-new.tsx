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
  color = '#6366f1',
  width = 160,
  height = 30
}: EkgAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [points, setPoints] = useState<string>('');
  const [position, setPosition] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  
  // Generate one complete cycle of EKG data
  const generateEkgPoints = () => {
    const midY = height / 2;
    const baselineY = midY; // Baseline
    const segments = 100; // Number of points to generate
    const pointsArray = [];
    
    // Add initial baseline
    for (let i = 0; i < segments * 0.2; i++) {
      const x = (i / segments) * width;
      pointsArray.push(`${x},${baselineY}`);
    }
    
    // P wave (small bump)
    const pWaveStart = segments * 0.2;
    const pWaveEnd = segments * 0.25;
    for (let i = pWaveStart; i <= pWaveEnd; i++) {
      const t = (i - pWaveStart) / (pWaveEnd - pWaveStart);
      const x = (i / segments) * width;
      const y = baselineY - Math.sin(t * Math.PI) * (height * 0.1);
      pointsArray.push(`${x},${y}`);
    }
    
    // PR segment (return to baseline)
    const prSegmentEnd = segments * 0.35;
    for (let i = pWaveEnd + 1; i <= prSegmentEnd; i++) {
      const x = (i / segments) * width;
      pointsArray.push(`${x},${baselineY}`);
    }
    
    // QRS complex
    // Q wave (small downward deflection)
    const qWaveEnd = segments * 0.38;
    for (let i = prSegmentEnd + 1; i <= qWaveEnd; i++) {
      const t = (i - prSegmentEnd) / (qWaveEnd - prSegmentEnd);
      const x = (i / segments) * width;
      const y = baselineY + Math.sin(t * Math.PI / 2) * (height * 0.15);
      pointsArray.push(`${x},${y}`);
    }
    
    // R wave (sharp upward spike)
    const rWaveEnd = segments * 0.42;
    for (let i = qWaveEnd + 1; i <= rWaveEnd; i++) {
      const t = (i - qWaveEnd) / (rWaveEnd - qWaveEnd);
      const x = (i / segments) * width;
      const y = baselineY - Math.sin(t * Math.PI) * (height * 0.7);
      pointsArray.push(`${x},${y}`);
    }
    
    // S wave (downward deflection after R)
    const sWaveEnd = segments * 0.46;
    for (let i = rWaveEnd + 1; i <= sWaveEnd; i++) {
      const t = (i - rWaveEnd) / (sWaveEnd - rWaveEnd);
      const x = (i / segments) * width;
      const y = baselineY + Math.sin(t * Math.PI / 2) * (height * 0.3);
      pointsArray.push(`${x},${y}`);
    }
    
    // ST segment (return to baseline)
    const stSegmentEnd = segments * 0.55;
    for (let i = sWaveEnd + 1; i <= stSegmentEnd; i++) {
      const t = (i - sWaveEnd) / (stSegmentEnd - sWaveEnd);
      const x = (i / segments) * width;
      const y = baselineY + (1 - t) * (height * 0.3);
      pointsArray.push(`${x},${y}`);
    }
    
    // T wave (rounded bump)
    const tWaveEnd = segments * 0.7;
    for (let i = stSegmentEnd + 1; i <= tWaveEnd; i++) {
      const t = (i - stSegmentEnd) / (tWaveEnd - stSegmentEnd);
      const x = (i / segments) * width;
      const y = baselineY - Math.sin(t * Math.PI) * (height * 0.2);
      pointsArray.push(`${x},${y}`);
    }
    
    // Final baseline
    for (let i = tWaveEnd + 1; i <= segments; i++) {
      const x = (i / segments) * width;
      pointsArray.push(`${x},${baselineY}`);
    }
    
    return pointsArray.join(' ');
  };
  
  // Animation frame effect
  useEffect(() => {
    if (!runAnimation || !isVisible) return;
    
    let animationFrameId: number;
    const totalPoints = 100;
    const animationDuration = 2000; // 2 seconds for the trace
    const frameDuration = animationDuration / totalPoints;
    let lastTimestamp = 0;
    
    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;
      
      if (elapsed > frameDuration) {
        lastTimestamp = timestamp;
        setPosition(prevPos => {
          const newPos = prevPos + 1;
          return newPos <= totalPoints ? newPos : totalPoints;
        });
      }
      
      if (position < totalPoints) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500); // Small delay after trace completes
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [runAnimation, isVisible, position, onComplete]);
  
  // Initial setup on animation request
  useEffect(() => {
    if (runAnimation) {
      setIsVisible(false);
      setPosition(0);
      
      // Generate the points
      const ekgPoints = generateEkgPoints();
      setPoints(ekgPoints);
      
      // Start the animation after a small delay
      setTimeout(() => {
        setAnimationKey(prev => prev + 1);
        setIsVisible(true);
      }, 50);
    } else {
      setIsVisible(false);
    }
  }, [runAnimation, width, height]);
  
  if (!runAnimation || !isVisible) return null;
  
  // Percentage of animation to show (for clipping effect)
  const clipPercentage = (position / 100) * 100;
  
  // Calculate dot position y-coordinate based on current position
  const getDotYPosition = (): number => {
    const midY = height / 2;
    const pos = position;
    
    // Early part is baseline
    if (pos < 20) {
      return midY;
    }
    
    // P wave (small bump)
    if (pos >= 20 && pos < 25) {
      const t = (pos - 20) / 5;
      return midY - Math.sin(t * Math.PI) * (height * 0.1);
    }
    
    // PR segment
    if (pos >= 25 && pos < 35) {
      return midY;
    }
    
    // Q wave
    if (pos >= 35 && pos < 38) {
      const t = (pos - 35) / 3;
      return midY + Math.sin(t * Math.PI / 2) * (height * 0.15);
    }
    
    // R wave (peak)
    if (pos >= 38 && pos < 42) {
      const t = (pos - 38) / 4;
      return midY - Math.sin(t * Math.PI) * (height * 0.7);
    }
    
    // S wave
    if (pos >= 42 && pos < 46) {
      const t = (pos - 42) / 4;
      return midY + Math.sin(t * Math.PI / 2) * (height * 0.3);
    }
    
    // ST segment
    if (pos >= 46 && pos < 55) {
      const t = (pos - 46) / 9;
      return midY + (1 - t) * (height * 0.3);
    }
    
    // T wave
    if (pos >= 55 && pos < 70) {
      const t = (pos - 55) / 15;
      return midY - Math.sin(t * Math.PI) * (height * 0.2);
    }
    
    // Final baseline
    return midY;
  };
  
  const dotY = getDotYPosition();
  
  return (
    <div
      key={animationKey}
      className="ekg-wrapper"
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
        className="ekg-svg"
      >
        {/* Grid lines for EKG effect */}
        <g className="ekg-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={(height / 5) * i}
              x2={width}
              y2={(height / 5) * i}
              stroke="rgba(6, 182, 212, 0.1)"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(width / 10) * i}
              y1="0"
              x2={(width / 10) * i}
              y2={height}
              stroke="rgba(6, 182, 212, 0.1)"
              strokeWidth="0.5"
            />
          ))}
        </g>
        
        {/* EKG line with gradient */}
        <defs>
          <linearGradient id="ekgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          
          {/* Clipping mask for animation */}
          <clipPath id="lineClip">
            <rect x="0" y="0" width={`${clipPercentage}%`} height="100%" />
          </clipPath>
          
          {/* Glow filter */}
          <filter id="ekgGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background EKG line - faded */}
        <polyline
          points={points}
          fill="none"
          stroke="rgba(6, 182, 212, 0.1)"
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        
        {/* Main EKG line with animation */}
        <polyline
          className="ekg-line"
          points={points}
          fill="none"
          stroke="url(#ekgGradient)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          clipPath="url(#lineClip)"
          filter="url(#ekgGlow)"
        />
        
        {/* Moving dot at the head of the line */}
        {position > 0 && position < 100 && (
          <circle
            className="ekg-dot"
            cx={`${clipPercentage}%`}
            cy={dotY}
            r="2"
            fill="white"
          />
        )}
      </svg>
    </div>
  );
}