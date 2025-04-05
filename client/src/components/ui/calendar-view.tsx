import { useState } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from "date-fns";

interface CalendarViewProps {
  bills: Bill[];
}

export default function CalendarView({ bills }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Get all days in the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate the starting day of the week (0-6)
  const startDayOfWeek = monthStart.getDay();
  
  // Create array of placeholder elements for days before the month starts
  const placeholders = Array.from({ length: startDayOfWeek }, (_, i) => (
    <div key={`empty-${i}`} className="h-10 border border-gray-100 bg-gray-50"></div>
  ));
  
  // Function to check if a day has a bill due
  const getBillForDay = (day: number) => {
    return bills.filter(bill => bill.due_date === day);
  };
  
  // Handle month navigation
  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  return (
    <Card>
      <CardHeader className="pb-3 border-b border-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <span className="inline-block w-6 h-6 mr-2 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </span>
            Payment Calendar
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={previousMonth}
              className="border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextMonth}
              className="border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-primary">
              {format(currentDate, "MMMM yyyy")}
            </h3>
          </div>
          
          <div className="grid grid-cols-7 gap-1.5">
            {/* Day headers */}
            {daysOfWeek.map((day) => (
              <div key={day} className="text-xs font-bold text-primary/70 text-center py-1 bg-primary/5 rounded">
                {day}
              </div>
            ))}
            
            {/* Empty placeholders */}
            {placeholders.map((placeholder, index) => (
              <div key={`empty-${index}`} className="h-12 bg-gray-50/50 rounded border border-gray-100"></div>
            ))}
            
            {/* Day cells */}
            {days.map((day) => {
              const dayOfMonth = day.getDate();
              const isToday = isSameDay(day, new Date());
              const dayBills = getBillForDay(dayOfMonth);
              
              return (
                <div 
                  key={day.toString()}
                  className={`
                    relative h-12 rounded border transition-all duration-200
                    ${isToday 
                      ? "border-primary bg-primary/10 font-medium text-primary shadow-md" 
                      : "border-gray-100 hover:border-primary/20 hover:bg-primary/5"
                    }
                  `}
                >
                  <span className={`text-sm absolute top-1 left-1.5 ${isToday ? "font-bold" : ""}`}>
                    {dayOfMonth}
                  </span>
                  
                  {/* Bill indicators */}
                  {dayBills.length > 0 && (
                    <div className="absolute bottom-1 right-1 flex flex-wrap justify-end gap-1">
                      {dayBills.map((bill) => (
                        <div 
                          key={bill.id}
                          className={`
                            w-3.5 h-3.5 rounded-full shadow-inner border
                            ${bill.name === "Rent" 
                              ? "bg-red-400 border-red-500" 
                              : "bg-amber-400 border-amber-500"
                            }
                          `}
                          title={`${bill.name}: $${Number(bill.amount).toFixed(2)}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-6 pt-4 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-3 border border-blue-100">
            <h4 className="text-sm font-medium text-primary mb-2">Bill Types</h4>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-3.5 h-3.5 bg-red-400 border border-red-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">Rent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3.5 h-3.5 bg-amber-400 border border-amber-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">Other Bills</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
