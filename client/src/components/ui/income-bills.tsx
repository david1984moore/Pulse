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
      
      <Card className="h-full">
        <CardContent className="space-y-6 pt-6">
        {/* Account Balance - Primary Feature */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border-2 border-primary/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mt-20 -mr-20 z-0"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -mb-10 -ml-10 z-0"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              {t('accountBalance')}
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUpdateBalance}
              className="h-8 text-xs font-medium bg-white hover:bg-primary/10 border-primary/20 hover:border-primary/30 shadow-sm transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {t('updateBalance')}
            </Button>
          </div>
          
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline">
              <span className="text-lg font-medium text-gray-600 mr-2">$</span>
              <p className="text-4xl font-bold text-primary">
                {balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Current balance</p>
          </div>
          
          {balanceData?.deductedBills && balanceData.deductedBills.length > 0 && (
            <div className="mt-4 text-xs bg-white/70 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-sm relative z-10">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <p className="font-semibold text-gray-700">{t('recentDeductions')}:</p>
              </div>
              <ul className="space-y-1.5">
                {balanceData.deductedBills.map((bill) => (
                  <li key={bill.id} className="flex justify-between items-center py-1 px-2 hover:bg-red-50 rounded-md transition-colors">
                    <span className="font-medium text-gray-800">{translateBillName(bill.name)}</span>
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">-${bill.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Financial Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('financialSummary')}
          </h3>
          
          <div className="relative pt-3">
            {/* Visual bar chart representation */}
            <div className="flex h-20 mb-5 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {/* Income portion */}
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 flex items-end justify-center relative"
                style={{ width: `${(totalIncome / (totalIncome + totalBills)) * 100}%` }}
              >
                <div className="absolute top-2 left-0 right-0 text-center">
                  <span className="text-xs font-bold text-white drop-shadow-md">
                    Income
                  </span>
                </div>
                <span className="text-xs font-bold text-white mb-2 px-2 py-1 bg-black/20 rounded backdrop-blur-sm">
                  ${totalIncome.toFixed(0)}
                </span>
              </div>
              
              {/* Bills portion */}
              <div 
                className="bg-gradient-to-r from-red-400 to-red-500 flex items-end justify-center relative"
                style={{ width: `${(totalBills / (totalIncome + totalBills)) * 100}%` }}
              >
                <div className="absolute top-2 left-0 right-0 text-center">
                  <span className="text-xs font-bold text-white drop-shadow-md">
                    Bills
                  </span>
                </div>
                <span className="text-xs font-bold text-white mb-2 px-2 py-1 bg-black/20 rounded backdrop-blur-sm">
                  ${totalBills.toFixed(0)}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded-full mr-2"></div>
                  {t('monthlyIncome')}:
                </span>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md">
                  ${totalIncome.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-2"></div>
                  {t('monthlyBills')}:
                </span>
                <span className="text-sm font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                  ${totalBills.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border-2 border-primary/20 shadow-sm">
                <span className="text-sm font-bold text-gray-800">{t('availableToSpend')}:</span>
                <span className="text-sm font-bold text-primary bg-white px-2.5 py-1 rounded-md shadow-sm">
                  ${availableToSpend.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bills List */}
        <div className="mt-6 bg-white p-5 rounded-xl border border-gray-200 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {t('yourBills')}
            </h3>
            <Button
              onClick={onAddBill}
              className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 h-9 px-3 rounded-md shadow-sm transition-all duration-200 flex items-center"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">{t('addBill')}</span>
            </Button>
          </div>
          
          {bills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bills.map((bill) => (
                <div 
                  key={bill.id} 
                  className="p-4 flex justify-between items-center bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Visual indicator bar on the left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-red-600"></div>
                  
                  <div className="ml-2">
                    <div className="flex items-center">
                      <p className="text-sm font-semibold text-gray-800">{translateBillName(bill.name)}</p>
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-50 text-red-500 rounded font-medium">Bill</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {t('dueOnThe')} <span className="font-medium">{bill.due_date}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-red-50 to-red-100 text-red-600 shadow-sm">
                      <p className="text-sm font-bold">
                        ${Number(bill.amount).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        onClick={() => {
                          setSelectedBill(bill);
                          setIsEditBillModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        onClick={() => onDeleteBill(bill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('noBillsAddedYet')}</p>
              <Button
                onClick={onAddBill}
                className="mt-3 bg-red-100 text-red-600 hover:bg-red-200 text-xs px-4 py-2 rounded-md transition-colors"
                variant="ghost"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                {t('addBill')}
              </Button>
            </div>
          )}
        </div>

        {/* Income List */}
        <div className="mt-6 bg-white p-5 rounded-xl border border-gray-200 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              {t('yourIncome')}
            </h3>
            <Button
              onClick={onAddIncome}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-9 px-3 rounded-md shadow-sm transition-all duration-200 flex items-center"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">{t('addIncome')}</span>
            </Button>
          </div>
          
          {income.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {income.map((inc) => (
                <div 
                  key={inc.id} 
                  className="p-4 flex justify-between items-center bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Visual indicator bar on the left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600"></div>
                  
                  <div className="ml-2">
                    <div className="flex items-center">
                      <p className="text-sm font-semibold text-gray-800">{inc.source || t('job')}</p>
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-50 text-green-600 rounded font-medium">Income</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {t(inc.frequency.toLowerCase())}
                      {inc.frequency === "Weekly" && ` (${(Number(inc.amount) * 4).toFixed(2)}/${t('mo')})`}
                      {inc.frequency === "Bi-weekly" && ` (${(Number(inc.amount) * 2).toFixed(2)}/${t('mo')})`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-green-50 to-green-100 text-green-600 shadow-sm">
                      <p className="text-sm font-bold">
                        ${Number(inc.amount).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        onClick={() => {
                          setSelectedIncome(inc);
                          setIsEditIncomeModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        onClick={() => onDeleteIncome(inc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('noIncomeAddedYet')}</p>
              <Button
                onClick={onAddIncome}
                className="mt-3 bg-green-100 text-green-600 hover:bg-green-200 text-xs px-4 py-2 rounded-md transition-colors"
                variant="ghost"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                {t('addIncome')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
