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
import { Loader2, DollarSign } from "lucide-react";
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
  const [freeFormQuestion, setFreeFormQuestion] = useState<string>("");
  const [questionMode, setQuestionMode] = useState<"amount" | "freeform">("amount");
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
    // Handle different question modes
    if (questionMode === "amount") {
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
    } else if (questionMode === "freeform") {
      // Handle free-form questions
      if (!freeFormQuestion.trim()) return;
      
      // Add user message
      setMessages((prev) => [...prev, { text: freeFormQuestion, sender: "user" }]);
      
      // Send request to API
      setIsPending(true);
      try {
        // Use the financial advisor API for free-form questions
        const response = await secureApiRequest("POST", "/api/financial-advisor", { query: freeFormQuestion });
        const data = await response.json();
        
        // Add bot response with animation flag
        let botMessage = data.message || t('chatbotErrorMessage');
        setMessages((prev) => [...prev, { text: botMessage, sender: "bot", isAnimating: true }]);
      } catch (error) {
        console.error("Failed to process financial question:", error);
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
        setFreeFormQuestion("");
      }
    }
  };

  /**
   * Guaranteed reliable handler that starts the animation independently from API response
   */
  const handleSubmitClick = () => {
    // Check if there is a valid input based on the question mode
    if (questionMode === "amount") {
      if ((isCustomAmount && !customAmount) || (!isCustomAmount && !selectedAmount)) {
        // If no valid selection, prompt the user to make a selection
        const userMessage = "Please select or enter an amount";
        setMessages((prev) => [...prev, { text: userMessage, sender: "bot", isAnimating: true }]);
        return;
      }
    } else if (questionMode === "freeform") {
      if (!freeFormQuestion.trim()) {
        // If no question is entered, prompt the user
        const userMessage = "Please enter a question about your finances";
        setMessages((prev) => [...prev, { text: userMessage, sender: "bot", isAnimating: true }]);
        return;
      }
    }

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

      <Card className="backdrop-blur-xl bg-white/90 shadow-xl border-none overflow-hidden rounded-2xl relative z-10 border-t border-l border-white/40">
        <CardHeader className="pb-4 border-b border-primary-100/30 bg-gradient-to-r from-primary/20 to-primary/10">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center px-5 py-2.5">
                {/* Futuristic hexagonal avatar instead of circle */}
                <div className="relative h-12 w-12 mr-3">
                  {/* Hexagon shape with gradient and glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary to-primary-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse rounded-xl overflow-hidden" 
                       style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                  </div>
                  {/* Inner content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  {/* Decorative tech lines */}
                  <div className="absolute inset-0 opacity-30 pointer-events-none" 
                       style={{ 
                         background: "radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.05) 70%)",
                         clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" 
                       }}>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-xl font-bold tracking-wide text-primary-600 relative">
                    <span className="relative">
                      {/* Subtle holographic effect */}
                      <span className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-transparent rounded-lg blur-sm opacity-70"></span>
                      <span className="relative">{language === 'es' ? 'Alicia' : 'Alice'}</span>
                      {/* Tech version indicator */}
                      <span className="ml-1.5 text-xs font-medium text-primary-500 opacity-70 tracking-wider">v1.0</span>
                    </span>
                  </div>

                  {/* ECG heartbeat animation - preserved as requested */}
                  <AliceCssEcg key={`alice-ecg-${animationKey}`} active={showAnimation} color="#FFFFFF" />
                </div>
              </div>
            </div>

            <div className="flex items-center px-4 py-2">
              <div className="flex items-center justify-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary-600/20 to-primary/30 shadow-md border border-white/20 backdrop-filter backdrop-blur-sm">
                <DollarSign className="h-4 w-4 mr-1.5 text-primary-600" />
                <span className="font-bold text-primary-700">
                  {balanceData?.calculatedBalance ? Number(balanceData.calculatedBalance).toFixed(2) : '0.00'}
                </span>
                {/* Add futuristic mini-indicator */}
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          {/* Chat message area with futuristic styling */}
          <ScrollArea 
            ref={scrollAreaRef} 
            className="bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-lg rounded-xl p-4 mb-5 h-72 border border-primary-100/30 shadow-inner relative overflow-hidden"
            style={{ 
              backgroundImage: `radial-gradient(circle at 50% 10%, rgba(59, 130, 246, 0.07) 0%, transparent 70%)`
            }}
          >
            {/* Decorative tech grid lines in background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10"
                 style={{ 
                  backgroundImage: `linear-gradient(0deg, transparent 24%, var(--primary) 25%, var(--primary) 26%, transparent 27%, transparent 74%, var(--primary) 75%, var(--primary) 76%, transparent 77%, transparent), 
                                    linear-gradient(90deg, transparent 24%, var(--primary) 25%, var(--primary) 26%, transparent 27%, transparent 74%, var(--primary) 75%, var(--primary) 76%, transparent 77%, transparent)`,
                  backgroundSize: '40px 40px',
                  backgroundPosition: 'center center'
                }}>
            </div>
            
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 relative z-10">
                {/* Hexagonal avatar matching the header */}
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary to-primary-600 shadow-lg animate-pulse" 
                       style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">A</span>
                  </div>
                </div>
                <h3 className="text-primary-600 font-bold text-lg mb-2 relative">
                  <span className="relative">AI Financial Assistant</span>
                </h3>
                <p className="text-gray-600 text-sm max-w-xs">
                  Ask Alice if you can spend a specific amount and she'll analyze your financial situation in real-time.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-6 relative z-10">
                  <div
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Bot avatar with futuristic styling */}
                    {message.sender === "bot" && (
                      <div className="relative flex-shrink-0 h-8 w-8 mr-3">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary to-primary-600" 
                             style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">A</span>
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-sm relative ${
                        message.sender === "user"
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {/* Message content with borderless Grok3-style directly on screen */}
                      <div className="relative z-10">
                        <p className={`text-base leading-relaxed relative z-10 ${
                            message.sender === "user" 
                              ? "text-primary-600 font-medium" 
                              : "text-gray-700"
                          }`}
                        >
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
                      
                      {/* Futuristic timestamp without ID */}
                      <div className={`text-[10px] mt-1 ${message.sender === "user" ? "text-right text-primary-500" : "text-primary-400"}`}>
                        <span className="font-mono tracking-wider">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>

          {/* Question mode toggle */}
          <div className="mb-3 flex justify-center">
            <div className="inline-flex items-center p-1 bg-primary-50/50 backdrop-blur-sm rounded-lg border border-primary-100/50">
              <button
                onClick={() => setQuestionMode("amount")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  questionMode === "amount"
                    ? "bg-white text-primary-700 shadow-sm"
                    : "text-primary-600 hover:bg-white/50"
                }`}
              >
                <DollarSign className="h-3.5 w-3.5 inline-block mr-1.5" />
                Spending
              </button>
              <button
                onClick={() => setQuestionMode("freeform")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  questionMode === "freeform"
                    ? "bg-white text-primary-700 shadow-sm"
                    : "text-primary-600 hover:bg-white/50"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" className="inline-block mr-1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12H16M8 8H16M8 16H13M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Questions
              </button>
            </div>
          </div>

          {/* Input area with futuristic styling */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-lg border border-primary-50 shadow-sm relative">
            {/* Decorative tech dots in background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-5" 
                 style={{ 
                   backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
                   backgroundSize: '20px 20px'
                 }}>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 relative z-10">
              {questionMode === "amount" ? (
                isCustomAmount ? (
                <div className="flex w-full sm:flex-1">
                  <div className="relative flex-1">
                    {/* Futuristic $ icon with glow */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <span className="text-primary-600 font-bold filter drop-shadow-sm">$</span>
                      <span className="absolute h-6 w-6 bg-blue-400/10 rounded-full -z-10 animate-pulse"></span>
                    </div>
                    
                    {/* Stylized input field */}
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-2.5 border-0 bg-primary-50/30 text-primary-900 rounded-lg 
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white/80 
                                 shadow-inner transition-all duration-150 backdrop-blur-sm"
                      style={{ boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.1)' }}
                    />
                    
                    {/* Help ghost lines */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none opacity-30">
                      <div className="h-3 w-0.5 bg-primary-300 rounded-full"></div>
                      <div className="h-2 w-0.5 bg-primary-300 rounded-full"></div>
                      <div className="h-4 w-0.5 bg-primary-300 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Cancel button with slight future style */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2 bg-white/80 backdrop-blur-sm border border-primary-100 text-primary-600 
                               hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200
                               transition-all duration-150"
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
                  <SelectTrigger className="flex-1 border-0 bg-primary-50/30 text-primary-800 backdrop-blur-sm 
                                            shadow-inner hover:bg-white/80 hover:border-primary/40 transition-all duration-200"
                                style={{ boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.1)' }}>
                    <SelectValue placeholder={t('chatbotPlaceholder')} />
                    
                    {/* Decorative elements inside select */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none opacity-30">
                      <div className="h-3 w-0.5 bg-primary-300 rounded-full"></div>
                      <div className="h-2 w-0.5 bg-primary-300 rounded-full"></div>
                      <div className="h-4 w-0.5 bg-primary-300 rounded-full"></div>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border border-primary-100 text-primary-800 shadow-lg">
                    <div className="py-1 px-1 text-xs text-primary-400 border-b border-primary-50 mb-1 font-medium tracking-wide">QUICK AMOUNTS</div>
                    <SelectItem value="10" className="hover:bg-primary-50/50">{t('canISpend')} $10?</SelectItem>
                    <SelectItem value="20" className="hover:bg-primary-50/50">{t('canISpend')} $20?</SelectItem>
                    <SelectItem value="50" className="hover:bg-primary-50/50">{t('canISpend')} $50?</SelectItem>
                    <SelectItem value="100" className="hover:bg-primary-50/50">{t('canISpend')} $100?</SelectItem>
                    <div className="h-px bg-primary-50 my-1"></div>
                    <SelectItem value="custom" className="text-primary-600 font-medium hover:bg-primary-50/50">{t('customSpend')}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                // Free-form question mode
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={freeFormQuestion}
                    onChange={(e) => setFreeFormQuestion(e.target.value)}
                    placeholder="Ask Alice about your finances..."
                    className="w-full px-4 py-2.5 border-0 bg-primary-50/30 text-primary-900 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white/80 
                              shadow-inner transition-all duration-150 backdrop-blur-sm"
                    style={{ boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.1)' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && freeFormQuestion.trim() && !isPending) {
                        handleSubmitClick();
                      }
                    }}
                  />
                  
                  {/* Help ghost lines */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none opacity-30">
                    <div className="h-3 w-0.5 bg-primary-300 rounded-full"></div>
                    <div className="h-2 w-0.5 bg-primary-300 rounded-full"></div>
                    <div className="h-4 w-0.5 bg-primary-300 rounded-full"></div>
                  </div>
                </div>
              )}
              
              {isPending ? (
                // Futuristic processing button when pending
                <div className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary-600/90 text-white 
                                flex items-center justify-center relative overflow-hidden group">
                  {/* Animated pulse background */}
                  <div className="absolute inset-0 bg-primary-500 opacity-30 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-400/70 to-primary-400/0 
                                    animate-pulse" style={{ animationDuration: '1.5s' }}></div>
                  </div>
                  
                  {/* Loading spinner with enhanced glow */}
                  <div className="relative z-10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 drop-shadow-glow" />
                    <span className="font-medium tracking-wide">{t('thinking')}</span>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleSubmitClick}
                  disabled={false}
                  className={`
                    w-full sm:w-auto bg-blue-600
                    text-white font-extrabold relative 
                    shadow-xl
                    rounded-lg py-4 px-8 border-2 border-blue-400
                    text-lg
                  `}
                >
                  <div className="flex items-center justify-center relative z-10">
                    {/* Pulse line icon instead of paper airplane */}
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4,12 L8,12 L10,8 L12,16 L14,6 L16,12 L20,12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-bold tracking-wide text-lg uppercase">{t('ask')}</span>
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