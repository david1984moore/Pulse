import { useState } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, ChevronRight, Plus, Home, Zap,
  Wifi, Phone, Droplet, ShoppingCart, Car, CreditCard, Landmark
} from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper function to get the ordinal suffix for a date number
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// Helper function to get the appropriate icon for a bill type
function getBillIcon(billName: string) {
  const iconMap: Record<string, JSX.Element> = {
    'Rent': <Home className="h-3.5 w-3.5 text-white" />,
    'Electric': <Zap className="h-3.5 w-3.5 text-white" />,
    'Water': <Droplet className="h-3.5 w-3.5 text-white" />,
    'Internet': <Wifi className="h-3.5 w-3.5 text-white" />,
    'Phone Service': <Phone className="h-3.5 w-3.5 text-white" />,
    'Car Payment': <Car className="h-3.5 w-3.5 text-white" />,
    'Credit Card': <CreditCard className="h-3.5 w-3.5 text-white" />,
    'Insurance': <Landmark className="h-3.5 w-3.5 text-white" />,
    'Groceries': <ShoppingCart className="h-3.5 w-3.5 text-white" />
  };

  return iconMap[billName] || <CreditCard className="h-3.5 w-3.5 text-white" />;
}

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
    <div key={`empty-${i}`} className="h-12 bg-gray-100 rounded-md border border-gray-200"></div>
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

      <Card className="shadow-sm bg-white/80">
        <CardContent>
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg">
            <div className="flex items-center justify-between px-3 py-4 mb-2">
              <h3 className="text-xl font-bold text-gray-800 capitalize">
                {t(format(currentDate, "MMMM").toLowerCase())} {format(currentDate, "yyyy")}
              </h3>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={previousMonth}
                  className="rounded-full h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={nextMonth}
                  className="rounded-full h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Day headers in a more cohesive row */}
            <div className="flex w-full bg-primary/5 rounded-lg mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex-1 text-xs uppercase font-bold text-gray-700 text-center py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 p-1 rounded-lg">
              {/* Empty placeholders */}
              {placeholders.map((placeholder, index) => (
                <div key={`empty-${index}`} className="h-12 rounded-lg"></div>
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
                      relative h-12 rounded-lg cursor-pointer transition-colors
                      ${isToday 
                        ? "bg-primary/10 text-primary" 
                        : hasBills
                          ? "bg-red-50 hover:bg-red-100"
                          : "bg-white/70 hover:bg-gray-50"
                      }
                    `}
                    onClick={() => handleDayClick(dayOfMonth, dayBills)}
                  >
                    <span className={`text-sm absolute top-1.5 left-1.5 ${isToday ? "font-bold text-primary" : ""} ${hasBills ? "font-semibold text-gray-800" : "font-medium text-gray-700"}`}>
                      {dayOfMonth}
                    </span>

                    {/* Bill indicators */}
                    {hasBills && (
                      <div className="absolute bottom-1.5 right-1.5 flex flex-wrap justify-center gap-1.5">
                        {dayBills.slice(0, 3).map((bill) => (
                          <div 
                            key={bill.id}
                            className={`
                              flex items-center justify-center w-5 h-5 rounded-full 
                              ${bill.name === 'Rent' ? 'bg-gray-600' : 
                                bill.name === 'Electric' ? 'bg-yellow-500' : 
                                bill.name === 'Water' ? 'bg-blue-500' : 
                                bill.name === 'Internet' ? 'bg-blue-400' : 
                                bill.name === 'Phone Service' ? 'bg-slate-500' : 
                                bill.name === 'Car Payment' ? 'bg-gray-600' :
                                bill.name === 'Credit Card' ? 'bg-purple-500' :
                                bill.name === 'Insurance' ? 'bg-indigo-500' :
                                bill.name === 'Groceries' ? 'bg-green-500' :
                                'bg-red-500'} 
                              hover:opacity-90 transition-colors
                            `}

                          >
                            {dayBills.length > 3 && bill === dayBills[2] ? (
                              <span className="text-[9px] font-bold text-white">+{dayBills.length - 2}</span>
                            ) : (
                              getBillIcon(bill.name)
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tooltips for bills */}
                    {dayBills.map((bill) => (
                      <TooltipProvider key={`tooltip-${bill.id}`}>
                        <Tooltip delayDuration={100}>
                          <TooltipContent side="top" className="bg-slate-900 text-white border-0 shadow-lg p-3 rounded-lg max-w-[200px]">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <div className={`
                                  w-4 h-4 rounded-full flex items-center justify-center
                                  ${bill.name === 'Rent' ? 'bg-gray-600' : 
                                    bill.name === 'Electric' ? 'bg-yellow-500' : 
                                    bill.name === 'Water' ? 'bg-blue-500' : 
                                    bill.name === 'Internet' ? 'bg-blue-400' : 
                                    bill.name === 'Phone Service' ? 'bg-slate-500' : 
                                    bill.name === 'Car Payment' ? 'bg-gray-600' :
                                    bill.name === 'Credit Card' ? 'bg-purple-500' :
                                    bill.name === 'Insurance' ? 'bg-indigo-500' :
                                    bill.name === 'Groceries' ? 'bg-green-500' :
                                    'bg-red-500'}
                                `}>
                                  {getBillIcon(bill.name)}
                                </div>
                                <span className="font-semibold">{bill.name}</span>
                              </div>
                              <div className="text-sm text-slate-200 flex flex-col gap-1">
                                <div className="flex justify-between">
                                  <span>{t('amount')}:</span>
                                  <span className="font-medium">${Number(bill.amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{t('dueDate')}:</span>
                                  <span className="font-medium">{bill.due_date}<sup>{getOrdinalSuffix(bill.due_date)}</sup></span>
                                </div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}