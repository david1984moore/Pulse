/**
 * EKG Animation Component - For simulating ECG/EKG trace in a hospital monitor
 * Guaranteed to play only once per click, with no repetition
 */
import React, { useRef, useEffect } from 'react';

interface EkgAnimationProps {
  runAnimation: boolean;   // When true, animation will run exactly once
  onComplete?: () => void; // Called when animation completes
  color?: string;          // Line color
  width?: number;          // Component width
  height?: number;         // Component height
}

export function EkgAnimation({
  runAnimation,
  onComplete,
  color = '#3b82f6',
  width = 100,
  height = 25
}: EkgAnimationProps) {
  // Ref to the container element where we'll inject and remove the SVG
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Store ID for this animation instance to ensure no conflicts
  const instanceId = useRef<string>(`ekg-${Date.now()}-${Math.floor(Math.random() * 1000000)}`);
  
  // Animation controlling ref
  const animationRunningRef = useRef<boolean>(false);
  
  // Trigger animation when runAnimation changes
  useEffect(() => {
    // Only proceed if triggered to run and not already running
    if (runAnimation && !animationRunningRef.current && containerRef.current) {
      // Mark animation as running to prevent duplicate animations
      animationRunningRef.current = true;
      
      // Get the container element
      const container = containerRef.current;
      
      // Clear any existing content (important)
      container.innerHTML = '';
      
      // Draw the ECG/EKG trace with SVG
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.setAttribute('width', width.toString());
      svgElement.setAttribute('height', height.toString());
      svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Create and define the path for the ECG/EKG waveform
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      
      // Realistic ECG trace points
      const points = [
        [0, height/2],         // Start at baseline
        [width*0.1, height/2], // Baseline
        
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
      
      polyline.setAttribute('points', points);
      polyline.setAttribute('stroke', color);
      polyline.setAttribute('stroke-width', '2.5');
      polyline.setAttribute('stroke-linecap', 'round');
      polyline.setAttribute('stroke-linejoin', 'round');
      polyline.setAttribute('fill', 'none');
      
      // Add the polyline to the SVG
      svgElement.appendChild(polyline);
      container.appendChild(svgElement);
      
      // Force layout calculation to ensure proper animation
      void svgElement.getBoundingClientRect();
      
      // Get the length of the path to use for animation
      const pathLength = polyline.getTotalLength();
      
      // Create the hospital monitor look with a glow
      polyline.style.filter = 'drop-shadow(0 0 1.5px rgba(59, 130, 246, 0.6))';
      
      // Set up animation parameters for the dash effect
      polyline.style.strokeDasharray = `${width * 0.4}, ${width * 2}`;
      polyline.style.strokeDashoffset = `${pathLength}`;
      
      // Add variable speed animation with pure JS to guarantee one-time execution
      const startTime = performance.now();
      const duration = 700; // Total animation time
      
      // Single animation function that runs once and is not dependent on React state
      // This is key to preventing double animations or repetition
      const animate = (currentTime: number) => {
        // Calculate elapsed time
        const elapsed = currentTime - startTime;
        
        // If animation not complete
        if (elapsed < duration) {
          // Calculate nonlinear progress for variable speed
          // Start slow, accelerate through spike, end faster
          let progress: number;
          
          if (elapsed < duration * 0.2) {
            // Slow start (0-20%)
            progress = 0.2 * (elapsed / (duration * 0.2));
          } else if (elapsed < duration * 0.4) {
            // Accelerate (20-40%)
            const segmentProgress = (elapsed - duration * 0.2) / (duration * 0.2);
            progress = 0.2 + 0.3 * segmentProgress;
          } else if (elapsed < duration * 0.6) {
            // Peak speed (40-60%)
            const segmentProgress = (elapsed - duration * 0.4) / (duration * 0.2);
            progress = 0.5 + 0.3 * segmentProgress;
          } else {
            // Maximum speed to finish (60-100%)
            const segmentProgress = (elapsed - duration * 0.6) / (duration * 0.4);
            progress = 0.8 + 0.2 * segmentProgress;
          }
          
          // Calculate dash offset based on progress
          const dashOffset = pathLength - (pathLength * 1.6 * progress);
          polyline.style.strokeDashoffset = `${dashOffset}`;
          
          // Continue animation
          requestAnimationFrame(animate);
        } else {
          // Animation complete - clean up completely
          setTimeout(() => {
            // Remove all SVG content to ensure no lingering traces
            if (container) {
              container.innerHTML = '';
            }
            
            // Mark animation as complete
            animationRunningRef.current = false;
            
            // Signal completion
            if (onComplete) {
              onComplete();
            }
          }, 50);
        }
      };
      
      // Start animation with requestAnimationFrame for smooth performance
      requestAnimationFrame(animate);
    }
    
    // Clean up on unmount
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [runAnimation, color, height, width, onComplete]);
  
  return (
    <div
      ref={containerRef}
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