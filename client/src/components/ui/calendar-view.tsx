import { useState } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks
} from "date-fns";

interface CalendarViewProps {
  bills: Bill[];
}

export default function CalendarView({ bills }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Get days based on view mode
  let displayDays: Date[] = [];
  let placeholderCount = 0;
  
  if (viewMode === "month") {
    // Monthly view logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    displayDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    placeholderCount = monthStart.getDay();
  } else {
    // Weekly view logic
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    displayDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    placeholderCount = 0; // No placeholders for weekly view
  }
  
  // Create array of placeholder elements for days before the month starts
  const placeholders = Array.from({ length: placeholderCount }).map((_, i) => (
    <div key={`empty-${i}`} className="h-14 border border-gray-100 bg-gray-50/50 rounded"></div>
  ));
  
  // Function to check if a day has a bill due
  const getBillForDay = (day: number) => {
    return bills.filter(bill => bill.due_date === day);
  };
  
  // Handle period navigation
  const navigatePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };
  
  const navigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "week" ? "month" : "week");
  };
  
  // Format the heading title
  const formatDateHeading = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy");
    } else {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle>
            Payment Calendar
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleViewMode}
              className="mr-2 text-xs"
            >
              {viewMode === "week" ? (
                <><CalendarIcon className="h-3 w-3 mr-1" /> Monthly View</>
              ) : (
                <><List className="h-3 w-3 mr-1" /> Weekly View</>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={navigatePrevious}
              className="hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={navigateNext}
              className="hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {formatDateHeading()}
            </h3>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {daysOfWeek.map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 text-center py-1 bg-gray-50 rounded">
                {day}
              </div>
            ))}
            
            {/* Empty placeholders */}
            {placeholders}
            
            {/* Day cells */}
            {displayDays.map((day) => {
              const dayOfMonth = day.getDate();
              const isToday = isSameDay(day, new Date());
              const dayBills = getBillForDay(dayOfMonth);
              const hasBills = dayBills.length > 0;
              
              return (
                <div 
                  key={day.toString()}
                  className={`
                    relative ${viewMode === "week" ? "h-16" : "h-14"} rounded border
                    ${isToday 
                      ? "border-primary bg-primary/5 text-primary" 
                      : hasBills
                        ? "border-gray-200 bg-gray-50/30"
                        : "border-gray-100"
                    }
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-sm p-1 ${isToday ? "font-bold" : ""}`}>
                      {dayOfMonth}
                    </span>
                    
                    {/* Bill indicators */}
                    {hasBills && (
                      <div className={`
                        ${viewMode === "week" 
                          ? "flex flex-col px-1 gap-1 mt-auto mb-1" 
                          : "absolute bottom-1 right-1 flex flex-wrap justify-end gap-0.5"
                        }
                      `}>
                        {dayBills.map((bill) => (
                          viewMode === "week" ? (
                            <div 
                              key={bill.id}
                              className="flex items-center gap-1 text-xs"
                              title={`${bill.name}: $${Number(bill.amount).toFixed(2)}`}
                            >
                              <div className={`
                                w-2 h-2 rounded-full
                                ${bill.name === "Rent" 
                                  ? "bg-red-400" 
                                  : "bg-amber-400"
                                }
                              `}></div>
                              <span className="truncate">{bill.name}</span>
                            </div>
                          ) : (
                            <div 
                              key={bill.id}
                              className={`
                                w-3 h-3 rounded-full border
                                ${bill.name === "Rent" 
                                  ? "bg-red-400 border-red-500" 
                                  : "bg-amber-400 border-amber-500"
                                }
                              `}
                              title={`${bill.name}: $${Number(bill.amount).toFixed(2)}`}
                            />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-5 pt-3 bg-gray-50 rounded p-3 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Bill Types</h4>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 border border-red-500 rounded-full mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Rent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-400 border border-amber-500 rounded-full mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Other Bills</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
