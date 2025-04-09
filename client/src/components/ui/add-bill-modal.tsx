import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { billFormSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { secureApiRequest } from "@/lib/csrf";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useBillFormState } from "@/hooks/use-bill-form-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AddBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDueDate?: number;
}

type FormValues = z.infer<typeof billFormSchema>;

export default function AddBillModal({ open, onOpenChange, defaultDueDate }: AddBillModalProps) {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { selectedDueDate, setSelectedDueDate } = useBillFormState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine the due date to use - prioritize props over context
  const initialDueDate = defaultDueDate || selectedDueDate || 1;

  const form = useForm<FormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: "",
      amount: "",
      due_date: initialDueDate,
    },
  });
  
  // Update form value when selectedDueDate changes
  useEffect(() => {
    if (selectedDueDate) {
      form.setValue("due_date", selectedDueDate);
    }
  }, [selectedDueDate, form]);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      console.log("Submitting bill with data:", data);
      const response = await secureApiRequest("POST", "/api/bills", {
        name: data.name,
        amount: data.amount,
        due_date: data.due_date,
      });
      
      // Invalidate bills query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      
      toast({
        title: language === 'en' ? "Bill added" : "Factura añadida",
        description: language === 'en' ? "Your bill has been added successfully" : "Tu factura ha sido añadida exitosamente",
      });
      
      // Reset form and context, then close modal
      form.reset();
      setSelectedDueDate(null); // Clear the context
      onOpenChange(false);
    } catch (error) {
      console.error("Add bill error:", error);
      toast({
        title: language === 'en' ? "Failed to add bill" : "Error al añadir factura",
        description: error instanceof Error ? error.message : 
          language === 'en' ? 
          "There was an error adding your bill. Please try again." : 
          "Hubo un error al añadir tu factura. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Generate days 1-31 for the due date select
  const dueDate = Array.from({ length: 31 }, (_, i) => i + 1);

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clear the due date context when the modal is closed
      setSelectedDueDate(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-700">{t('addBillTitle')}</DialogTitle>
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
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        $
                      </span>
                      <Input 
                        className="pl-7 border-gray-200 focus-visible:ring-primary/50" 
                        placeholder={t('amountPlaceholder').replace('e.g. $1000', '0.00')} 
                        {...field} 
                      />
                    </div>
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
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-200 focus-visible:ring-primary/50">
                        <SelectValue placeholder={language === 'en' ? "Select a due date" : "Selecciona una fecha de vencimiento"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dueDate.map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                          {language === 'en' ? 
                            (day === 1 || day === 21 || day === 31
                              ? "st"
                              : day === 2 || day === 22
                              ? "nd"
                              : day === 3 || day === 23
                              ? "rd"
                              : "th") 
                            : ""} {language === 'en' ? "of each month" : "de cada mes"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                className="border-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-red-400 hover:bg-red-500 text-white shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'en' ? "Saving..." : "Guardando..."}
                  </>
                ) : (
                  language === 'en' ? "Save Bill" : "Guardar Factura"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
