import React from 'react';
import { ChevronLeft, ChevronRight, Home, Wifi } from 'lucide-react';

export const CalendarMockup: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-4">
      {/* Header - Exactly matches screenshot */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-base font-medium">
            April <span className="text-gray-500 font-normal">2025</span>
          </h2>
        </div>
        
        <div className="flex space-x-1">
          <button className="rounded-full h-6 w-6 bg-gray-50 text-gray-600 border border-gray-200 flex items-center justify-center" type="button">
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button className="rounded-full h-6 w-6 bg-gray-50 text-gray-600 border border-gray-200 flex items-center justify-center" type="button">
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Days of week header - Matching screenshot */}
      <div className="grid grid-cols-7 text-center border-b border-gray-200 pb-2 mb-2">
        <div className="text-xs text-gray-500 font-medium">S</div>
        <div className="text-xs text-gray-500 font-medium">M</div>
        <div className="text-xs text-gray-500 font-medium">T</div>
        <div className="text-xs text-gray-500 font-medium">W</div>
        <div className="text-xs text-gray-500 font-medium">T</div>
        <div className="text-xs text-gray-500 font-medium">F</div>
        <div className="text-xs text-gray-500 font-medium">S</div>
      </div>

      {/* Calendar grid - Compact layout matching screenshot */}
      <div className="grid grid-cols-7 gap-y-2">
        {/* Week 1 */}
        <div className="text-center h-6"><span className="text-xs">1</span></div>
        <div className="text-center h-6"><span className="text-xs">2</span></div>
        <div className="text-center h-6"><span className="text-xs">3</span></div>
        <div className="text-center h-6"><span className="text-xs">4</span></div>
        <div className="text-center h-6"><span className="text-xs">5</span></div>
        <div className="text-center h-6"><span className="text-xs">6</span></div>
        <div className="text-center h-6"><span className="text-xs">7</span></div>
        
        {/* Week 2 */}
        <div className="text-center h-6"><span className="text-xs">8</span></div>
        <div className="text-center h-6"><span className="text-xs">9</span></div>
        <div className="text-center h-6"><span className="text-xs">10</span></div>
        <div className="text-center h-6"><span className="text-xs">11</span></div>
        <div className="text-center h-6"><span className="text-xs">12</span></div>
        <div className="text-center h-6"><span className="text-xs">13</span></div>
        <div className="text-center h-6"><span className="text-xs">14</span></div>
        
        {/* Week 3 - with bill on 15 (today) */}
        <div className="flex items-center justify-center h-6 relative">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
            <span className="text-xs text-blue-500 font-semibold">15</span>
          </div>
          <div className="absolute -right-1 -bottom-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
            <Home className="h-2 w-2 text-white" />
          </div>
        </div>
        <div className="text-center h-6"><span className="text-xs">16</span></div>
        <div className="text-center h-6"><span className="text-xs">17</span></div>
        <div className="text-center h-6"><span className="text-xs">18</span></div>
        <div className="text-center h-6"><span className="text-xs">19</span></div>
        <div className="text-center h-6"><span className="text-xs">20</span></div>
        <div className="text-center h-6"><span className="text-xs">21</span></div>
        
        {/* Week 4 - with bill on 28 */}
        <div className="text-center h-6"><span className="text-xs">22</span></div>
        <div className="text-center h-6"><span className="text-xs">23</span></div>
        <div className="text-center h-6"><span className="text-xs">24</span></div>
        <div className="text-center h-6"><span className="text-xs">25</span></div>
        <div className="text-center h-6"><span className="text-xs">26</span></div>
        <div className="text-center h-6"><span className="text-xs">27</span></div>
        <div className="text-center h-6 relative">
          <span className="text-xs">28</span>
          <div className="absolute -right-1 -bottom-1 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
            <Wifi className="h-2 w-2 text-white" />
          </div>
        </div>
        
        {/* Week 5 - partial */}
        <div className="text-center h-6"><span className="text-xs">29</span></div>
        <div className="text-center h-6"><span className="text-xs">30</span></div>
        <div className="text-center h-6"></div>
        <div className="text-center h-6"></div>
        <div className="text-center h-6"></div>
        <div className="text-center h-6"></div>
        <div className="text-center h-6"></div>
      </div>
    </div>
  );
};

export default CalendarMockup;