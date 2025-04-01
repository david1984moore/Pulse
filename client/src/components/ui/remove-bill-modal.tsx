import { useState } from "react";
import { Bill } from "@shared/schema";
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

interface RemoveBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bills: Bill[];
}

export default function RemoveBillModal({ open, onOpenChange, bills }: RemoveBillModalProps) {
  const { toast } = useToast();
  const [deletingBillId, setDeletingBillId] = useState<number | null>(null);

  async function handleDeleteBill(billId: number) {
    setDeletingBillId(billId);
    try {
      await apiRequest("DELETE", `/api/bills/${billId}`);
      
      // Invalidate bills query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      
      toast({
        title: "Bill removed",
        description: "The bill has been removed successfully",
      });
      
      // If no bills left, close modal
      if (bills.length === 1) {
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Failed to remove bill",
        description: "There was an error removing the bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingBillId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Bill</DialogTitle>
        </DialogHeader>
        
        <div className="bg-white overflow-hidden sm:rounded-md">
          {bills.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <li key={bill.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary truncate">{bill.name}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Due on the {bill.due_date}
                          {["1", "21", "31"].includes(bill.due_date.toString())
                            ? "st"
                            : ["2", "22"].includes(bill.due_date.toString())
                            ? "nd"
                            : ["3", "23"].includes(bill.due_date.toString())
                            ? "rd"
                            : "th"} - ${Number(bill.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        onClick={() => handleDeleteBill(bill.id)}
                        disabled={deletingBillId === bill.id}
                      >
                        {deletingBillId === bill.id ? (
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
            <p className="px-4 py-5 text-sm text-gray-500">No bills to remove.</p>
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
