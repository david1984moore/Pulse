import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ECGTrace } from './ecg-trace';

export function ECGDemo() {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleStartAnimation = () => {
    setIsAnimating(true);
  };
  
  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/10 pb-4">
        <CardTitle className="text-xl font-bold text-primary-700">ECG Trace Animation</CardTitle>
        <CardDescription>A realistic heartbeat monitor animation using canvas</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full h-60 bg-slate-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          {isAnimating ? (
            <ECGTrace
              height={160}
              onComplete={handleAnimationComplete}
              color="#ffffff"
              glowColor="rgba(96, 165, 250, 0.8)"
              glowIntensity={15}
            />
          ) : (
            <div className="text-center">
              <p className="text-white mb-4">Click the button below to start the animation</p>
              <div className="flex justify-center">
                <Button 
                  onClick={handleStartAnimation}
                  className="bg-primary hover:bg-primary/90 transition-colors"
                >
                  Start ECG Animation
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-primary-600 mb-2">Features</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Canvas-based for optimal performance</li>
              <li>Realistic ECG waveform with P, QRS, and T waves</li>
              <li>Customizable colors and glow effects</li>
              <li>Trail effect for added realism</li>
              <li>Responsive design that adapts to container width</li>
            </ul>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-primary-600 mb-2">Implementation</h3>
            <p className="text-sm text-gray-700">
              This ECG trace animation is implemented using the HTML5 Canvas API with requestAnimationFrame
              for smooth animation. The waveform is mathematically generated to mimic a real ECG trace
              with proper medical characteristics.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}