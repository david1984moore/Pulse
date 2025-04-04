import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Income, incomeFormSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

interface EditIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: Income | null;
}

type FormValues = z.infer<typeof incomeFormSchema>;

export default function EditIncomeModal({ open, onOpenChange, income }: EditIncomeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: income ? {
      source: income.source,
      amount: income.amount,
      frequency: income.frequency as "Weekly" | "Bi-weekly" | "Monthly" | "Custom"
    } : {
      source: "",
      amount: "",
      frequency: "Monthly" as "Weekly" | "Bi-weekly" | "Monthly" | "Custom"
    }
  });
  
  // Reset form when income changes
  React.useEffect(() => {
    if (income) {
      form.reset({
        source: income.source,
        amount: income.amount,
        frequency: income.frequency as "Weekly" | "Bi-weekly" | "Monthly" | "Custom"
      });
    }
  }, [income, form]);
  
  const editIncomeMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!income) return;
      
      const response = await apiRequest(
        "PUT",
        `/api/income/${income.id}`,
        {
          source: data.source,
          amount: data.amount,
          frequency: data.frequency
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update income");
      }
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Income updated",
        description: "Your income has been updated successfully.",
      });
      
      // Invalidate the income query
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      
      // Close the modal
      onOpenChange(false);
      
      // Reset the form
      form.reset();
    },
    onError: (error) => {
      console.error("Error updating income:", error);
      toast({
        title: "Failed to update income",
        description: error instanceof Error ? error.message : "There was an error updating your income. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  async function onSubmit(data: FormValues) {
    editIncomeMutation.mutate(data);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Income</DialogTitle>
          <DialogDescription>
            Update the details of your income source.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Source</FormLabel>
                  <FormControl>
                    <Input placeholder="Salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      step="0.01"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={editIncomeMutation.isPending}
              >
                {editIncomeMutation.isPending ? "Updating..." : "Update Income"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}