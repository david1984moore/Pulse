import { Bill, Income } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface IncomeBillsProps {
  bills: Bill[];
  income: Income[];
  onAddBill: () => void;
  onRemoveBill: () => void;
  onAddIncome: () => void;
  onRemoveIncome: () => void;
}

export default function IncomeBills({
  bills,
  income,
  onAddBill,
  onRemoveBill,
  onAddIncome,
  onRemoveIncome,
}: IncomeBillsProps) {
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Income & Bills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <Button
            onClick={onAddBill}
            className="flex-1 bg-primary hover:bg-primary-600"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Bill
          </Button>
          <Button
            onClick={onRemoveBill}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={bills.length === 0}
          >
            <Minus className="mr-2 h-4 w-4" /> Remove Bill
          </Button>
        </div>

        {/* Income Management Buttons */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <Button
            onClick={onAddIncome}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Income
          </Button>
          <Button
            onClick={onRemoveIncome}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
            disabled={income.length === 0}
          >
            <Minus className="mr-2 h-4 w-4" /> Remove Income
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
                <li key={bill.id} className="py-3 flex justify-between">
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
                  <p className={`text-sm font-medium ${bill.name === "Rent" ? "text-red-500" : "text-amber-500"}`}>
                    ${Number(bill.amount).toFixed(2)}
                  </p>
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
                <li key={inc.id} className="py-3 flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Income</p>
                    <p className="text-xs text-gray-500">{inc.frequency}</p>
                  </div>
                  <p className="text-sm font-medium text-green-600">${Number(inc.amount).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 py-2">No income added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
