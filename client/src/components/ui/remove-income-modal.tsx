import { useState } from "react";
import { Income } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface RemoveIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: Income[];
}

export default function RemoveIncomeModal({ open, onOpenChange, income }: RemoveIncomeModalProps) {
  const { toast } = useToast();
  const [deletingIncomeId, setDeletingIncomeId] = useState<number | null>(null);

  async function handleDeleteIncome(incomeId: number) {
    setDeletingIncomeId(incomeId);
    try {
      await apiRequest("DELETE", `/api/income/${incomeId}`);
      
      // Invalidate income query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      
      toast({
        title: "Income removed",
        description: "The income has been removed successfully",
      });
      
      // If no income left, close modal
      if (income.length === 1) {
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Failed to remove income",
        description: "There was an error removing the income. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingIncomeId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Income</DialogTitle>
        </DialogHeader>
        
        <div className="bg-white overflow-hidden sm:rounded-md">
          {income.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {income.map((inc) => (
                <li key={inc.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary truncate">{inc.source || 'Job'}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {inc.frequency} - ${Number(inc.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        onClick={() => handleDeleteIncome(inc.id)}
                        disabled={deletingIncomeId === inc.id}
                      >
                        {deletingIncomeId === inc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-5 text-sm text-gray-500">No income to remove.</p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
