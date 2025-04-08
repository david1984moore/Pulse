import { useState, useEffect, useRef } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AliceEcg from "./alice-ecg";
import SimpleEkg from "./simple-ekg";
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
import "./ekg-animation.css";

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
  
  // Prevent multiple rapid/duplicate clicks
  const isSubmittingRef = useRef(false);
  
  // Use a unique key to force complete remount of animation component
  const [animationKey, setAnimationKey] = useState(1);
  
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
        // Handle translations based on message type
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
   * Guaranteed reliable handler that forces a complete remount of the animation
   */
  const handleSubmitClick = () => {
    // Prevent rapid clicks
    if (isPending || isSubmittingRef.current) return;
    
    // Lock the button immediately
    isSubmittingRef.current = true;
    
    // Force animation to stop
    setIsPending(false);
    
    // Generate a new animation key to force complete component remount
    setAnimationKey(prevKey => prevKey + 1);
    
    // Wait for DOM to update and previous animation to be removed
    setTimeout(() => {
      // Start completely fresh animation
      setIsPending(true);
      
      // Submit the request after a small delay to let animation start
      setTimeout(() => {
        handleSubmit();
        
        // Allow a full 5 seconds for animation to complete
        setTimeout(() => {
          isSubmittingRef.current = false;
        }, 5000);
      }, 200);
    }, 100);
  };
  
  return (
    <div className="relative">
      {/* Full width ECG animation with forced unique instance per animation cycle */}
      {isPending && (
        <div className="ekg-fullwidth absolute top-0 left-0 w-full h-full">
          <SimpleEkg 
            key={`ekg-${animationKey}`}
            active={isPending} 
            lineColor="rgba(255, 255, 255, 0.9)"
            width={600} 
            height={300}
            strokeWidth={3}
          />
        </div>
      )}
      
      <Card className="backdrop-blur-xl bg-white/90 shadow-xl border-none overflow-hidden rounded-2xl relative z-10">
        <CardHeader className="pb-4 border-b border-gray-100 bg-gradient-to-r from-primary/20 to-primary/10">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center px-5 py-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center mr-3 shadow-md">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div className="flex items-center">
                  <div className="text-xl font-bold tracking-wide text-primary-600">
                    {language === 'es' ? 'Alicia' : 'Alice'}
                  </div>
                  
                  {/* Sexy ECG heartbeat animation next to Alice's name - also with unique key */}
                  <AliceEcg key={`alice-ecg-${animationKey}`} active={isPending} color="#FFFFFF" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center px-4 py-2">
              <div className="flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-600/20 to-primary/30 shadow-md">
                <DollarSign className="h-4 w-4 mr-1.5 text-primary-600" />
                <span className="font-bold text-primary-700">
                  ${balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      
        <CardContent className="pt-5">
          {/* Chat message area with improved styling */}
          <ScrollArea 
            ref={scrollAreaRef} 
            className="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-5 h-72 border border-gray-100"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center mb-4 shadow-md">
                  <span className="text-white text-xl font-bold">A</span>
                </div>
                <h3 className="text-primary-600 font-bold text-lg mb-2">Your Financial Companion</h3>
                <p className="text-gray-600 text-sm max-w-xs">
                  Ask Alice if you can spend a specific amount and she'll analyze your financial situation.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-6">
                  <div
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Bot avatar with attractive styling */}
                    {message.sender === "bot" && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center mr-3 shadow-sm">
                        <span className="text-white font-bold text-sm">A</span>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-sm ${
                        message.sender === "user"
                          ? "text-right"
                          : ""
                      }`}
                    >
                      <p className={`${
                        message.sender === "user" 
                          ? "text-sm text-primary-600 font-medium pb-1" 
                          : "text-sm leading-relaxed text-gray-700 pb-1"
                      }`}>
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
                      {/* Add subtle timestamp */}
                      <div className={`text-[10px] text-gray-400 ${message.sender === "user" ? "text-right" : ""}`}>
                        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>

          {/* Input area with sleek modern styling */}
          <div className="p-4 rounded-xl bg-white/80 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {isCustomAmount ? (
                <div className="flex w-full sm:flex-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 shadow-sm transition-all duration-150"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2 bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150"
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
                  <SelectTrigger className="flex-1 border-gray-200 bg-white text-gray-800 shadow-sm hover:border-primary/40 transition-colors duration-150">
                    <SelectValue placeholder={t('chatbotPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 text-gray-800">
                    <SelectItem value="10">{t('canISpend')} $10?</SelectItem>
                    <SelectItem value="20">{t('canISpend')} $20?</SelectItem>
                    <SelectItem value="50">{t('canISpend')} $50?</SelectItem>
                    <SelectItem value="100">{t('canISpend')} $100?</SelectItem>
                    <SelectItem value="custom" className="text-primary font-medium">{t('customSpend')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {isPending ? (
                // Show custom processing button when pending
                <div className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary/50 text-white flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>{t('thinking')}</span>
                </div>
              ) : (
                // Standard button when not pending
                <Button
                  onClick={handleSubmitClick}
                  disabled={isCustomAmount ? !customAmount : !selectedAmount}
                  className="w-full sm:w-auto bg-gradient-to-br from-primary to-primary-600 hover:from-primary-600 hover:to-primary text-white shadow-glow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-center group">
                    <Send className="mr-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    <span>{t('ask')}</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}