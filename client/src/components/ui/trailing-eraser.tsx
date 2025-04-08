import React, { useState, useEffect, useRef } from 'react';

/**
 * TrailingEraser - A simple ECG animation with a very visible eraser effect
 * that guarantees the line is erased as the eraser dot travels
 */
export default function TrailingEraser({
  lineColor = "rgba(255, 255, 255, 0.9)",
  width = 500,
  height = 200,
  strokeWidth = 2,
  active = false
}) {
  // Keep track if animation has started
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Generate unique IDs to prevent conflicts with multiple animations
  const randId = useRef(`trace-${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Calculate baseline Y position (horizontal line)
  const baselineY = height / 2;
  
  // Define a classical ECG waveform path with proper P, QRS, and T waves
  // Ensures all waves properly return to the horizontal baseline
  const ekgPathData = `
    M 0,${baselineY}
    
    H ${width * 0.1}
    
    C ${width * 0.12},${baselineY} ${width * 0.14},${baselineY - height * 0.05} ${width * 0.16},${baselineY}
    
    H ${width * 0.24}
    
    L ${width * 0.26},${baselineY + height * 0.06}
    L ${width * 0.28},${baselineY - height * 0.28}
    L ${width * 0.3},${baselineY + height * 0.15}
    L ${width * 0.32},${baselineY}
    
    H ${width * 0.38}
    
    C ${width * 0.42},${baselineY - height * 0.12} ${width * 0.46},${baselineY - height * 0.15} ${width * 0.5},${baselineY}
    
    H ${width}
  `;
  
  // Calculate a rough percent of how far along the path we are during animation
  // for the erase effect - this simplifies the animation process significantly
  // We know the path starts at x=0 and ends at x=width
  const calculateErasePercent = (elapsed: number): number => {
    // Draw phase: 0 to 3.5s
    if (elapsed <= 3.5) {
      return 0; // No erasing during draw phase
    }
    
    // Erase phase: 3.5s to 5.5s (2s duration)
    const eraseElapsed = elapsed - 3.5;
    const erasePercent = Math.min(100, (eraseElapsed / 2) * 100);
    return erasePercent;
  };
  
  // Start animation when active prop changes to true
  useEffect(() => {
    if (active && !isAnimating) {
      let startTime = Date.now();
      let animationFrame: number;
      let erasePercent = 0;
      
      setIsAnimating(true);
      
      // Create a simple animation loop
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        
        // Calculate new erasePercent
        erasePercent = calculateErasePercent(elapsed);
        
        // Set the linear gradient stop positions
        const gradient = document.getElementById(`gradient-${randId}`);
        if (gradient) {
          const stops = gradient.getElementsByTagName('stop');
          if (stops.length >= 2) {
            stops[1].setAttribute('offset', `${erasePercent}%`);
          }
        }
        
        // Update dot positions
        const leadDot = document.getElementById(`lead-dot-${randId}`);
        const eraserDot = document.getElementById(`eraser-dot-${randId}`);
        
        if (leadDot) {
          // Lead dot visibility (shown during draw phase, hidden after)
          if (elapsed <= 3.5) {
            const drawPercent = Math.min(100, (elapsed / 3.5) * 100);
            leadDot.setAttribute('opacity', elapsed > 3.4 ? '0' : '1');
            leadDot.setAttribute('cx', `${drawPercent}%`);
          } else {
            leadDot.setAttribute('opacity', '0');
          }
        }
        
        if (eraserDot) {
          // Eraser dot visibility (hidden during draw phase, shown during erase)
          if (elapsed > 3.5 && elapsed <= 5.5) {
            eraserDot.setAttribute('opacity', '1');
            eraserDot.setAttribute('cx', `${erasePercent}%`);
          } else {
            eraserDot.setAttribute('opacity', '0');
          }
        }
        
        // Continue animation or clean up
        if (elapsed < 5.5) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          // Clean up
          setIsAnimating(false);
        }
      };
      
      // Start the animation
      animationFrame = requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(animationFrame);
        setIsAnimating(false);
      };
    }
  }, [active, isAnimating, width]);
  
  return (
    <div className="ekg-animation" style={{ width, height, position: 'relative' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Define linear gradient for erasing effect */}
        <defs>
          <linearGradient id={`gradient-${randId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="0%" stopColor={lineColor} />
          </linearGradient>
        </defs>
        
        {/* Shadow/glow effect */}
        <path
          d={ekgPathData}
          fill="none"
          stroke={lineColor.replace(')', ', 0.3)')}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(8px)',
            opacity: isAnimating ? 0.6 : 0,
            transition: 'opacity 0.2s'
          }}
        />
        
        {/* Main ECG trace with the gradient */}
        <path
          d={ekgPathData}
          fill="none"
          stroke={`url(#gradient-${randId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 0.2s'
          }}
        />
        
        {/* Lead dot */}
        <circle
          id={`lead-dot-${randId}`}
          cx="0%"
          cy={baselineY}
          r={strokeWidth * 1.5}
          fill="white"
          opacity="0"
          style={{
            filter: `drop-shadow(0 0 ${strokeWidth * 2}px ${lineColor})`,
          }}
        />
        
        {/* Eraser dot */}
        <circle
          id={`eraser-dot-${randId}`}
          cx="0%"
          cy={baselineY}
          r={strokeWidth * 2}
          fill="white"
          opacity="0"
          style={{
            filter: `drop-shadow(0 0 ${strokeWidth * 2}px white)`,
          }}
        />
      </svg>
    </div>
  );
}