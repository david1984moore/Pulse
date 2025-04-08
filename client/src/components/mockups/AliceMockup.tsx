import React from 'react';
import { DollarSign } from 'lucide-react';

export const AliceMockup: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      {/* Alice header */}
      <div className="bg-blue-100 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-500 h-10 w-10 flex items-center justify-center mr-3" 
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <span className="font-bold text-black text-xl">Alice</span>
            <span className="text-xs text-gray-600 ml-1">v1.0</span>
          </div>
        </div>
        
        {/* Balance display */}
        <div className="bg-blue-200 rounded-full px-4 py-1 flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-blue-700" />
          <span className="font-medium text-blue-800">$800.00</span>
          <span className="ml-1 h-2 w-2 bg-green-400 rounded-full"></span>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="bg-white p-4">
        {/* Alice's first message */}
        <div className="mb-4 flex items-start">
          <div className="bg-blue-500 h-8 w-8 mr-2 flex-shrink-0 flex items-center justify-center"
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
            <p className="text-gray-800 text-sm">Hello! I'm Alice. Ask me what you can spend.</p>
          </div>
        </div>
        
        {/* User's question */}
        <div className="mb-4 flex justify-end">
          <div className="bg-blue-600 p-3 rounded-lg max-w-xs">
            <p className="text-white text-sm">Can I spend $75 on dining out this month?</p>
          </div>
        </div>
        
        {/* Alice's response */}
        <div className="mb-4 flex items-start">
          <div className="bg-blue-500 h-8 w-8 mr-2 flex-shrink-0 flex items-center justify-center"
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
            <p className="text-gray-800 text-sm">
              Yes, you can spend $75 on dining. Your balance after this purchase will be $725, which is enough to cover your upcoming bills.
            </p>
          </div>
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 p-2 flex items-center">
        <div className="flex-1 px-3 py-2 text-gray-400 text-sm">
          Ask Alice...
        </div>
        <button className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium" disabled>
          Send
        </button>
      </div>
    </div>
  );
};

export default AliceMockup;