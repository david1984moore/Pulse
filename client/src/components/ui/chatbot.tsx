import { useState, useEffect, useRef } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// Use new CSS-based ECG animation components
import AliceCssEcg from "./alice-css-ecg";
import EkgCssAnimation from "./ekg-css-animation";
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

  // For controlling the animation state and component remounting
  const [animationKey, setAnimationKey] = useState(1);
  const [showAnimation, setShowAnimation] = useState(false);

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
   * Guaranteed reliable handler that starts the animation independently from API response
   */
  const handleSubmitClick = () => {
    // Prevent rapid clicks
    if (isPending || isSubmittingRef.current) return;

    // Lock the button immediately
    isSubmittingRef.current = true;

    // Force animation state reset
    setShowAnimation(false);

    // Generate a new animation key to force complete component remount
    setAnimationKey(prevKey => prevKey + 1);

    // Wait for DOM to update and previous animation to be removed
    setTimeout(() => {
      // Set states to control animation
      setIsPending(true);
      setShowAnimation(true);

      // Submit the request after the animation has started
      // Animation runs independently from API response
      handleSubmit();

      // Set a timer to end the animation after the eraser dots have completed
      setTimeout(() => {
        // Order matters - first set animation false THEN isPending
        setShowAnimation(false);

        // Add very small delay to ensure React removes the animation component
        // before updating isPending and triggering component state changes
        setTimeout(() => {
          setIsPending(false);
          isSubmittingRef.current = false;
        }, 50);
      }, 4000); // Allow animation to fully complete with all dots
    }, 50);
  };

  return (
    <div className="relative">
      {/* Full width ECG animation with forced unique instance per animation cycle */}
      {isPending && (
        <div className="ekg-fullwidth absolute top-0 left-0 w-full h-full">
          <EkgCssAnimation 
            key={`ekg-fullwidth-${animationKey}`}
            active={showAnimation}
            lineColor="rgba(255, 255, 255, 0.9)"
            width={600} 
            height={300}
            strokeWidth={3}
          />
        </div>
      )}

      <Card className="backdrop-blur-xl bg-black/80 shadow-2xl border border-indigo-500/30 overflow-hidden rounded-2xl relative z-10">
        <CardHeader className="pb-4 border-b border-indigo-600/20 bg-gradient-to-r from-indigo-900/20 via-slate-900/50 to-black/80">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center px-5 py-2.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600/70 to-blue-800/90 flex items-center justify-center mr-3 shadow-lg border border-indigo-400/30 backdrop-blur-xl">
                  <span className="text-white font-bold text-lg bg-clip-text text-transparent bg-gradient-to-br from-white to-indigo-200">A</span>
                </div>
                <div className="flex items-center">
                  <div className="text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-br from-indigo-100 to-blue-200">
                    {language === 'es' ? 'Alicia' : 'Alice'}
                    <div className="mt-0.5 h-[2px] w-full bg-gradient-to-r from-indigo-500/90 via-indigo-400/70 to-transparent rounded-full"></div>
                  </div>

                  {/* Sexy ECG heartbeat animation next to Alice's name - also with unique key */}
                  <AliceCssEcg key={`alice-ecg-${animationKey}`} active={showAnimation} color="#a5b4fc" />
                </div>
              </div>
            </div>

            <div className="flex items-center px-4 py-2">
              <div className="flex items-center justify-center px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-900/40 to-indigo-800/30 border border-indigo-500/20 shadow-lg backdrop-blur-md">
                <DollarSign className="h-4 w-4 mr-1.5 text-indigo-300" />
                <span className="font-bold text-indigo-100">
                  {balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 bg-gradient-to-b from-slate-900/80 to-black/90">
          {/* Chat message area with improved styling */}
          <ScrollArea 
            ref={scrollAreaRef} 
            className="bg-gradient-to-b from-slate-900/70 to-black/70 backdrop-blur-md rounded-xl p-4 mb-5 h-72 border border-indigo-500/20 shadow-inner"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600/70 to-blue-800/90 flex items-center justify-center mb-4 shadow-lg border border-indigo-400/30">
                  <span className="text-white text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-indigo-200">A</span>
                </div>
                <h3 className="bg-clip-text text-transparent bg-gradient-to-br from-indigo-100 to-blue-200 font-bold text-lg mb-2">Your Financial AI</h3>
                <p className="text-indigo-200/80 text-sm max-w-xs">
                  Ask Alice if you can spend a specific amount and she'll analyze your financial situation using advanced algorithms.
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
                    {/* Bot avatar with futuristic styling */}
                    {message.sender === "bot" && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600/70 to-blue-800/90 flex items-center justify-center mr-3 shadow-lg border border-indigo-400/30">
                        <span className="text-white font-bold text-sm bg-clip-text text-transparent bg-gradient-to-br from-white to-indigo-200">A</span>
                      </div>
                    )}

                    <div
                      className={`max-w-sm ${
                        message.sender === "user"
                          ? "text-right"
                          : ""
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${
                        message.sender === "user" 
                          ? "bg-indigo-600/30 border border-indigo-500/30 shadow-lg" 
                          : "bg-slate-800/50 border border-indigo-500/20 shadow-lg"
                      }`}>
                        <p className={`${
                          message.sender === "user" 
                            ? "text-sm text-indigo-100 font-medium" 
                            : "text-sm leading-relaxed text-gray-100"
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
                      </div>
                      {/* Add subtle timestamp with futuristic styling */}
                      <div className={`text-[10px] text-indigo-300/70 mt-1 ${message.sender === "user" ? "text-right" : ""}`}>
                        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>

          {/* Input area with futuristic styling */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/90 to-indigo-900/50 border border-indigo-500/30 shadow-md backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {isCustomAmount ? (
                <div className="flex w-full sm:flex-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 font-bold">$</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-2.5 border border-indigo-500/40 bg-slate-800/80 text-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/60 shadow-inner transition-all duration-150"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2 bg-slate-800/80 border-indigo-500/30 text-indigo-200 hover:bg-indigo-900/60 hover:text-indigo-100 transition-all duration-150"
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
                  <SelectTrigger className="flex-1 border-indigo-500/40 bg-slate-800/80 text-indigo-100 shadow-inner hover:border-indigo-400/60 transition-colors duration-150">
                    <SelectValue placeholder={t('chatbotPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border border-indigo-500/30 text-indigo-100">
                    <SelectItem value="10">{t('canISpend')} $10?</SelectItem>
                    <SelectItem value="20">{t('canISpend')} $20?</SelectItem>
                    <SelectItem value="50">{t('canISpend')} $50?</SelectItem>
                    <SelectItem value="100">{t('canISpend')} $100?</SelectItem>
                    <SelectItem value="custom" className="text-indigo-300 font-medium">{t('customSpend')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {isPending ? (
                // Show custom processing button when pending
                <div className="w-full sm:w-auto px-4 py-2 rounded-md bg-indigo-600/50 text-white flex items-center justify-center border border-indigo-500/40 shadow-lg">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>{t('thinking')}</span>
                </div>
              ) : (
                // Standard button when not pending
                <Button
                  onClick={handleSubmitClick}
                  disabled={isCustomAmount ? !customAmount : !selectedAmount}
                  className="w-full sm:w-auto bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white shadow-[0_0_15px_rgba(165,180,252,0.5)] border border-indigo-400/30 transition-all duration-200"
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