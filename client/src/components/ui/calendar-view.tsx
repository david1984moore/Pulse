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
      
      <Card className="border border-gray-200 shadow-md">
        <CardHeader className="pb-3 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-gray-800">
              {t('paymentCalendar')}
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={previousMonth}
                className="rounded-md h-8 w-8 p-0 border border-gray-300 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextMonth}
                className="rounded-md h-8 w-8 p-0 border border-gray-300 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {onAddBill && (
                <Button
                  variant="default"
                  size="icon"
                  onClick={onAddBill}
                  className="rounded-md h-8 w-8 p-0 bg-red-500 hover:bg-red-600 shadow"
                >
                  <Plus className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 capitalize border-b-2 border-primary/30 pb-2 inline-block">
                {t(format(currentDate, "MMMM").toLowerCase())} {format(currentDate, "yyyy")}
              </h3>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {daysOfWeek.map((day) => (
                <div key={day} className="text-xs uppercase font-bold text-gray-700 text-center py-1 mb-1 bg-gray-100 rounded-md border border-gray-200">
                  {day}
                </div>
              ))}
              
              {/* Empty placeholders */}
              {placeholders.map((placeholder, index) => (
                <div key={`empty-${index}`} className="h-12 bg-gray-50 rounded-md border border-gray-100"></div>
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
                      relative h-12 rounded-md border cursor-pointer transition-colors shadow-sm
                      ${isToday 
                        ? "bg-primary/20 text-primary-600 border-primary shadow" 
                        : hasBills
                          ? "bg-red-50 border-red-300 hover:bg-red-100"
                          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }
                    `}
                    onClick={() => handleDayClick(dayOfMonth, dayBills)}
                  >
                    <span className={`text-sm absolute top-1.5 left-1.5 ${isToday ? "font-bold text-primary-700" : ""} ${hasBills ? "font-semibold text-gray-800" : "font-medium text-gray-700"}`}>
                      {dayOfMonth}
                    </span>
                    
                    {/* Bill indicators */}
                    {hasBills && (
                      <div className="absolute bottom-1.5 right-1.5 flex flex-wrap justify-end gap-1">
                        {dayBills.slice(0, 3).map((bill) => (
                          <div 
                            key={bill.id}
                            className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 shadow-sm hover:bg-red-600 transition-colors"
                            title={`${bill.name}: $${Number(bill.amount).toFixed(2)}`}
                          >
                            {dayBills.length > 3 && bill === dayBills[2] ? (
                              <span className="text-[8px] font-bold text-white">+{dayBills.length - 2}</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
              <h4 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">{t('calendarLegend')}</h4>
              <div className="flex items-center">
                <div className="flex items-center bg-white px-3 py-2 rounded-md border border-gray-200">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2 shadow"></div>
                  <span className="text-sm font-semibold text-gray-700">{t('billsDue')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
