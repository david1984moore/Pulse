import { Bill, Income } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, Minus, Trash2, Pencil, DollarSign, Home, Zap,
  Wifi, Phone, Droplet, ShoppingCart, Car, CreditCard, Landmark
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import EditBillModal from "@/components/ui/edit-bill-modal";
import EditIncomeModal from "@/components/ui/edit-income-modal";

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
    'Rent': <Home className="h-5 w-5 text-white" />,
    'Electric': <Zap className="h-5 w-5 text-white" />,
    'Water': <Droplet className="h-5 w-5 text-white" />,
    'Internet': <Wifi className="h-5 w-5 text-white" />,
    'Phone Service': <Phone className="h-5 w-5 text-white" />,
    'Car Payment': <Car className="h-5 w-5 text-white" />,
    'Credit Card': <CreditCard className="h-5 w-5 text-white" />,
    'Insurance': <Landmark className="h-5 w-5 text-white" />,
    'Groceries': <ShoppingCart className="h-5 w-5 text-white" />
  };
  
  return iconMap[billName] || <CreditCard className="h-5 w-5 text-white" />;
}

interface BillDeduction {
  id: number;
  name: string;
  amount: string;
  dueDate: number;
}

interface BalanceData {
  calculatedBalance: string | null;
  previousBalance?: string;
  deductedBills: BillDeduction[];
}

interface IncomeBillsProps {
  bills: Bill[];
  income: Income[];
  onAddBill: () => void;
  onDeleteBill: (billId: number) => void;
  onAddIncome: () => void;
  onDeleteIncome: (incomeId: number) => void;
  onUpdateBalance: () => void;
}

export default function IncomeBills({
  bills,
  income,
  onAddBill,
  onDeleteBill,
  onAddIncome,
  onDeleteIncome,
  onUpdateBalance,
}: IncomeBillsProps) {
  const { t, language } = useLanguage();
  
  // Helper function to translate common bill names
  const translateBillName = (name: string): string => {
    // Map common bill names to their translation keys
    const billNameMap: Record<string, string> = {
      'Electric': 'electric',
      'Rent': 'rent',
      'Phone Service': 'phoneService',
      'Water': 'water',
      'Internet': 'internet'
    };
    
    // Check if the bill name is in our map
    const translationKey = billNameMap[name];
    if (translationKey && language === 'es') {
      return t(translationKey);
    }
    
    // Return the original name if no translation is available
    return name;
  };
  // State for edit modals
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);
  const [isEditIncomeModalOpen, setIsEditIncomeModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  
  // Fetch account balance
  const { data: balanceData } = useQuery<BalanceData>({
    queryKey: ["/api/calculated-balance"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  // Calculate total monthly income
  const totalIncome = income.reduce((sum, inc) => {
    let monthlyAmount = 0;
    switch (inc.frequency) {
      case "Weekly":
        monthlyAmount = Number(inc.amount) * 4;
        break;
      case "Bi-weekly":
        monthlyAmount = Number(inc.amount) * 2;
        break;
      case "Monthly":
        monthlyAmount = Number(inc.amount);
        break;
      default:
        monthlyAmount = Number(inc.amount);
    }
    return sum + monthlyAmount;
  }, 0);

  // Calculate total monthly bills
  const totalBills = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);

  // Calculate remaining amount
  const availableToSpend = totalIncome - totalBills;

  // Handle closing edit bill modal
  const handleEditBillModalClose = (open: boolean) => {
    setIsEditBillModalOpen(open);
    if (!open) {
      setSelectedBill(null);
    }
  };
  
  // Handle closing edit income modal
  const handleEditIncomeModalClose = (open: boolean) => {
    setIsEditIncomeModalOpen(open);
    if (!open) {
      setSelectedIncome(null);
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
      
      {/* Edit Income Modal */}
      <EditIncomeModal
        open={isEditIncomeModalOpen}
        onOpenChange={handleEditIncomeModalClose}
        income={selectedIncome}
      />
      
      <Card className="h-full bg-gradient-to-br from-white to-gray-50 shadow-md border border-gray-100 overflow-hidden rounded-2xl relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mt-20 -mr-20 z-0"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full -mb-16 -ml-16 z-0"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-teal-50 rounded-full z-0"></div>
        <CardContent className="space-y-6 pt-6 relative z-10">
        {/* Recent Deductions section */}
        {balanceData?.deductedBills && balanceData.deductedBills.length > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-5 rounded-lg backdrop-blur-lg border border-primary/20 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide flex items-center mb-3">
              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
              {t('recentDeductions')}
            </h3>
            <ul className="space-y-2">
              {balanceData.deductedBills.map((bill) => (
                <li key={bill.id} className="flex items-center justify-between p-2 bg-background/20 hover:bg-primary/10 rounded-lg transition-all border border-primary/10 shadow-sm backdrop-blur-md">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3 shadow-sm">
                      {getBillIcon(bill.name)}
                    </div>
                    <span className="font-medium text-gray-200">{translateBillName(bill.name)}</span>
                  </div>
                  <span className="text-red-400 font-bold">-${bill.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Financial Summary - Enhanced with more visual elements */}
        <div className="bg-gradient-to-b from-white to-slate-50 p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-50 rounded-full -ml-8 -mb-8 opacity-60"></div>
          
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center relative z-10">
            <span className="inline-block w-3 h-3 bg-primary rounded-full mr-2"></span>
            {t('financialSummary')}
          </h3>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
              <span className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full mr-3 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {t('monthlyIncome')}
              </span>
              <span className="text-base font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-100 shadow-inner">
                +${totalIncome.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-100 shadow-md hover:shadow-lg transition-shadow">
              <span className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full mr-3 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {t('monthlyBills')}
              </span>
              <span className="text-base font-bold text-red-600 bg-red-50 px-4 py-1.5 rounded-lg border border-red-100 shadow-inner">
                -${totalBills.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 mt-2 bg-gradient-to-r from-primary/10 to-white rounded-lg border border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <span className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-8 h-8 bg-primary rounded-full mr-3 flex items-center justify-center shadow-sm">
                  <DollarSign className="h-4 w-4 text-white" />
                </span>
                {t('availableToSpend')}
              </span>
              <span className="text-base font-bold text-white bg-gradient-to-r from-primary to-primary/80 px-4 py-1.5 rounded-lg shadow-md">
                ${availableToSpend.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Bills List - Enhanced with new sleek styling matching the theme */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
              {t('yourBills')}
            </h3>
            <Button
              onClick={onAddBill}
              className="bg-gradient-to-r from-primary/10 to-white hover:shadow-md h-8 px-4 rounded-full shadow-sm border border-primary/20 text-gray-700 transition-all duration-200 group"
              size="sm"
              variant="outline"
            >
              <span className="w-5 h-5 bg-primary text-white rounded-full mr-2 flex items-center justify-center shadow-sm">
                <Plus className="h-3 w-3" />
              </span>
              <span className="text-xs font-medium">{t('addBill')}</span>
            </Button>
          </div>
          {bills.length > 0 ? (
            <ul className="space-y-4">
              {bills.map((bill) => (
                <li 
                  key={bill.id} 
                  className="relative flex justify-between items-center bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-xl 
                             overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 cursor-pointer
                             transition-all duration-300 group"
                  onClick={() => {
                    setSelectedBill(bill);
                    setIsEditBillModalOpen(true);
                  }}
                >
                  {/* Background decoration */}
                  <div className="absolute right-0 top-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10 opacity-30"></div>
                  
                  {/* Colored side indicator */}
                  <div className="w-2 self-stretch bg-gradient-to-b from-primary to-primary/80"></div>
                  
                  <div className="flex-1 flex p-4 z-10">
                    <div className="flex items-center">
                      {/* Removed the box around the icon and made the icon more visible */}
                      <div className="w-10 h-10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <div className={`
                          w-9 h-9 rounded-full flex items-center justify-center shadow-md
                          ${bill.name === 'Rent' ? 'bg-gray-600' : 
                            bill.name === 'Electric' ? 'bg-yellow-500' : 
                            bill.name === 'Water' ? 'bg-blue-500' : 
                            bill.name === 'Internet' ? 'bg-blue-400' : 
                            bill.name === 'Phone Service' ? 'bg-slate-500' : 
                            bill.name === 'Car Payment' ? 'bg-gray-600' :
                            bill.name === 'Credit Card' ? 'bg-purple-500' :
                            bill.name === 'Insurance' ? 'bg-indigo-500' :
                            bill.name === 'Groceries' ? 'bg-green-500' :
                            'bg-primary'}
                        `}>
                          {/* Increased icon size and adjusted margins */}
                          <span className="text-white">{getBillIcon(bill.name)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{translateBillName(bill.name)}</p>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                          {t('dueOnThe')} <span className="font-bold text-primary">{bill.due_date}<sup>{getOrdinalSuffix(bill.due_date)}</sup></span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center z-10 pr-3">
                    <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-50 to-white text-red-600 mr-3 border border-red-100 shadow-md">
                      <p className="text-sm font-bold">
                        -${Number(bill.amount).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors rounded-full opacity-0 group-hover:opacity-100 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent's onClick
                        onDeleteBill(bill.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-xl text-center border border-dashed border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full opacity-30"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full opacity-30"></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-5">{t('noBillsAddedYet')}</p>
                <Button
                  onClick={onAddBill}
                  className="mt-3 bg-gradient-to-r from-primary/10 to-white text-gray-700 border border-primary/20 hover:shadow-md rounded-full text-xs px-5 py-2.5 shadow-sm transition-all"
                  variant="outline"
                >
                  <span className="w-5 h-5 bg-primary text-white rounded-full mr-2 flex items-center justify-center shadow-sm">
                    <Plus className="h-3 w-3" />
                  </span>
                  <span className="font-medium">{t('addBill')}</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Income List - Enhanced with new sleek styling matching theme */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
              {t('yourIncome')}
            </h3>
            <Button
              onClick={onAddIncome}
              className="bg-gradient-to-r from-emerald-50 to-white hover:shadow-md h-8 px-4 rounded-full shadow-sm border border-emerald-100 text-gray-700 transition-all duration-200 group"
              size="sm"
              variant="outline"
            >
              <span className="w-5 h-5 bg-emerald-500 text-white rounded-full mr-2 flex items-center justify-center shadow-sm">
                <Plus className="h-3 w-3" />
              </span>
              <span className="text-xs font-medium">{t('addIncome')}</span>
            </Button>
          </div>
          {income.length > 0 ? (
            <ul className="space-y-4">
              {income.map((inc) => (
                <li 
                  key={inc.id} 
                  className="relative flex justify-between items-center bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-xl 
                             overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-100 cursor-pointer
                             transition-all duration-300 group"
                  onClick={() => {
                    setSelectedIncome(inc);
                    setIsEditIncomeModalOpen(true);
                  }}
                >
                  {/* Background decoration */}
                  <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-50 rounded-full -mr-10 -mt-10 opacity-30"></div>
                  
                  {/* Colored side indicator */}
                  <div className="w-2 self-stretch bg-gradient-to-b from-emerald-400 to-emerald-500"></div>
                  
                  <div className="flex-1 flex p-4 z-10">
                    <div className="flex items-center">
                      {/* Matching the bill icon style */}
                      <div className="w-10 h-10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{inc.source || t('job')}</p>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                          <span className="font-bold text-emerald-500">{t(inc.frequency.toLowerCase())}</span>
                          {inc.frequency === "Weekly" && ` (${(Number(inc.amount) * 4).toFixed(2)}/${t('mo')})`}
                          {inc.frequency === "Bi-weekly" && ` (${(Number(inc.amount) * 2).toFixed(2)}/${t('mo')})`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center z-10 pr-3">
                    <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-white text-emerald-600 mr-3 border border-emerald-100 shadow-md">
                      <p className="text-sm font-bold">
                        +${Number(inc.amount).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors rounded-full opacity-0 group-hover:opacity-100 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent's onClick
                        onDeleteIncome(inc.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-xl text-center border border-dashed border-emerald-100 relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-50 rounded-full opacity-30"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-50 rounded-full opacity-30"></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm text-gray-600 mb-5">{t('noIncomeAddedYet')}</p>
                <Button
                  onClick={onAddIncome}
                  className="mt-3 bg-gradient-to-r from-emerald-50 to-white text-gray-700 border border-emerald-100 hover:shadow-md rounded-full text-xs px-5 py-2.5 shadow-sm transition-all"
                  variant="outline"
                >
                  <span className="w-5 h-5 bg-emerald-500 text-white rounded-full mr-2 flex items-center justify-center shadow-sm">
                    <Plus className="h-3 w-3" />
                  </span>
                  <span className="font-medium">{t('addIncome')}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
