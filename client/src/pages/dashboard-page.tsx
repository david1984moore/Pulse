import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bill, Income } from "@shared/schema";
import { Trash } from "lucide-react"; // Import trash icon
import { useToast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/ui/language-toggle";


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
  const { t } = useLanguage();
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-[#120B29] to-[#1B0B40]">
      {/* Header - Modernized with sleek glass effect */}
      <header className="backdrop-blur-lg bg-background/5 sticky top-0 z-10 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <span className="font-bold text-3xl mr-8 cursor-pointer glow-text bg-gradient-to-r from-purple-500 to-violet-400 bg-clip-text text-transparent">pulse</span>
            </Link>
            <h1 className="text-xl font-semibold text-white/90">{t('dashboard')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <div className="bg-primary/10 backdrop-blur-md px-4 py-2 rounded-lg shadow-glow-sm">
              <span className="text-sm font-medium text-white/90">{t('welcome')} {user?.name?.split(' ')[0]}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-background/5 hover:bg-primary/20 border-primary/20 text-white"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('logout')
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content - Enhanced with card styling and spacing */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
        {/* Top balance summary - Sleek modern widget */}
        <div className="mb-8 bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 backdrop-blur-lg rounded-xl shadow-glow-sm p-6 border border-primary/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-primary/30 to-primary/20 p-4 rounded-lg shadow-glow-sm">
                <div className="text-3xl font-bold text-white glow-text">
                  ${accountBalance?.accountBalance || '0.00'}
                </div>
                <div className="text-sm text-white/70 mt-1">{t('accountBalance')}</div>
              </div>
              <Button 
                onClick={() => setBalanceModalOpen(true)}
                className="ml-2 bg-primary/20 hover:bg-primary/30 text-white border border-primary/30"
              >
                {t('updateBalance')}
              </Button>
            </div>
            <div className="flex gap-4">
              <div className="text-center bg-background/20 px-4 py-3 rounded-lg shadow-glow-sm backdrop-blur-md border border-primary/10">
                <div className="text-xl font-bold text-green-400">{income?.length || 0}</div>
                <div className="text-xs text-white/80 mt-1">{t('yourIncome')}</div>
              </div>
              <div className="text-center bg-background/20 px-4 py-3 rounded-lg shadow-glow-sm backdrop-blur-md border border-primary/10">
                <div className="text-xl font-bold text-red-400">{bills?.length || 0}</div>
                <div className="text-xs text-white/80 mt-1">{t('yourBills')}</div>
              </div>
            </div>
          </div>
        </div>
        
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
            <CalendarView 
              bills={bills || []} 
              onAddBill={() => setAddBillOpen(true)} 
            />

            {/* Alice */}
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