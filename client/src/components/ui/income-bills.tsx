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
    'Rent': <Home className="h-4 w-4 mr-2 text-white/90" />,
    'Electric': <Zap className="h-4 w-4 mr-2 text-white/90" />,
    'Water': <Droplet className="h-4 w-4 mr-2 text-white/90" />,
    'Internet': <Wifi className="h-4 w-4 mr-2 text-white/90" />,
    'Phone Service': <Phone className="h-4 w-4 mr-2 text-white/90" />,
    'Car Payment': <Car className="h-4 w-4 mr-2 text-white/90" />,
    'Credit Card': <CreditCard className="h-4 w-4 mr-2 text-white/90" />,
    'Insurance': <Landmark className="h-4 w-4 mr-2 text-white/90" />,
    'Groceries': <ShoppingCart className="h-4 w-4 mr-2 text-white/90" />
  };
  
  return iconMap[billName] || <CreditCard className="h-4 w-4 mr-2 text-gray-700" />;
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
      
      <Card className="h-full bg-white shadow-sm border border-gray-100 overflow-hidden rounded-2xl">
        <CardContent className="space-y-6 pt-6">
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
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mr-3 shadow-sm">
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
        
        {/* Financial Summary - Enhanced with new bright modern design */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center">
            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
            {t('financialSummary')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100 shadow-sm">
              <span className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full mr-2 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {t('monthlyIncome')}
              </span>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                +${totalIncome.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-100 shadow-sm">
              <span className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-500 rounded-full mr-2 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {t('monthlyBills')}
              </span>
              <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                -${totalBills.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 mt-1 bg-gradient-to-r from-primary-50 to-white rounded-lg border border-primary-100 shadow-sm">
              <span className="text-sm font-semibold text-gray-700">{t('availableToSpend')}</span>
              <span className="text-sm font-bold text-white bg-primary px-3 py-1 rounded-lg shadow-sm">
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
              className="bg-white hover:bg-gray-50 h-8 px-3 rounded-full shadow-sm border border-gray-200 text-gray-700 transition-all duration-200 group"
              size="sm"
              variant="outline"
            >
              <span className="w-4 h-4 bg-red-500 text-white rounded-full mr-1.5 flex items-center justify-center">
                <Plus className="h-3 w-3" />
              </span>
              <span className="text-xs font-medium">{t('addBill')}</span>
            </Button>
          </div>
          {bills.length > 0 ? (
            <ul className="space-y-3">
              {bills.map((bill) => (
                <li 
                  key={bill.id} 
                  className="flex justify-between items-center bg-white border border-gray-100 rounded-lg 
                             overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 cursor-pointer
                             transition-all duration-300 group"
                  onClick={() => {
                    setSelectedBill(bill);
                    setIsEditBillModalOpen(true);
                  }}
                >
                  {/* Colored side indicator */}
                  <div className="w-1.5 self-stretch bg-gradient-to-b from-red-400 to-red-500"></div>
                  
                  <div className="flex-1 flex p-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="text-red-500">{getBillIcon(bill.name)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{translateBillName(bill.name)}</p>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                          {t('dueOnThe')} {bill.due_date}<sup>{getOrdinalSuffix(bill.due_date)}</sup>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="px-3 py-2 rounded-lg bg-red-50 text-red-600 mr-2 border border-red-100">
                      <p className="text-sm font-bold">
                        -${Number(bill.amount).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 mr-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent's onClick
                        onDeleteBill(bill.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 bg-white rounded-lg text-center border border-dashed border-gray-200">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('noBillsAddedYet')}</p>
              <Button
                onClick={onAddBill}
                className="mt-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-full text-xs px-4 py-2 shadow-sm"
                variant="outline"
              >
                <span className="w-4 h-4 bg-red-500 text-white rounded-full mr-1.5 flex items-center justify-center">
                  <Plus className="h-3 w-3" />
                </span>
                <span className="font-medium">{t('addBill')}</span>
              </Button>
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
              className="bg-white hover:bg-gray-50 h-8 px-3 rounded-full shadow-sm border border-gray-200 text-gray-700 transition-all duration-200 group"
              size="sm"
              variant="outline"
            >
              <span className="w-4 h-4 bg-emerald-500 text-white rounded-full mr-1.5 flex items-center justify-center">
                <Plus className="h-3 w-3" />
              </span>
              <span className="text-xs font-medium">{t('addIncome')}</span>
            </Button>
          </div>
          {income.length > 0 ? (
            <ul className="space-y-3">
              {income.map((inc) => (
                <li 
                  key={inc.id} 
                  className="flex justify-between items-center bg-white border border-gray-100 rounded-lg 
                             overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 cursor-pointer
                             transition-all duration-300 group"
                  onClick={() => {
                    setSelectedIncome(inc);
                    setIsEditIncomeModalOpen(true);
                  }}
                >
                  {/* Colored side indicator */}
                  <div className="w-1.5 self-stretch bg-gradient-to-b from-emerald-400 to-emerald-500"></div>
                  
                  <div className="flex-1 flex p-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{inc.source || t('job')}</p>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                          {t(inc.frequency.toLowerCase())}
                          {inc.frequency === "Weekly" && ` (${(Number(inc.amount) * 4).toFixed(2)}/${t('mo')})`}
                          {inc.frequency === "Bi-weekly" && ` (${(Number(inc.amount) * 2).toFixed(2)}/${t('mo')})`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 mr-2 border border-emerald-100">
                      <p className="text-sm font-bold">
                        +${Number(inc.amount).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 mr-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent's onClick
                        onDeleteIncome(inc.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 bg-white rounded-lg text-center border border-dashed border-gray-200">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-600">{t('noIncomeAddedYet')}</p>
              <Button
                onClick={onAddIncome}
                className="mt-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-full text-xs px-4 py-2 shadow-sm"
                variant="outline"
              >
                <span className="w-4 h-4 bg-emerald-500 text-white rounded-full mr-1.5 flex items-center justify-center">
                  <Plus className="h-3 w-3" />
                </span>
                <span className="font-medium">{t('addIncome')}</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
