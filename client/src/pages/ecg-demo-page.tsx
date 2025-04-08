import React from 'react';
import { ECGDemo } from '@/components/ui/ecg-demo';
import { PulseLogo } from '@/components/ui/pulse-logo';

export default function ECGDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <header className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center justify-between">
          <PulseLogo size="lg" />
          <div className="text-sm text-gray-500">
            Canvas-based Animation Demo
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto space-y-12">
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
            ECG Trace Animation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A realistic, high-performance animation of a cardiac monitor using HTML5 Canvas.
            This animation mimics the classic heartbeat pattern with P, QRS, and T waves.
          </p>
        </section>
        
        <ECGDemo />
        
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-primary-700 mb-4">
            Technical Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-2">Performance Optimized</h3>
              <p className="text-gray-700">
                Built with HTML5 Canvas API and requestAnimationFrame for silky smooth animation
                with minimal CPU usage and no DOM layout thrashing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-2">Medically Accurate</h3>
              <p className="text-gray-700">
                Implements the proper cardiac waveform with P wave (atrial depolarization),
                QRS complex (ventricular depolarization), and T wave (ventricular repolarization).
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-2">Customizable</h3>
              <p className="text-gray-700">
                Easily customize colors, glow effects, intensity, speed, and other parameters 
                to integrate with your application's design system.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Pulse Finance. All rights reserved.</p>
      </footer>
    </div>
  );
}