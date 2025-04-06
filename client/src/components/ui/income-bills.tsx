import { Bill, Income } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
        <div className="bg-primary/5 p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Account Balance
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUpdateBalance}
              className="h-7 text-xs hover:bg-gray-100"
            >
              Update
            </Button>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-primary">
              ${balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}
            </p>
          </div>
          {balanceData?.deductedBills && balanceData.deductedBills.length > 0 && (
            <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">
              <p className="font-medium">Recent deductions:</p>
              <ul className="mt-1 space-y-1">
                {balanceData.deductedBills.map((bill) => (
                  <li key={bill.id} className="flex justify-between">
                    <span className="font-medium">{bill.name}</span>
                    <span className="text-red-500 font-semibold">-${bill.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Financial Summary */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Financial Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Monthly Income:
              </span>
              <span className="text-sm font-bold text-green-600">${totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Monthly Bills:
              </span>
              <span className="text-sm font-bold text-red-500">${totalBills.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-2 mt-1 bg-primary/5 rounded border border-gray-200">
              <span className="text-sm font-bold text-gray-700">Available to spend:</span>
              <span className="text-sm font-bold text-primary">${availableToSpend.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bills List */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-700 uppercase tracking-wider">
              Your Bills
            </h3>
            <Button
              onClick={onAddBill}
              className="bg-primary hover:bg-primary-600 h-8 w-8 p-0"
              size="icon"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Bill</span>
            </Button>
          </div>
          {bills.length > 0 ? (
            <ul className="space-y-2">
              {bills.map((bill) => (
                <li key={bill.id} className="p-3 flex justify-between items-center bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{bill.name}</p>
                    <p className="text-xs text-gray-500">
                      Due on the {bill.due_date}
                      {["1", "21", "31"].includes(bill.due_date.toString())
                        ? "st"
                        : ["2", "22"].includes(bill.due_date.toString())
                        ? "nd"
                        : ["3", "23"].includes(bill.due_date.toString())
                        ? "rd"
                        : "th"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2.5 py-1 rounded-md ${bill.name === "Rent" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                      <p className="text-sm font-semibold">
                        ${Number(bill.amount).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors"
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
                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-gray-100 transition-colors"
                      onClick={() => onDeleteBill(bill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center">No bills added yet.</div>
          )}
        </div>

        {/* Income List */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-700 uppercase tracking-wider">
              Your Income
            </h3>
            <Button
              onClick={onAddIncome}
              className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
              size="icon"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Income</span>
            </Button>
          </div>
          {income.length > 0 ? (
            <ul className="space-y-2">
              {income.map((inc) => (
                <li key={inc.id} className="p-3 flex justify-between items-center bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{inc.source || 'Job'}</p>
                    <p className="text-xs text-gray-500">
                      {inc.frequency}
                      {inc.frequency === "Weekly" && ` (${(Number(inc.amount) * 4).toFixed(2)}/mo)`}
                      {inc.frequency === "Bi-weekly" && ` (${(Number(inc.amount) * 2).toFixed(2)}/mo)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-md bg-green-50 text-green-600">
                      <p className="text-sm font-semibold">${Number(inc.amount).toFixed(2)}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors"
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
                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-gray-100 transition-colors"
                      onClick={() => onDeleteIncome(inc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center">No income added yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
