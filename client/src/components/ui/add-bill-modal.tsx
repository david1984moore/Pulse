import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { billFormSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
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
}

type FormValues = z.infer<typeof billFormSchema>;

export default function AddBillModal({ open, onOpenChange }: AddBillModalProps) {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: "",
      amount: "",
      due_date: 1,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      console.log("Submitting bill with data:", data);
      const response = await apiRequest("POST", "/api/bills", {
        name: data.name,
        amount: data.amount,
        due_date: data.due_date,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add bill");
      }
      
      // Invalidate bills query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      
      toast({
        title: language === 'en' ? "Bill added" : "Factura añadida",
        description: language === 'en' ? "Your bill has been added successfully" : "Tu factura ha sido añadida exitosamente",
      });
      
      // Reset form and close modal
      form.reset();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addBillTitle')}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('billNamePlaceholder')} {...field} />
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
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        $
                      </span>
                      <Input className="pl-7" placeholder={t('amountPlaceholder').replace('e.g. $1000', '0.00')} {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dueDateLabel')}</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-red-500 hover:bg-red-600">
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
