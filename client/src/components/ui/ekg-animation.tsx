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
      
      // Simple, clean hospital-style ECG trace with a single classic peak
      const points = [
        [0, height/2],           // Start at baseline
        [width*0.2, height/2],   // Flat baseline
        
        // Small preliminary bump (P wave)
        [width*0.25, height/2 - height*0.1],
        [width*0.3, height/2],
        
        // Flat segment before the spike
        [width*0.4, height/2],
        
        // The classic "beep" spike (QRS complex)
        [width*0.45, height/2 + height*0.08],  // Small dip down (Q wave)
        [width*0.5, height/2 - height*0.7],    // Dramatic upward spike (R wave)
        [width*0.55, height/2 + height*0.15],  // Downward after spike (S wave)
        
        // Return to baseline with small bump (T wave)
        [width*0.6, height/2],
        [width*0.7, height/2 - height*0.15],   // T wave
        [width*0.8, height/2],                 // Back to baseline
        
        // Flat to the end
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
      
      // Create the hospital monitor look with a stronger, more noticeable glow
      polyline.style.filter = 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.7))';
      
      // Set up animation parameters for the dash effect
      // Make visible trace segment much longer to show more of the pattern
      polyline.style.strokeDasharray = `${width * 0.8}, ${width * 2}`; 
      polyline.style.strokeDashoffset = `${pathLength}`;
      
      // Add variable speed animation with pure JS to guarantee one-time execution
      const startTime = performance.now();
      const duration = 1500; // Much slower animation to make it clearly visible
      
      // Single animation function that runs once and is not dependent on React state
      // This is key to preventing double animations or repetition
      const animate = (currentTime: number) => {
        // Calculate elapsed time
        const elapsed = currentTime - startTime;
        
        // If animation not complete
        if (elapsed < duration) {
          // Calculate nonlinear progress for variable speed
          // Gentler progression with a more hospital-like steady beep feel
          let progress: number;
          
          if (elapsed < duration * 0.2) {
            // Very slow start (0-20%)
            progress = 0.05 * (elapsed / (duration * 0.2));
          } else if (elapsed < duration * 0.4) {
            // Gradually increasing (20-40%)
            const segmentProgress = (elapsed - duration * 0.2) / (duration * 0.2);
            progress = 0.05 + 0.15 * segmentProgress;
          } else if (elapsed < duration * 0.5) {
            // Brief acceleration for the peak (40-50%)
            const segmentProgress = (elapsed - duration * 0.4) / (duration * 0.1);
            progress = 0.2 + 0.2 * segmentProgress;
          } else if (elapsed < duration * 0.7) {
            // Steadier pace through middle section (50-70%)
            const segmentProgress = (elapsed - duration * 0.5) / (duration * 0.2);
            progress = 0.4 + 0.3 * segmentProgress;
          } else {
            // Gentle finish (70-100%)
            const segmentProgress = (elapsed - duration * 0.7) / (duration * 0.3);
            progress = 0.7 + 0.3 * segmentProgress;
          }
          
          // Calculate dash offset based on progress
          // Use a larger multiplier to ensure more of the pattern is visible
          const dashOffset = pathLength - (pathLength * 1.2 * progress);
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