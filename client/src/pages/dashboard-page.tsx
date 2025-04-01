import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Bill, Income } from "@shared/schema";
import CalendarView from "@/components/ui/calendar-view";
import Chatbot from "@/components/ui/chatbot";
import IncomeBills from "@/components/ui/income-bills";
import AddBillModal from "@/components/ui/add-bill-modal";
import RemoveBillModal from "@/components/ui/remove-bill-modal";
import AddIncomeModal from "@/components/ui/add-income-modal";
import RemoveIncomeModal from "@/components/ui/remove-income-modal";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [removeBillOpen, setRemoveBillOpen] = useState(false);
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [removeIncomeOpen, setRemoveIncomeOpen] = useState(false);

  // Fetch bills
  const { 
    data: bills, 
    isLoading: isLoadingBills,
    refetch: refetchBills
  } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

  // Fetch income
  const { 
    data: income, 
    isLoading: isLoadingIncome,
    refetch: refetchIncome
  } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  // Refetch data when modals close
  useEffect(() => {
    if (!addBillOpen || !removeBillOpen) {
      refetchBills();
    }
    if (!addIncomeOpen || !removeIncomeOpen) {
      refetchIncome();
    }
  }, [addBillOpen, removeBillOpen, addIncomeOpen, removeIncomeOpen, refetchBills, refetchIncome]);

  if (isLoadingBills || isLoadingIncome) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-primary font-bold text-2xl mr-8 cursor-pointer">pulse</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500">Welcome, {user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Logout"
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Income & Bills */}
          <div className="lg:col-span-1">
            <IncomeBills 
              bills={bills || []} 
              income={income || []} 
              onAddBill={() => setAddBillOpen(true)}
              onRemoveBill={() => setRemoveBillOpen(true)}
              onAddIncome={() => setAddIncomeOpen(true)}
              onRemoveIncome={() => setRemoveIncomeOpen(true)}
            />
          </div>

          {/* Right columns - Calendar & Chatbot */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar */}
            <CalendarView bills={bills || []} />
            
            {/* Chatbot */}
            <Chatbot bills={bills || []} income={income || []} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddBillModal open={addBillOpen} onOpenChange={setAddBillOpen} />
      <RemoveBillModal open={removeBillOpen} onOpenChange={setRemoveBillOpen} bills={bills || []} />
      <AddIncomeModal open={addIncomeOpen} onOpenChange={setAddIncomeOpen} />
      <RemoveIncomeModal open={removeIncomeOpen} onOpenChange={setRemoveIncomeOpen} income={income || []} />
    </div>
  );
}
