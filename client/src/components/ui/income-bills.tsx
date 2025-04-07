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
    'Rent': <Home className="h-4 w-4 mr-2 text-gray-600" />,
    'Electric': <Zap className="h-4 w-4 mr-2 text-yellow-500" />,
    'Water': <Droplet className="h-4 w-4 mr-2 text-blue-500" />,
    'Internet': <Wifi className="h-4 w-4 mr-2 text-blue-400" />,
    'Phone Service': <Phone className="h-4 w-4 mr-2 text-slate-500" />,
    'Car Payment': <Car className="h-4 w-4 mr-2 text-gray-600" />,
    'Credit Card': <CreditCard className="h-4 w-4 mr-2 text-purple-500" />,
    'Insurance': <Landmark className="h-4 w-4 mr-2 text-indigo-500" />,
    'Groceries': <ShoppingCart className="h-4 w-4 mr-2 text-green-500" />
  };
  
  return iconMap[billName] || <CreditCard className="h-4 w-4 mr-2 text-gray-500" />;
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
      
      <Card className="h-full bg-white shadow-lg shadow-primary/5 border border-border/40 backdrop-blur-md">
        <CardContent className="space-y-6 pt-6">
        {/* Account Balance - Primary Feature */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-5 rounded-lg backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
              {t('accountBalance')}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onUpdateBalance}
              className="h-7 text-xs hover:bg-primary/20 hover:text-primary transition-all"
            >
              {t('updateBalance')}
            </Button>
          </div>
          <div className="mt-3">
            <p className="text-4xl font-bold text-primary glow-text">
              ${balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}
            </p>
          </div>
          {balanceData?.deductedBills && balanceData.deductedBills.length > 0 && (
            <div className="mt-3 text-xs text-foreground/80 bg-background/40 p-3 rounded-lg backdrop-blur-sm">
              <p className="font-semibold">{t('recentDeductions')}:</p>
              <ul className="mt-1 space-y-1">
                {balanceData.deductedBills.map((bill) => (
                  <li key={bill.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getBillIcon(bill.name)}
                      <span className="font-semibold">{translateBillName(bill.name)}</span>
                    </div>
                    <span className="text-red-400 font-semibold">-${bill.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Financial Summary */}
        <div className="bg-background/40 p-5 rounded-lg backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider mb-3">
            {t('financialSummary')}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-background/60 rounded-lg">
              <span className="text-sm font-semibold text-foreground/90 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                {t('monthlyIncome')}
              </span>
              <span className="text-sm font-bold text-green-400">${totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-background/60 rounded-lg">
              <span className="text-sm font-semibold text-foreground/90 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                {t('monthlyBills')}
              </span>
              <span className="text-sm font-bold text-red-400">${totalBills.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 mt-1 bg-primary/10 rounded-lg backdrop-blur-sm">
              <span className="text-sm font-semibold text-foreground/90">{t('remaining')}</span>
              <span className="text-sm font-bold text-primary">${availableToSpend.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bills List */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
              {t('yourBills')}
            </h3>
            <Button
              onClick={onAddBill}
              className="bg-red-500/80 hover:bg-red-500 h-8 w-8 p-0 rounded-full shadow-glow-sm shadow-red-500/20"
              size="icon"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">{t('addBill')}</span>
            </Button>
          </div>
          {bills.length > 0 ? (
            <ul className="space-y-2">
              {bills.map((bill) => (
                <li 
                  key={bill.id} 
                  className="p-3 flex justify-between items-center bg-background/60 backdrop-blur-sm rounded-lg hover:bg-primary/10 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setSelectedBill(bill);
                    setIsEditBillModalOpen(true);
                  }}
                >
                  <div className="flex items-center">
                    {getBillIcon(bill.name)}
                    <div>
                      <p className="text-sm font-semibold text-foreground/90">{translateBillName(bill.name)}</p>
                      <p className="text-xs font-medium text-foreground/60">
                        {t('dueOnThe')} {bill.due_date}<sup>{getOrdinalSuffix(bill.due_date)}</sup>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-md bg-red-950/50 text-red-400 border border-red-500/20">
                      <p className="text-sm font-bold">
                        ${Number(bill.amount).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-foreground/60 hover:text-red-400 hover:bg-red-950/40 transition-colors rounded-full"
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
            <div className="text-sm text-foreground/70 p-4 bg-background/40 rounded-lg text-center backdrop-blur-sm">{t('noBillsAddedYet')}</div>
          )}
        </div>

        {/* Income List */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
              {t('yourIncome')}
            </h3>
            <Button
              onClick={onAddIncome}
              className="bg-green-500/80 hover:bg-green-500 h-8 w-8 p-0 rounded-full shadow-glow-sm shadow-green-500/20"
              size="icon"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">{t('addIncome')}</span>
            </Button>
          </div>
          {income.length > 0 ? (
            <ul className="space-y-2">
              {income.map((inc) => (
                <li 
                  key={inc.id} 
                  className="p-3 flex justify-between items-center bg-background/60 backdrop-blur-sm rounded-lg hover:bg-primary/10 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setSelectedIncome(inc);
                    setIsEditIncomeModalOpen(true);
                  }}
                >
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                    <div>
                      <p className="text-sm font-semibold text-foreground/90">{inc.source || t('job')}</p>
                      <p className="text-xs font-medium text-foreground/60">
                        {t(inc.frequency.toLowerCase())}
                        {inc.frequency === "Weekly" && ` (${(Number(inc.amount) * 4).toFixed(2)}/${t('mo')})`}
                        {inc.frequency === "Bi-weekly" && ` (${(Number(inc.amount) * 2).toFixed(2)}/${t('mo')})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-md bg-green-950/50 text-green-400 border border-green-500/20">
                      <p className="text-sm font-bold">${Number(inc.amount).toFixed(2)}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-foreground/60 hover:text-red-400 hover:bg-red-950/40 transition-colors rounded-full"
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
            <div className="text-sm text-foreground/70 p-4 bg-background/40 rounded-lg text-center backdrop-blur-sm">{t('noIncomeAddedYet')}</div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
