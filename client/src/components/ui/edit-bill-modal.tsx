import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bill, billFormSchema } from "@shared/schema";
import { secureApiRequest } from "@/lib/csrf";
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
import { z } from "zod";

interface EditBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
}

type FormValues = z.infer<typeof billFormSchema>;

export default function EditBillModal({ open, onOpenChange, bill }: EditBillModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: bill ? {
      name: bill.name,
      amount: bill.amount,
      due_date: bill.due_date
    } : {
      name: "",
      amount: "",
      due_date: 1
    }
  });
  
  // Reset form when bill changes
  React.useEffect(() => {
    if (bill) {
      form.reset({
        name: bill.name,
        amount: bill.amount,
        due_date: bill.due_date
      });
    }
  }, [bill, form]);
  
  const editBillMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!bill) return;
      
      const response = await secureApiRequest(
        "PUT",
        `/api/bills/${bill.id}`,
        {
          name: data.name,
          amount: data.amount,
          due_date: data.due_date
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update bill");
      }
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('editBillTitle'),
        description: t('billUpdatedSuccess'),
      });
      
      // Invalidate the bills query
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      
      // Close the modal
      onOpenChange(false);
      
      // Reset the form
      form.reset();
    },
    onError: (error) => {
      console.error("Error updating bill:", error);
      toast({
        title: t('billUpdateFailed'),
        description: error instanceof Error ? error.message : t('billUpdateError'),
        variant: "destructive",
      });
    },
  });
  
  async function onSubmit(data: FormValues) {
    editBillMutation.mutate(data);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-700">{t('editBillTitle')}</DialogTitle>
          <DialogDescription className="text-gray-500">
            {t('updateBillDetails')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-600">{t('billNameLabel')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('billNamePlaceholder')} 
                      className="border-gray-200 focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-600">{t('amountLabel')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder={t('amountPlaceholder')} 
                      step="0.01"
                      className="border-gray-200 focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-600">{t('dueDateLabel')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      max={31}
                      className="border-gray-200 focus-visible:ring-primary/50" 
                      {...field}
                      onChange={(e) => {
                        // Ensure the due date is between 1 and 31
                        const value = parseInt(e.target.value);
                        if (value < 1) {
                          field.onChange(1);
                        } else if (value > 31) {
                          field.onChange(31);
                        } else {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                disabled={editBillMutation.isPending}
                className="bg-red-400 hover:bg-red-500 text-white shadow-sm"
              >
                {editBillMutation.isPending ? t('updating') : t('updateBill')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}