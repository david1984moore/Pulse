import { useState } from "react";
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
  // Fetch current account balance
  const { data: balanceData } = useQuery<BalanceData>({
    queryKey: ["/api/calculated-balance"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi there! I'm your spending assistant. I can help you decide whether you can afford to spend money based on your current account balance and upcoming bills.",
      sender: "bot",
    },
  ]);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAmount) return;
    
    // Add user message
    const userMessage = `Can I spend $${selectedAmount}?`;
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
          text: "Sorry, I couldn't process your request. Please try again later.",
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
      <CardHeader className="pb-2 border-b border-blue-50">
        <CardTitle className="flex items-center">
          <span className="inline-block w-6 h-6 mr-2 bg-primary/10 rounded-full flex items-center justify-center">
            <DollarSign className="h-3 w-3 text-primary" />
          </span>
          Spending Assistant
        </CardTitle>
        <CardDescription className="flex items-center mt-1.5 bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-1.5 rounded-full w-fit">
          <DollarSign className="h-4 w-4 mr-1.5 text-primary" />
          <span className="font-medium">Balance: ${balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 mb-5 h-64 border border-blue-100 shadow-inner">
          {messages.map((message, index) => (
            <div key={index} className="mb-3">
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`p-3 rounded-xl max-w-xs shadow-sm ${
                    message.sender === "user"
                      ? "bg-primary/20 text-primary-700 rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-blue-100"
                  }`}
                >
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Select value={selectedAmount || ""} onValueChange={setSelectedAmount}>
            <SelectTrigger className="flex-1 border-blue-100 focus:ring-primary/20">
              <SelectValue placeholder="Can I spend..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Can I spend $10?</SelectItem>
              <SelectItem value="50">Can I spend $50?</SelectItem>
              <SelectItem value="100">Can I spend $100?</SelectItem>
              <SelectItem value="200">Can I spend $200?</SelectItem>
              <SelectItem value="500">Can I spend $500?</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAmount || isPending}
            className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Ask
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
