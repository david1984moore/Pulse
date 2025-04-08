import React from 'react';
import { Link } from 'wouter';

interface PulseLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withTagline?: boolean;
  asLink?: boolean;
}

export function PulseLogo({
  size = 'md',
  className = '',
  withTagline = false,
  asLink = true
}: PulseLogoProps) {
  // Size mappings
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };
  
  // Container classes
  const containerClasses = `flex items-center ${className}`;
  
  // Logo content - don't use links within the logo to avoid invalid nesting
  const logoContent = (
    <>
      <div className="relative mr-2 flex items-center justify-center">
        <div className={`bg-gradient-to-br from-primary-600 to-primary-400 rounded-lg shadow-md p-1.5 flex items-center justify-center ${
          size === 'sm' ? 'w-8 h-8' : 
          size === 'md' ? 'w-10 h-10' : 
          size === 'lg' ? 'w-12 h-12' : 
          'w-14 h-14'
        }`}>
          <span className="text-white font-bold font-display tracking-wide">P</span>
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className={`font-display font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight ${sizeClasses[size]}`}>
          pulse
        </span>
        
        {withTagline && (
          <span className="text-xs text-gray-500 -mt-1">
            financial insights in real-time
          </span>
        )}
      </div>
    </>
  );
  
  // Check if we should conditionally make the parent a link
  if (asLink) {
    return (
      <Link href="/" className={containerClasses}>
        <div className="flex items-center">
          {logoContent}
        </div>
      </Link>
    );
  }
  
  // Otherwise return just the logo content
  return (
    <div className={containerClasses}>
      {logoContent}
    </div>
  );
}