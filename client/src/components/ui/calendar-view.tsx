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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Payment Calendar</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-lg">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h3>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {daysOfWeek.map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
            
            {/* Empty placeholders */}
            {placeholders}
            
            {/* Day cells */}
            {days.map((day) => {
              const dayOfMonth = day.getDate();
              const isToday = isSameDay(day, new Date());
              const dayBills = getBillForDay(dayOfMonth);
              
              return (
                <div 
                  key={day.toString()}
                  className={`
                    relative h-10 border border-gray-100 p-1
                    ${isToday ? "bg-primary-50 font-medium text-primary" : ""}
                  `}
                >
                  <span className="text-xs">{dayOfMonth}</span>
                  
                  {/* Bill indicators */}
                  {dayBills.map((bill, index) => (
                    <div 
                      key={bill.id}
                      className={`
                        absolute bottom-1 right-1 w-3 h-3 rounded-full
                        ${bill.name === "Rent" ? "bg-red-500" : "bg-amber-500"}
                      `}
                      title={`${bill.name}: $${Number(bill.amount).toFixed(2)}`}
                    />
                  ))}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-500">Legend</h4>
            <div className="mt-2 flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Rent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Other Bills</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
