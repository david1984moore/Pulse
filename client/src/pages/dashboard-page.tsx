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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-[#f5f3ff] to-[#ede9fe] relative">
      {/* Decorative background elements for visual appeal */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-primary/3 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-t from-emerald-500/3 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-primary/3 to-primary/1 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-l from-red-500/3 to-transparent rounded-full blur-3xl"></div>
      {/* Header - Enhanced sleek modern visual design */}
      <header className="backdrop-blur-xl bg-white/80 sticky top-0 z-10 border-b border-primary/10 shadow-md py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative">
          {/* Subtle decorative elements */}
          <div className="absolute left-0 top-0 h-full w-1/4 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="absolute right-0 bottom-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          
          <div className="flex items-center relative z-10">
            <Link href="/">
              <span className="font-bold text-3xl mr-8 cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
                pulse
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full ml-1 animate-pulse"></span>
              </span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-700 flex items-center">
              <span className="bg-primary/10 w-1 h-6 rounded-full mr-3"></span>
              {t('dashboard')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-5 relative z-10">
            <LanguageToggle />
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-md px-5 py-2 rounded-lg shadow-sm border border-primary/5 transition-all duration-200 hover:shadow-md">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                {t('welcome')} {user?.name?.split(' ')[0]}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-primary/5 border-primary/20 text-primary hover:text-primary/80 shadow-sm hover:shadow px-4 transition-all duration-200"
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

      {/* Main Dashboard Content - Enhanced with visual sleek modern design */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 flex-grow">
        {/* Top balance summary - Visual modern widget with subtle decorative elements */}
        <div className="mb-10 bg-white rounded-xl shadow-lg p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
          {/* Decorative visual elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mt-10 -mr-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -mb-6 -ml-6 blur-xl"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 relative z-10">
            <div className="flex items-center gap-5">
              <div className="bg-gradient-to-br from-primary/90 to-primary p-5 rounded-xl shadow-lg transform transition-transform hover:scale-105">
                <div className="text-3xl font-bold text-white">
                  ${accountBalance?.accountBalance || '0.00'}
                </div>
                <div className="text-sm text-white/90 mt-1 font-medium">{t('accountBalance')}</div>
              </div>
              <Button 
                onClick={() => setBalanceModalOpen(true)}
                className="ml-3 bg-primary hover:bg-primary/90 text-white shadow-md px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                {t('updateBalance')}
              </Button>
            </div>
            <div className="flex gap-6">
              <div className="text-center bg-white px-5 py-4 rounded-xl shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg hover:border-primary/10">
                <div className="text-2xl font-bold text-emerald-500 mb-1">{income?.length || 0}</div>
                <div className="text-xs font-medium text-gray-600">{t('yourIncome')}</div>
              </div>
              <div className="text-center bg-white px-5 py-4 rounded-xl shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg hover:border-primary/10">
                <div className="text-2xl font-bold text-red-500 mb-1">{bills?.length || 0}</div>
                <div className="text-xs font-medium text-gray-600">{t('yourBills')}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Income & Bills with visual enhancements */}
          <div className="lg:col-span-1">
            <div className="transform transition-all duration-300 hover:translate-y-[-5px]">
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
          </div>

          {/* Right columns - Calendar & Chatbot with visual enhancements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Calendar with visual enhancement */}
            <div className="transform transition-all duration-300 hover:translate-y-[-5px]">
              <CalendarView 
                bills={bills || []} 
                onAddBill={() => setAddBillOpen(true)} 
              />
            </div>

            {/* Alice chatbot with visual enhancement */}
            <div className="transform transition-all duration-300 hover:translate-y-[-5px]">
              <Chatbot bills={bills || []} />
            </div>
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