import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

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
      await apiRequest("/api/account-balance", "POST", {
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
        await apiRequest("/api/account-balance", "POST", {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {verifyMode 
              ? "Verify Your Account Balance" 
              : "Set Your Account Balance"}
          </DialogTitle>
        </DialogHeader>
        
        {verifyMode ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Is ${Number(currentBalance).toFixed(2)} your current account balance?
            </p>
            <div className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={handleReject}>
                Reject
              </Button>
              <Button onClick={handleVerify} disabled={isSubmitting}>
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
                          className="pl-7"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
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