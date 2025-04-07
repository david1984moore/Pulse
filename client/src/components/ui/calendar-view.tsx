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
      
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-gray-700">
              {t('paymentCalendar')}
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={previousMonth}
                className="rounded-full h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextMonth}
                className="rounded-full h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {onAddBill && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAddBill}
                  className="rounded-full h-8 w-8 p-0 text-primary"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg">
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-600">
                {t(format(currentDate, "MMMM").toLowerCase())} {format(currentDate, "yyyy")}
              </h3>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5">
              {/* Day headers */}
              {daysOfWeek.map((day) => (
                <div key={day} className="text-xs uppercase text-gray-400 text-center py-1">
                  {day}
                </div>
              ))}
              
              {/* Empty placeholders */}
              {placeholders.map((placeholder, index) => (
                <div key={`empty-${index}`} className="h-10 bg-transparent"></div>
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
                      relative h-10 rounded-sm border-none cursor-pointer transition-colors
                      ${isToday 
                        ? "bg-primary/5 text-primary" 
                        : hasBills
                          ? "bg-gray-50/70"
                          : "hover:bg-gray-50/60"
                      }
                    `}
                    onClick={() => handleDayClick(dayOfMonth, dayBills)}
                  >
                    <span className={`text-sm absolute top-1 left-1.5 ${isToday ? "font-medium" : ""}`}>
                      {dayOfMonth}
                    </span>
                    
                    {/* Bill indicators */}
                    {hasBills && (
                      <div className="absolute bottom-1 right-1 flex flex-wrap justify-end gap-0.5">
                        {dayBills.map((bill) => (
                          <div 
                            key={bill.id}
                            className="w-2 h-2 rounded-full bg-red-400/80"
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
            <div className="mt-5 pt-3 bg-gray-50/30 rounded-sm p-3">
              <h4 className="text-xs font-medium text-gray-500 mb-2">{t('calendarLegend')}</h4>
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-400/80 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-500">{t('billsDue')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
