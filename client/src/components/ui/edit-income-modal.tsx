import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Income, incomeFormSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

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
  const { t } = useLanguage();
  
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
        title: t('incomeUpdatedSuccess'),
        description: t('incomeUpdatedDescription'),
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
        title: t('incomeUpdateFailed'),
        description: error instanceof Error ? error.message : t('incomeUpdateError'),
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
          <DialogTitle>{t('editIncomeTitle')}</DialogTitle>
          <DialogDescription>
            {t('updateIncomeDetails')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sourceLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('sourcePlaceholder')} {...field} />
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
                  <FormLabel>{t('amountLabel')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder={t('amountPlaceholder')} 
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
                  <FormLabel>{t('frequencyLabel')}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectFrequency')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Weekly">{t('weekly')}</SelectItem>
                      <SelectItem value="Bi-weekly">{t('frequencyOptions.biweekly')}</SelectItem>
                      <SelectItem value="Monthly">{t('frequencyOptions.monthly')}</SelectItem>
                      <SelectItem value="Custom">{t('custom')}</SelectItem>
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
                {editIncomeMutation.isPending ? t('updating') : t('updateIncome')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}