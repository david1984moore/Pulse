/**
 * EKG Animation Component - One-time, hospital-style EKG trace animation
 */
import React, { useRef, useEffect } from 'react';

interface EkgAnimationProps {
  runAnimation: boolean;  // When true, animation will run once
  onComplete?: () => void; // Called when animation completes
  color?: string;         // Line color
  width?: number;         // Component width
  height?: number;        // Component height
}

export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#3b82f6',
  width = 100,
  height = 25
}: EkgAnimationProps) {
  // Track animation state to prevent multiple animations
  const animating = useRef(false);
  const animationRef = useRef<HTMLDivElement>(null);
  
  // Animation points - a realistic ECG trace
  const points = [
    [0, height/2],         // Start at baseline
    [width*0.08, height/2], // Baseline
    
    // P wave (atrial depolarization)
    [width*0.15, height/2 - height*0.1],
    [width*0.18, height/2],
    
    // PR segment
    [width*0.25, height/2],
    
    // QRS complex (ventricular depolarization)
    [width*0.28, height/2 + height*0.05], // Q wave
    [width*0.30, height/2 - height*0.6],  // R wave (tall spike)
    [width*0.33, height/2 + height*0.2],  // S wave
    
    // ST segment
    [width*0.36, height/2],
    
    // T wave (ventricular repolarization)
    [width*0.45, height/2 - height*0.15],
    [width*0.52, height/2],
    
    // Return to baseline
    [width*0.75, height/2],
    [width, height/2]
  ].map(point => point.join(',')).join(' ');
  
  // Clean animation state whenever component unmounts
  useEffect(() => {
    return () => {
      animating.current = false;
    };
  }, []);
  
  // Handle animation trigger
  useEffect(() => {
    // Only start a new animation if triggered and not already animating
    if (runAnimation && !animating.current) {
      animating.current = true;
      
      const container = animationRef.current;
      if (!container) return;
      
      // Clear any existing content
      container.innerHTML = '';
      
      // Create and configure a new SVG for this animation
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Create the polyline for the ECG trace
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('points', points);
      polyline.setAttribute('stroke', color);
      polyline.setAttribute('stroke-width', '2.5');
      polyline.setAttribute('stroke-linecap', 'round');
      polyline.setAttribute('stroke-linejoin', 'round');
      polyline.setAttribute('fill', 'none');
      
      // Get the total length of the path for animation
      svg.appendChild(polyline);
      container.appendChild(svg);
      
      const pathLength = polyline.getTotalLength();
      
      // Set initial state (invisible line)
      polyline.style.strokeDasharray = pathLength.toString();
      polyline.style.strokeDashoffset = pathLength.toString();
      polyline.style.filter = 'drop-shadow(0 0 1.5px rgba(59, 130, 246, 0.6))';
      
      // Force a reflow to ensure initial state is set
      void polyline.getBoundingClientRect();
      
      // Animate drawing the line
      const startTime = performance.now();
      const duration = 800; // ms to complete animation (much faster)
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        
        if (elapsed < duration) {
          // Calculate how much of the path to show (0 to 1)
          const progress = elapsed / duration;
          const dashOffset = pathLength * (1 - progress);
          
          // Apply the current dash offset
          polyline.style.strokeDashoffset = dashOffset.toString();
          
          // Continue animation
          requestAnimationFrame(animate);
        } else {
          // Animation complete
          polyline.style.strokeDashoffset = '0';
          
          // Hold final state briefly, then clean up
          setTimeout(() => {
            // Clear the container to completely remove the SVG
            container.innerHTML = '';
            animating.current = false;
            if (onComplete) onComplete();
          }, 200); // Shorter hold time
        }
      };
      
      // Start the animation
      requestAnimationFrame(animate);
    }
  }, [runAnimation, color, height, width, points, onComplete]);
  
  return (
    <div 
      ref={animationRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-block',
        position: 'relative',
        marginLeft: '8px',
        marginTop: '2px',
        overflow: 'hidden'
      }}
    />
  );
}