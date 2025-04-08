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
import { PulseLogo } from "@/components/ui/pulse-logo";


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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-[#f8f7ff] to-[#f5f3ff]">
      {/* Header - Refined modern design */}
      <header className="backdrop-blur-md bg-white/80 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <div className="mr-8 cursor-pointer">
                <PulseLogo size="lg" animated={true} />
              </div>
            </Link>
            <h1 className="text-lg font-medium text-gray-700">{t('dashboard')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <div className="bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {t('welcome')} {user?.name?.split(' ')[0]}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 rounded-full px-4"
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
        {/* Top balance summary - Sleek, premium design */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="bg-gradient-to-br from-primary to-violet-700 p-5 rounded-xl shadow-sm flex-shrink-0">
                <div className="text-3xl font-bold text-white">
                  ${accountBalance?.accountBalance || '0.00'}
                </div>
                <div className="text-sm text-white mt-1 opacity-90">{t('accountBalance')}</div>
              </div>
              <Button 
                onClick={() => setBalanceModalOpen(true)}
                className="bg-white hover:bg-gray-50 text-primary border border-gray-200 hover:border-primary/20 shadow-sm font-medium transition-all duration-200"
                variant="outline"
              >
                <span className="mr-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20V10" />
                    <path d="M18 14H6" />
                  </svg>
                </span>
                {t('updateBalance')}
              </Button>
            </div>
            <div className="flex gap-4 md:gap-6 w-full md:w-auto justify-center">
              <div className="text-center px-6 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 flex-1 md:flex-initial">
                <div className="text-2xl font-bold text-emerald-600">{income?.length || 0}</div>
                <div className="text-xs font-medium text-emerald-700 mt-1 opacity-80">{t('yourIncome')}</div>
              </div>
              <div className="text-center px-6 py-3 rounded-xl border border-red-100 bg-red-50/50 flex-1 md:flex-initial">
                <div className="text-2xl font-bold text-red-600">{bills?.length || 0}</div>
                <div className="text-xs font-medium text-red-700 mt-1 opacity-80">{t('yourBills')}</div>
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