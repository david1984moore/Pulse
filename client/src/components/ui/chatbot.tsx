import { useState, useEffect, useRef } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EkgAnimation } from "@/components/ui/ekg-animation-new";
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
import { secureApiRequest } from "@/lib/csrf";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/use-language";
import { TypeAnimation } from "@/components/ui/type-animation";

interface ChatbotProps {
  bills: Bill[];
}

interface Message {
  text: string;
  sender: "user" | "bot";
  isAnimating?: boolean;
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
  const { data: balanceData } = useQuery<BalanceData>({
    queryKey: ["/api/calculated-balance"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // UI State
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [isPending, setIsPending] = useState(false);
  
  // No EKG animation
  
  // Prevent multiple rapid/duplicate clicks
  const isSubmittingRef = useRef(false);
  
  // Chat messages
  const [messages, setMessages] = useState<Message[]>([
    {
      text: language === 'es' 
        ? "¡Hola! Soy Alicia. Pregúntame qué puedes gastar."
        : "Hello! I'm Alice. Ask me what you can spend.",
      sender: "bot",
      isAnimating: true,
    },
  ]);
  
  // Scroll area for messages
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Handle text animation completion
  const handleAnimationComplete = (index: number) => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages];
      if (updatedMessages[index]) {
        updatedMessages[index] = { ...updatedMessages[index], isAnimating: false };
      }
      return updatedMessages;
    });
  };
  
  // Reset initial message when language changes
  useEffect(() => {
    setMessages([{
      text: t('chatbotInitialMessage'),
      sender: "bot",
      isAnimating: true,
    }]);
  }, [language, t]);
  
  // Toggle custom amount mode
  useEffect(() => {
    if (selectedAmount === "custom") {
      setIsCustomAmount(true);
      setSelectedAmount(null);
    }
  }, [selectedAmount]);
  
  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async () => {
    const amountToUse = isCustomAmount ? customAmount : (selectedAmount || "");
    if (!amountToUse) return;
    
    // Add user message
    const userMessage = `${t('canISpend')} $${amountToUse}?`;
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    
    // Send request to API
    setIsPending(true);
    try {
      // Use secureApiRequest instead of apiRequest to include CSRF token
      const response = await secureApiRequest("POST", "/api/spending-advisor", { amount: amountToUse });
      const data: SpendingResponse = await response.json();
      
      // Translate the response if in Spanish mode
      let botMessage = data.message;
      
      if (language === 'es') {
        // Translate the response based on its patterns
        const originalMessage = data.message;
        
        if (originalMessage.startsWith("Yes, you can spend") && originalMessage.includes("next bill")) {
          // Pattern: Yes, you can spend $X. Your balance will be $Y. Next bill Name ($Z) due in N days, leaving $W.
          const amount = amountToUse;
          
          // Extract newBalance
          const newBalanceMatch = originalMessage.match(/balance after this purchase will be \$([0-9.]+)/);
          const newBalance = newBalanceMatch ? newBalanceMatch[1] : "0.00";
          
          // Extract bill name
          const billNameMatch = originalMessage.match(/next bill ([A-Za-z\s]+) \(\$/);
          const billName = billNameMatch ? billNameMatch[1] : "?";
          
          // Extract bill amount
          const billAmountMatch = originalMessage.match(/\(\\?\$([0-9.]+)\) is due/);
          const billAmount = billAmountMatch ? billAmountMatch[1] : "0.00";
          
          // Extract days until bill
          const daysMatch = originalMessage.match(/due in ([0-9]+) days/);
          const days = daysMatch ? daysMatch[1] : "0";
          
          // Extract remaining balance
          const remainingBalanceMatch = originalMessage.match(/leave you with \$([0-9.]+)/);
          const remainingBalance = remainingBalanceMatch ? remainingBalanceMatch[1] : "0.00";
          
          // Use the translated template with values
          botMessage = t('yesSafeToSpend')
            .replace('%amount%', amount)
            .replace('%newBalance%', newBalance)
            .replace('%billName%', billName)
            .replace('%billAmount%', billAmount)
            .replace('%days%', days)
            .replace('%remainingBalance%', remainingBalance);
            
        } else if (originalMessage.startsWith("Yes, you can spend") && !originalMessage.includes("next bill")) {
          // Pattern: Yes, you can spend $X. Your balance will be $Y.
          const amount = amountToUse;
          
          // Extract newBalance
          const newBalanceMatch = originalMessage.match(/balance after this purchase will be \$([0-9.]+)/);
          const newBalance = newBalanceMatch ? newBalanceMatch[1] : "0.00";
          
          // Use the translated template with values
          botMessage = t('yesSafeToSpendNoBills')
            .replace('%amount%', amount)
            .replace('%newBalance%', newBalance);
            
        } else if (originalMessage.includes("but be careful")) {
          // Pattern: You can spend $X, but be careful. Balance will be $Y, and you have $Z in upcoming bills which would leave you with $W.
          const amount = amountToUse;
          
          // Extract newBalance
          const newBalanceMatch = originalMessage.match(/balance after this purchase will be \$([0-9.]+)/);
          const newBalance = newBalanceMatch ? newBalanceMatch[1] : "0.00";
          
          // Extract upcoming bills total
          const upcomingBillsMatch = originalMessage.match(/you have \$([0-9.]+) in upcoming bills/);
          const upcomingBills = upcomingBillsMatch ? upcomingBillsMatch[1] : "0.00";
          
          // Extract remaining balance
          const remainingBalanceMatch = originalMessage.match(/leave you with \$([0-9.]+)/);
          const remainingBalance = remainingBalanceMatch ? remainingBalanceMatch[1] : "0.00";
          
          // Use the translated template with values
          botMessage = t('yesButBeCareful')
            .replace('%amount%', amount)
            .replace('%newBalance%', newBalance)
            .replace('%upcomingBills%', upcomingBills)
            .replace('%remainingBalance%', remainingBalance);
            
        } else if (originalMessage.startsWith("Sorry, you cannot spend")) {
          // Pattern: Sorry, you cannot spend $X as it would exceed your current account balance of $Y.
          const amount = amountToUse;
          
          // Extract balance
          const balanceMatch = originalMessage.match(/account balance of \$([0-9.]+)/);
          const balance = balanceMatch ? balanceMatch[1] : "0.00";
          
          // Use the translated template with values
          botMessage = t('sorryCannotSpend')
            .replace('%amount%', amount)
            .replace('%balance%', balance);
        }
      }
      
      // Add bot response with animation flag
      setMessages((prev) => [...prev, { text: botMessage, sender: "bot", isAnimating: true }]);
    } catch (error) {
      console.error("Failed to get spending advice:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: t('chatbotErrorMessage'),
          sender: "bot",
          isAnimating: true
        },
      ]);
    } finally {
      setIsPending(false);
      setSelectedAmount(null);
      setIsCustomAmount(false);
      setCustomAmount("");
    }
  };

  /**
   * Handle the "Ask" button click
   * This function manages the user submission
   */
  const handleSubmitClick = () => {
    // Prevent multiple rapid clicks or processing while waiting for response
    if (isPending || isSubmittingRef.current) return;
    
    // Set the processing flag to prevent duplicate clicks
    isSubmittingRef.current = true;
    
    // Force EKG animation to reset completely before starting
    setIsPending(false);
    
    // Small delay to ensure animation resets completely before starting again
    setTimeout(() => {
      // Submit API request and start new animation
      setIsPending(true);
      handleSubmit();
    }, 50);
    
    // Reset submission flag after a delay to prevent double-clicks
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 350);
  };
  
  return (
    <Card className="bg-white shadow-lg shadow-primary/5 border border-border/40 backdrop-blur-md">
      <CardHeader className="pb-4 border-b border-border/30">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="flex items-center relative px-5 py-2.5 bg-primary/20 border border-primary/40 text-primary rounded-md shadow-glow-sm shadow-primary/10">
              <span className="flex items-center justify-center tracking-wide">
                {language === 'es' ? 'Alicia' : 'Alice'}
              </span>
            </CardTitle>
            {/* EKG trace appears only when thinking/processing */}
            {isPending && (
              <div className="ml-3">
                <EkgAnimation 
                  runAnimation={isPending} 
                  width={100} 
                  height={24} 
                  color="hsl(192 91% 55%)"
                />
              </div>
            )}
          </div>
          <CardDescription className="flex items-center bg-background/60 backdrop-blur-sm px-4 py-2 rounded-md shadow-md text-foreground border border-primary/20">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium glow-text">${balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}</span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea ref={scrollAreaRef} className="bg-background/40 backdrop-blur-sm rounded-lg p-4 mb-5 h-64 border border-border/30 shadow-inner">
          {messages.map((message, index) => (
            <div key={index} className="mb-3">
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                {/* Bot avatar for bot messages */}
                {message.sender === "bot" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mr-2 shadow-glow-sm">
                    <span className="text-primary text-xs font-bold">A</span>
                  </div>
                )}
                
                <div
                  className={`p-3 rounded-lg max-w-sm ${
                    message.sender === "user"
                      ? "bg-primary/20 text-foreground rounded-tr-none shadow-md border border-primary/40"
                      : "bg-background/60 backdrop-blur-sm text-foreground rounded-tl-none shadow-md border-l-2 border-primary/40"
                  }`}
                >
                  <p className={`${message.sender === "bot" ? "text-sm leading-relaxed" : "text-sm"}`}>
                    {message.sender === "bot" && message.isAnimating ? (
                      <TypeAnimation 
                        text={message.text} 
                        speed={12}
                        onComplete={() => handleAnimationComplete(index)}
                        onCharacterTyped={() => {
                          // Scroll to bottom on each character typed
                          if (scrollAreaRef.current) {
                            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                            if (scrollContainer) {
                              scrollContainer.scrollTop = scrollContainer.scrollHeight;
                            }
                          }
                        }}
                      />
                    ) : (
                      message.text
                    )}
                  </p>
                </div>
                
                {/* User avatar for user messages */}
                {message.sender === "user" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-md bg-primary/30 border border-primary/40 flex items-center justify-center ml-2 shadow-glow-sm text-foreground">
                    <span className="text-xs font-medium">You</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 rounded-md bg-background/60 backdrop-blur-sm border border-border/30 shadow-glow-sm shadow-primary/5">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {isCustomAmount ? (
              <div className="flex w-full sm:flex-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-medium">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-2.5 border border-border/50 bg-background/60 text-foreground rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 shadow-glow-sm backdrop-blur-sm transition-all duration-150"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 bg-background/60 border-border/50 text-primary shadow-glow-sm hover:bg-primary/10 hover:text-primary/90 transition-all duration-150"
                  onClick={() => {
                    setIsCustomAmount(false);
                    setCustomAmount("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Select value={selectedAmount || ""} onValueChange={setSelectedAmount}>
                <SelectTrigger className="flex-1 border-border/50 bg-background/60 text-foreground shadow-glow-sm hover:border-primary/40 backdrop-blur-sm transition-colors duration-150">
                  <SelectValue placeholder={t('chatbotPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-lg border border-border/50 text-foreground">
                  <SelectItem value="10">{t('canISpend')} $10?</SelectItem>
                  <SelectItem value="20">{t('canISpend')} $20?</SelectItem>
                  <SelectItem value="50">{t('canISpend')} $50?</SelectItem>
                  <SelectItem value="100">{t('canISpend')} $100?</SelectItem>
                  <SelectItem value="custom" className="text-primary">{t('customSpend')}</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={handleSubmitClick}
              disabled={(isCustomAmount ? !customAmount : !selectedAmount) || isPending}
              className={`w-full sm:w-auto shadow-glow-sm transition-all duration-150 ${
                isPending 
                  ? 'bg-primary/50' 
                  : 'bg-primary/20 border border-primary/40 hover:bg-primary/30 text-primary'
              }`}
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
        </div>
      </CardContent>
    </Card>
  );
}
