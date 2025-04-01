import { useState } from "react";
import { Bill, Income } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatbotProps {
  bills: Bill[];
  income: Income[];
}

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface SpendingResponse {
  canSpend: boolean;
  message: string;
}

export default function Chatbot({ bills, income }: ChatbotProps) {
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi there! I'm your spending assistant. Ask me if you can afford to spend money on something.",
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
      <CardHeader>
        <CardTitle>Spending Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="bg-gray-50 rounded-lg p-4 mb-4 h-64">
          {messages.map((message, index) => (
            <div key={index} className="mb-3">
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs ${
                    message.sender === "user"
                      ? "bg-primary-100 text-primary"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={selectedAmount || ""} onValueChange={setSelectedAmount}>
            <SelectTrigger className="flex-1">
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
            className="w-full sm:w-auto"
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
