import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bill, Income } from "@shared/schema";
import { Trash } from "lucide-react"; // Import trash icon
import { useToast } from "@/hooks/use-toast";


interface AccountBalanceData {
  accountBalance: string | null;
  lastUpdate: string | null;
}
import CalendarView from "@/components/ui/calendar-view";
import Chatbot from "@/components/ui/chatbot";
import IncomeBills from "@/components/ui/income-bills";
import AddBillModal from "@/components/ui/add-bill-modal";
//import RemoveBillModal from "@/components/ui/remove-bill-modal"; // Removed
import AddIncomeModal from "@/components/ui/add-income-modal";
import VerifyBalanceModal from "@/components/ui/verify-balance-modal";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addBillOpen, setAddBillOpen] = useState<boolean>(false);
  //const [removeBillOpen, setRemoveBillOpen] = useState<boolean>(false); // Removed
  const [addIncomeOpen, setAddIncomeOpen] = useState<boolean>(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState<boolean>(false);
  
  // Add logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to logout");
      }
      return true;
    },
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  // Fetch account balance
  const { data: accountBalance } = useQuery<AccountBalanceData>({
    queryKey: ["/api/account-balance"],
  });

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
    if (!addBillOpen) {
      refetchBills();
    }
    if (!addIncomeOpen) {
      refetchIncome();
    }
  }, [addBillOpen, addIncomeOpen, refetchBills, refetchIncome]);

  // Show balance modal when account balance is loaded
  useEffect(() => {
    // Only show the balance modal on initial load if user doesn't have a balance set
    if (accountBalance && accountBalance.accountBalance === null) {
      setBalanceModalOpen(true);
    }
  }, [accountBalance]);

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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-primary font-bold text-3xl mr-8 cursor-pointer">pulse</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium text-gray-700">Welcome, {user?.name?.split(' ')[0]}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-gray-100"
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
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Income & Bills */}
          <div className="lg:col-span-1">
            <IncomeBills 
              bills={bills || []} 
              income={income || []} 
              onAddBill={() => setAddBillOpen(true)}
              onDeleteBill={(billId) => {
                fetch(`/api/bills/${billId}`, {
                  method: 'DELETE',
                }).then(response => {
                  if (response.ok) {
                    refetchBills();
                    toast({ title: 'Bill deleted successfully!'});
                  } else {
                    toast({ title: 'Failed to delete bill', variant: 'destructive' });
                  }
                }).catch(error => {
                  console.error("Error deleting bill:", error);
                  toast({ title: 'Failed to delete bill', variant: 'destructive' });
                });
              }}
              onAddIncome={() => setAddIncomeOpen(true)}
              onDeleteIncome={(incomeId) => {
                fetch(`/api/income/${incomeId}`, {
                  method: 'DELETE',
                }).then(response => {
                  if (response.ok) {
                    refetchIncome();
                    toast({ title: 'Income deleted successfully!'});
                  } else {
                    toast({ title: 'Failed to delete income', variant: 'destructive' });
                  }
                }).catch(error => {
                  console.error("Error deleting income:", error);
                  toast({ title: 'Failed to delete income', variant: 'destructive' });
                });
              }}
              onUpdateBalance={() => setBalanceModalOpen(true)}
            />
          </div>

          {/* Right columns - Calendar & Chatbot */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar */}
            <CalendarView bills={bills || []} />

            {/* Chatbot */}
            <Chatbot bills={bills || []} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddBillModal open={addBillOpen} onOpenChange={setAddBillOpen} />
      <AddIncomeModal open={addIncomeOpen} onOpenChange={setAddIncomeOpen} />
      <VerifyBalanceModal 
        open={balanceModalOpen} 
        onOpenChange={setBalanceModalOpen} 
        currentBalance={accountBalance?.accountBalance} 
      />
    </div>
  );
}