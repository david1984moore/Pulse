import React from 'react';
import { DollarSign } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export const AliceMockup: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-100">
      {/* Alice header - Identical to screenshot */}
      <div className="bg-blue-100 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-500 h-8 w-8 flex items-center justify-center mr-2" 
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <span className="text-white font-bold text-base">A</span>
          </div>
          <div>
            <span className="font-bold text-black text-lg">{t('aliceName')}</span>
            <span className="text-xs text-gray-600 ml-1">v1.0</span>
          </div>
        </div>
        
        {/* Balance display with green indicator */}
        <div className="bg-blue-200 rounded-full px-2 py-0.5 flex items-center">
          <DollarSign className="h-3 w-3 mr-1 text-blue-700" />
          <span className="font-medium text-blue-800 text-xs">$800.00</span>
          <span className="ml-1 h-1.5 w-1.5 bg-green-400 rounded-full"></span>
        </div>
      </div>
      
      {/* Chat messages - Exactly matching screenshot */}
      <div className="bg-white p-2">
        {/* Alice's first message - Exact text from screenshot */}
        <div className="mb-2 flex items-start">
          <div className="bg-blue-500 h-6 w-6 mr-1.5 flex-shrink-0 flex items-center justify-center" 
               style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <div className="bg-gray-100 p-1.5 rounded-md">
            <p className="text-gray-800 text-xs">
              {t('aliceGreeting')}
            </p>
          </div>
        </div>
        
        {/* User's question - Exact text from screenshot */}
        <div className="mb-2 flex justify-end">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <p className="text-white text-xs">
              {t('aliceQuestion')}
            </p>
          </div>
        </div>
        
        {/* Alice's response - Exact text from screenshot */}
        <div className="mb-1 flex items-start">
          <div className="bg-blue-500 h-6 w-6 mr-1.5 flex-shrink-0 flex items-center justify-center" 
               style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <div className="bg-gray-100 p-1.5 rounded-md">
            <p className="text-gray-800 text-xs">
              {t('aliceResponse')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Input area - Matching screenshot with "Ask" button */}
      <div className="border-t border-gray-200 p-1.5 flex items-center">
        <div className="flex-1 px-2 text-gray-400 text-xs">
          {t('askAlice')}
        </div>
        <button className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-medium" disabled>
          {t('ask')}
        </button>
      </div>
    </div>
  );
};

export default AliceMockup;