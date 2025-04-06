import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { incomeFormSchema } from "@shared/schema";
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

interface AddIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = z.infer<typeof incomeFormSchema>;

export default function AddIncomeModal({ open, onOpenChange }: AddIncomeModalProps) {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      source: "",
      amount: "",
      frequency: "Weekly",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      console.log("Submitting income with data:", data);
      const response = await apiRequest("POST", "/api/income", {
        source: data.source,
        amount: data.amount,
        frequency: data.frequency,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add income");
      }
      
      // Invalidate income query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      
      toast({
        title: language === 'en' ? "Income added" : "Ingreso añadido",
        description: language === 'en' ? "Your income has been added successfully" : "Tu ingreso ha sido añadido exitosamente",
      });
      
      // Reset form and close modal
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Add income error:", error);
      toast({
        title: language === 'en' ? "Failed to add income" : "Error al añadir ingreso",
        description: error instanceof Error ? error.message : 
          language === 'en' ? 
          "There was an error adding your income. Please try again." : 
          "Hubo un error al añadir tu ingreso. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addIncomeTitle')}</DialogTitle>
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
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('frequencyLabel')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? "Select a frequency" : "Selecciona una frecuencia"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Weekly">{t('weekly')}</SelectItem>
                      <SelectItem value="Bi-weekly">{t('bi-weekly')}</SelectItem>
                      <SelectItem value="Monthly">{t('monthly')}</SelectItem>
                      <SelectItem value="Custom">{language === 'en' ? "Custom" : "Personalizado"}</SelectItem>
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
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'en' ? "Saving..." : "Guardando..."}
                  </>
                ) : (
                  language === 'en' ? "Save Income" : "Guardar Ingreso"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
