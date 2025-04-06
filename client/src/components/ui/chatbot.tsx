import { useState, useEffect } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Send, Loader2, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/use-language";

interface ChatbotProps {
  bills: Bill[];
}

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface SpendingResponse {
  canSpend: boolean;
  message: string;
}

interface BalanceData {
  calculatedBalance: string | null;
  deductedBills: any[];
}

export default function Chatbot({ bills }: ChatbotProps) {
  const { t, language } = useLanguage();
  // Fetch current account balance
  const { data: balanceData } = useQuery<BalanceData>({
    queryKey: ["/api/calculated-balance"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: t('chatbotInitialMessage'),
      sender: "bot",
    },
  ]);
  const [isPending, setIsPending] = useState(false);
  
  // Update initial message when language changes
  useEffect(() => {
    setMessages([{
      text: t('chatbotInitialMessage'),
      sender: "bot",
    }]);
  }, [language, t]);

  const handleSubmit = async () => {
    if (!selectedAmount) return;
    
    // Add user message
    const userMessage = `${t('canISpend')} $${selectedAmount}?`;
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    
    // Send request to API
    setIsPending(true);
    try {
      const response = await apiRequest("POST", "/api/spending-advisor", { amount: selectedAmount });
      const data: SpendingResponse = await response.json();
      
      // Add bot response
      setMessages((prev) => [...prev, { text: data.message, sender: "bot" }]);
    } catch (error) {
      console.error("Failed to get spending advice:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: t('chatbotErrorMessage'),
          sender: "bot",
        },
      ]);
    } finally {
      setIsPending(false);
      setSelectedAmount(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 border-b border-gray-100">
        <CardTitle>
          {t('chatbot')}
        </CardTitle>
        <CardDescription className="flex items-center mt-1.5 bg-gray-100 px-3 py-1.5 rounded-md w-fit">
          <DollarSign className="h-4 w-4 mr-1.5 text-primary" />
          <span className="font-medium text-gray-700">{t('balance')}: ${balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="bg-gray-50 rounded-lg p-4 mb-5 h-64 border border-gray-200">
          {messages.map((message, index) => (
            <div key={index} className="mb-3">
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    message.sender === "user"
                      ? "bg-primary/10 text-gray-800 rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Select value={selectedAmount || ""} onValueChange={setSelectedAmount}>
            <SelectTrigger className="flex-1 border-gray-200">
              <SelectValue placeholder={t('chatbotPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">{t('canISpend')} $10?</SelectItem>
              <SelectItem value="50">{t('canISpend')} $50?</SelectItem>
              <SelectItem value="100">{t('canISpend')} $100?</SelectItem>
              <SelectItem value="200">{t('canISpend')} $200?</SelectItem>
              <SelectItem value="500">{t('canISpend')} $500?</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAmount || isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('thinking')}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t('ask')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
