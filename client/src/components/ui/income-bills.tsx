import { Bill, Income } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import EditBillModal from "@/components/ui/edit-bill-modal";
import EditIncomeModal from "@/components/ui/edit-income-modal";

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
      
      <Card className="h-full border-0 shadow-sm">
        <CardContent className="space-y-6 pt-6">
        {/* Account Balance - Primary Feature */}
        <div className="bg-primary/5 p-5 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-medium text-gray-600 uppercase">
              {t('accountBalance')}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onUpdateBalance}
              className="h-7 text-xs rounded-full"
            >
              {t('updateBalance')}
            </Button>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-medium text-primary">
              ${balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}
            </p>
          </div>
          {balanceData?.deductedBills && balanceData.deductedBills.length > 0 && (
            <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded shadow-sm">
              <p className="font-medium">{t('recentDeductions')}:</p>
              <ul className="mt-1 space-y-1">
                {balanceData.deductedBills.map((bill) => (
                  <li key={bill.id} className="flex justify-between">
                    <span className="font-medium">{translateBillName(bill.name)}</span>
                    <span className="text-red-400 font-medium">-${bill.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Financial Summary */}
        <div className="bg-gray-50/50 p-5 rounded-lg shadow-sm">
          <h3 className="text-xs font-medium text-gray-600 uppercase mb-3">
            {t('financialSummary')}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {t('monthlyIncome')}
              </span>
              <span className="text-sm font-medium text-green-500">${totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                {t('monthlyBills')}
              </span>
              <span className="text-sm font-medium text-red-400">${totalBills.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-2 mt-1 bg-primary/5 rounded shadow-sm">
              <span className="text-sm font-medium text-gray-700">{t('availableToSpend')}</span>
              <span className="text-sm font-medium text-primary">${availableToSpend.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bills List */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-medium text-gray-600 uppercase">
              {t('yourBills')}
            </h3>
            <Button
              onClick={onAddBill}
              className="bg-red-400 hover:bg-red-500 h-7 w-7 p-0 rounded-full"
              size="icon"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only">{t('addBill')}</span>
            </Button>
          </div>
          {bills.length > 0 ? (
            <ul className="space-y-2">
              {bills.map((bill) => (
                <li key={bill.id} className="p-3 flex justify-between items-center bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{translateBillName(bill.name)}</p>
                    <p className="text-xs text-gray-500">
                      {t('dueOnThe')} {bill.due_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-md bg-red-50 text-red-400">
                      <p className="text-sm font-medium">
                        ${Number(bill.amount).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedBill(bill);
                        setIsEditBillModalOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-50 transition-colors"
                      onClick={() => onDeleteBill(bill.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-4 bg-gray-50/50 rounded-lg text-center shadow-sm">{t('noBillsAddedYet')}</div>
          )}
        </div>

        {/* Income List */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-medium text-gray-600 uppercase">
              {t('yourIncome')}
            </h3>
            <Button
              onClick={onAddIncome}
              className="bg-green-400 hover:bg-green-500 h-7 w-7 p-0 rounded-full"
              size="icon"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only">{t('addIncome')}</span>
            </Button>
          </div>
          {income.length > 0 ? (
            <ul className="space-y-2">
              {income.map((inc) => (
                <li key={inc.id} className="p-3 flex justify-between items-center bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{inc.source || t('job')}</p>
                    <p className="text-xs text-gray-500">
                      {t(inc.frequency.toLowerCase())}
                      {inc.frequency === "Weekly" && ` (${(Number(inc.amount) * 4).toFixed(2)}/${t('mo')})`}
                      {inc.frequency === "Bi-weekly" && ` (${(Number(inc.amount) * 2).toFixed(2)}/${t('mo')})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-md bg-green-50 text-green-500">
                      <p className="text-sm font-medium">${Number(inc.amount).toFixed(2)}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedIncome(inc);
                        setIsEditIncomeModalOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-50 transition-colors"
                      onClick={() => onDeleteIncome(inc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-4 bg-gray-50/50 rounded-lg text-center shadow-sm">{t('noIncomeAddedYet')}</div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
