import { useState } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useBillFormState } from "@/hooks/use-bill-form-state";
import EditBillModal from "@/components/ui/edit-bill-modal";
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
  onAddBill?: () => void;
}

export default function CalendarView({ bills, onAddBill }: CalendarViewProps) {
  const { t } = useLanguage();
  const { setSelectedDueDate } = useBillFormState();
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map(day => t(day));
  
  // State for edit bill modal
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
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
  
  // Handle closing edit bill modal
  const handleEditBillModalClose = (open: boolean) => {
    setIsEditBillModalOpen(open);
    if (!open) {
      setSelectedBill(null);
    }
  };
  
  // We don't need to handle closing the add bill modal locally
  // as it's now done in the parent component
  
  // Handle clicking on a day
  const handleDayClick = (day: number, dayBills: Bill[]) => {
    if (dayBills.length > 0) {
      // If there are bills, select the first one to edit
      setSelectedBill(dayBills[0]);
      setIsEditBillModalOpen(true);
      console.log("Opening edit modal for bill:", dayBills[0]);
    } else if (onAddBill) {
      // If no bills and onAddBill is provided, open the standardized add bill modal
      setSelectedDueDate(day);
      onAddBill(); // Use the parent component's add bill handler
      console.log("Opening add bill modal with due date:", day);
    }
  };
  
  return (
    <>
      {/* Edit Bill Modal */}
      <EditBillModal 
        open={isEditBillModalOpen} 
        onOpenChange={handleEditBillModalClose} 
        bill={selectedBill} 
      />
      
      <Card>
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle>
              {t('paymentCalendar')}
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={previousMonth}
                className="hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextMonth}
                className="hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {onAddBill && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onAddBill}
                  className="hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {t(format(currentDate, "MMMM").toLowerCase())} {format(currentDate, "yyyy")}
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
              {placeholders.map((placeholder, index) => (
                <div key={`empty-${index}`} className="h-10 bg-gray-50/50 rounded border border-gray-100"></div>
              ))}
              
              {/* Day cells */}
              {days.map((day) => {
                const dayOfMonth = day.getDate();
                const isToday = isSameDay(day, new Date());
                const dayBills = getBillForDay(dayOfMonth);
                const hasBills = dayBills.length > 0;
                
                return (
                  <div 
                    key={day.toString()}
                    className={`
                      relative h-10 rounded border cursor-pointer hover:border-primary hover:bg-primary/5
                      ${isToday 
                        ? "border-primary bg-primary/5 text-primary" 
                        : hasBills
                          ? "border-gray-200 bg-gray-50/30"
                          : "border-gray-100"
                      }
                    `}
                    onClick={() => handleDayClick(dayOfMonth, dayBills)}
                  >
                    <span className={`text-sm absolute top-1 left-1.5 ${isToday ? "font-bold" : ""}`}>
                      {dayOfMonth}
                    </span>
                    
                    {/* Bill indicators */}
                    {hasBills && (
                      <div className="absolute bottom-1 right-1 flex flex-wrap justify-end gap-0.5">
                        {dayBills.map((bill) => (
                          <div 
                            key={bill.id}
                            className="w-3 h-3 rounded-full border bg-red-400 border-red-500"
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
            <div className="mt-5 pt-3 bg-gray-50 rounded p-3 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t('calendarLegend')}</h4>
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 border border-red-500 rounded-full mr-2"></div>
                  <span className="text-xs font-medium text-gray-600">{t('billsDue')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
