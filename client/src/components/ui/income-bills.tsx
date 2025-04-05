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
        <CardContent className="space-y-5 pt-6">
        {/* Account Balance - Primary Feature */}
        <div className="bg-primary/10 p-4 rounded-md border border-primary/30">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-primary uppercase tracking-wider">
              Account Balance
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onUpdateBalance}
              className="h-7 text-xs text-primary hover:text-primary-700"
            >
              Update
            </Button>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-primary">
              ${balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}
            </p>
          </div>
          {balanceData?.deductedBills && balanceData.deductedBills.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              <p>Recent deductions:</p>
              <ul className="mt-1">
                {balanceData.deductedBills.map((bill) => (
                  <li key={bill.id} className="flex justify-between">
                    <span>{bill.name}</span>
                    <span className="text-red-500">-${bill.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Financial Summary */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Summary
          </h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Monthly Income:</span>
            <span className="text-sm font-medium text-green-600">${totalIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Monthly Bills:</span>
            <span className="text-sm font-medium text-red-500">${totalBills.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Available to spend:</span>
            <span className="text-sm font-medium text-primary">${availableToSpend.toFixed(2)}</span>
          </div>
        </div>

        {/* Bill Management Buttons */}
        <div className="flex">
          <Button
            onClick={onAddBill}
            className="w-full bg-primary hover:bg-primary-600"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Bill
          </Button>
        </div>

        {/* Bills List */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Your Bills
          </h3>
          {bills.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <li key={bill.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{bill.name}</p>
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
                    <p className={`text-sm font-medium ${bill.name === "Rent" ? "text-red-500" : "text-amber-500"}`}>
                      ${Number(bill.amount).toFixed(2)}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
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
                      className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                      onClick={() => onDeleteBill(bill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 py-2">No bills added yet.</p>
          )}
        </div>

        {/* Income List */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Your Income
          </h3>
          {income.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {income.map((inc) => (
                <li key={inc.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inc.source || 'Job'}</p>
                    <p className="text-xs text-gray-500">
                      {inc.frequency}
                      {inc.frequency === "Weekly" && ` (${(Number(inc.amount) * 4).toFixed(2)}/mo)`}
                      {inc.frequency === "Bi-weekly" && ` (${(Number(inc.amount) * 2).toFixed(2)}/mo)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-green-600">${Number(inc.amount).toFixed(2)}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
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
                      className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                      onClick={() => onDeleteIncome(inc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 py-2">No income added yet.</p>
          )}
          
          {/* Income Management Buttons */}
          <div className="flex mt-3">
            <Button
              onClick={onAddIncome}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Income
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
