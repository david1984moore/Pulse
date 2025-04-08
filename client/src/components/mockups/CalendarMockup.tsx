import React from 'react';
import { ChevronLeft, ChevronRight, Home, Wifi } from 'lucide-react';

export const CalendarMockup: React.FC = () => {
  return (
    <div className="bg-white rounded-xl">
      {/* Header with month and navigation */}
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">
            April <span className="text-gray-500 font-normal">2025</span>
          </h2>
        </div>
        
        <div className="flex space-x-2">
          <button className="rounded-full h-7 w-7 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 flex items-center justify-center" type="button">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="rounded-full h-7 w-7 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 flex items-center justify-center" type="button">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center border-b border-gray-200 pb-2 mb-2">
          <div className="text-xs text-gray-500 font-medium">S</div>
          <div className="text-xs text-gray-500 font-medium">M</div>
          <div className="text-xs text-gray-500 font-medium">T</div>
          <div className="text-xs text-gray-500 font-medium">W</div>
          <div className="text-xs text-gray-500 font-medium">T</div>
          <div className="text-xs text-gray-500 font-medium">F</div>
          <div className="text-xs text-gray-500 font-medium">S</div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-2">
          {/* First row: 1-7 */}
          <div className="h-8 flex items-center justify-center"><span className="text-sm">1</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">2</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">3</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">4</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">5</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">6</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">7</span></div>
          
          {/* Second row: 8-14 */}
          <div className="h-8 flex items-center justify-center"><span className="text-sm">8</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">9</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">10</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">11</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">12</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">13</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">14</span></div>
          
          {/* Third row: 15-21 with bill on 15 */}
          <div className="h-8 flex items-center justify-center relative">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-500">15</span>
            </div>
            <div className="absolute bottom-0 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
              <Home className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">16</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">17</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">18</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">19</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">20</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">21</span></div>
          
          {/* Fourth row: 22-28 with bill on 28 */}
          <div className="h-8 flex items-center justify-center"><span className="text-sm">22</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">23</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">24</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">25</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">26</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">27</span></div>
          <div className="h-8 flex items-center justify-center relative">
            <span className="text-sm">28</span>
            <div className="absolute bottom-0 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
              <Wifi className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          
          {/* Fifth row: 29-30 */}
          <div className="h-8 flex items-center justify-center"><span className="text-sm">29</span></div>
          <div className="h-8 flex items-center justify-center"><span className="text-sm">30</span></div>
        </div>
      </div>
    </div>
  );
};

export default CalendarMockup;