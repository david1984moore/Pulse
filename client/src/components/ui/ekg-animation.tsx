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
      
      // Add shadow effect for a hospital monitor look
      polyline.style.filter = 'drop-shadow(0 0 1.5px rgba(59, 130, 246, 0.6))';
      
      // Force a reflow to ensure initial state is set
      void polyline.getBoundingClientRect();
      
      // Animate drawing the line with a follow-through effect
      const startTime = performance.now();
      const duration = 450; // Fast animation (450ms)
      
      // For the follow-through effect, we need a window of visibility that moves across the path
      // This creates the classic heart monitor effect with leading & trailing edges
      const traceLength = Math.min(width * 0.4, pathLength * 0.3); // Visible portion length
      
      // Set up initial state - only a portion of the trace is visible
      polyline.style.strokeDasharray = `${traceLength}, ${pathLength}`;
      polyline.style.strokeDashoffset = `${pathLength}`; // Start at the beginning
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        
        if (elapsed < duration) {
          // Calculate progress from 0 to 1
          const progress = elapsed / duration;
          
          // Create sliding window effect
          // As progress increases, we slide the visible portion of the line
          const leadingEdge = pathLength * progress;
          
          // Offset needs to consider the trace length to create the follow-through
          polyline.style.strokeDashoffset = `${pathLength - leadingEdge}`;
          
          // Continue animation
          requestAnimationFrame(animate);
        } else {
          // Animation complete - now animate the trace off the screen to the right
          // This creates a smooth "exit" effect similar to a real ECG monitor
          const exitDuration = 150; // Very quick exit
          const exitStartTime = performance.now();
          
          const animateExit = (exitTime: number) => {
            const exitElapsed = exitTime - exitStartTime;
            
            if (exitElapsed < exitDuration) {
              // Continue moving the trace off screen to the right
              const exitProgress = exitElapsed / exitDuration;
              const extraOffset = pathLength * exitProgress * 0.5; // Extra movement
              
              polyline.style.strokeDashoffset = `${-extraOffset}`;
              requestAnimationFrame(animateExit);
            } else {
              // Clean up after exit animation
              container.innerHTML = '';
              animating.current = false;
              if (onComplete) onComplete();
            }
          };
          
          // Start exit animation
          requestAnimationFrame(animateExit);
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