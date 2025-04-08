import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign } from "lucide-react";
import { secureApiRequest } from "@/lib/csrf";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Schema for balance form
const balanceFormSchema = z.object({
  balance: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: "Balance must be a non-negative number" }
  )
});

type FormValues = z.infer<typeof balanceFormSchema>;

interface VerifyBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance?: string | null;
}

export default function VerifyBalanceModal({ 
  open, 
  onOpenChange,
  currentBalance
}: VerifyBalanceModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyMode, setVerifyMode] = useState(!!currentBalance);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(balanceFormSchema),
    defaultValues: {
      balance: currentBalance || ""
    }
  });

  // Reset form when modal opens with new data
  useEffect(() => {
    if (open && currentBalance) {
      form.reset({
        balance: currentBalance
      });
      setVerifyMode(true);
    } else if (open && !currentBalance) {
      form.reset({
        balance: ""
      });
      setVerifyMode(false);
    }
  }, [open, currentBalance, form]);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      // Use secureApiRequest for CSRF protection
      await secureApiRequest("POST", "/api/account-balance", {
        balance: data.balance
      });
      
      // Invalidate account balance query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["/api/account-balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calculated-balance"] });
      
      toast({
        title: "Account balance updated",
        description: "Your account balance has been successfully updated.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating balance:", error);
      toast({
        variant: "destructive",
        title: "Failed to update balance",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify() {
    if (currentBalance) {
      setIsSubmitting(true);
      try {
        // Use secureApiRequest for CSRF protection
        await secureApiRequest("POST", "/api/account-balance", {
          balance: currentBalance
        });
        
        // Invalidate account balance query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ["/api/account-balance"] });
        queryClient.invalidateQueries({ queryKey: ["/api/calculated-balance"] });
        
        toast({
          title: "Account balance verified",
          description: "Your account balance has been verified.",
        });
        
        onOpenChange(false);
      } catch (error) {
        console.error("Error verifying balance:", error);
        toast({
          variant: "destructive",
          title: "Failed to verify balance",
          description: "Please try again later.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function handleReject() {
    setVerifyMode(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-700 flex items-center">
            <span className="w-6 h-6 bg-primary rounded-full mr-2 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </span>
            {verifyMode 
              ? "Verify Your Account Balance" 
              : "Set Your Account Balance"}
          </DialogTitle>
        </DialogHeader>
        
        {verifyMode ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10 shadow-sm">
              <p className="text-sm text-gray-600">
                Is <span className="font-bold text-primary">${Number(currentBalance).toFixed(2)}</span> your current account balance?
              </p>
            </div>
            <div className="flex space-x-3 justify-end">
              <Button 
                variant="outline" 
                onClick={handleReject}
                className="border-gray-200 bg-gradient-to-r from-gray-50 to-white text-gray-700 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-all"
              >
                Reject
              </Button>
              <Button 
                onClick={handleVerify} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-md hover:shadow-lg rounded-lg transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Verify
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Balance</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          {...field}
                          placeholder="0.00"
                          className="pl-7 shadow-sm border border-gray-200 focus:border-primary/30 focus:ring-2 focus:ring-primary/20 rounded-lg transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-md hover:shadow-lg rounded-lg transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Balance
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}