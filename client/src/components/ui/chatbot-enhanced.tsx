import { useState, useEffect, useRef } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Loader2, DollarSign, MessageSquare } from "lucide-react";
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

export default function EnhancedChatbot({ bills }: ChatbotProps) {
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
        ? "¡Hola! Soy Alicia. Pregúntame sobre tus finanzas."
        : "Hello! I'm Alice. Ask me about your finances.",
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

        // Add bot response with animation flag
        let botMessage = data.message;
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
      handleSubmit();

      // Set a timer to end the animation after the eraser dots have completed
      setTimeout(() => {
        // Order matters - first set animation false THEN isPending
        setShowAnimation(false);

        // Add very small delay to ensure React removes the animation component
        setTimeout(() => {
          setIsPending(false);
          isSubmittingRef.current = false;
        }, 50);
      }, 3000); // Animation duration
    }, 50);
  };

  return (
    <div className="relative">
      {/* Full width ECG animation when pending */}
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
                {/* Futuristic hexagonal avatar */}
                <div className="relative h-12 w-12 mr-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary to-primary-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse rounded-xl overflow-hidden" 
                       style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-xl font-bold tracking-wide text-primary-600 relative">
                    <span className="relative">
                      <span className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-transparent rounded-lg blur-sm opacity-70"></span>
                      <span className="relative">{language === 'es' ? 'Alicia' : 'Alice'}</span>
                      <span className="ml-1.5 text-xs font-medium text-primary-500 opacity-70 tracking-wider">v2.0</span>
                    </span>
                  </div>

                  {/* ECG heartbeat animation */}
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
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          {/* Chat message area */}
          <ScrollArea 
            ref={scrollAreaRef} 
            className="bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-lg rounded-xl p-4 mb-5 h-72 border border-primary-100/30 shadow-inner relative overflow-hidden"
            style={{ 
              backgroundImage: `radial-gradient(circle at 50% 10%, rgba(59, 130, 246, 0.07) 0%, transparent 70%)`
            }}
          >
            {/* Background grid lines */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10"
                 style={{ 
                  backgroundImage: `linear-gradient(0deg, transparent 24%, var(--primary) 25%, var(--primary) 26%, transparent 27%, transparent 74%, var(--primary) 75%, var(--primary) 76%, transparent 77%, transparent), 
                                    linear-gradient(90deg, transparent 24%, var(--primary) 25%, var(--primary) 26%, transparent 27%, transparent 74%, var(--primary) 75%, var(--primary) 76%, transparent 77%, transparent)`,
                  backgroundSize: '40px 40px',
                  backgroundPosition: 'center center'
                }}>
            </div>
            
            {/* Messages display */}
            {messages.map((message, index) => (
              <div key={index} className="mb-6 relative z-10">
                <div
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Bot avatar */}
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
                    {/* Message content */}
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
                    
                    {/* Timestamp */}
                    <div className={`text-[10px] mt-1 ${message.sender === "user" ? "text-right text-primary-500" : "text-primary-400"}`}>
                      <span className="font-mono tracking-wider">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                <MessageSquare className="h-3.5 w-3.5 inline-block mr-1.5" />
                Questions
              </button>
            </div>
          </div>

          {/* Input area */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-lg border border-primary-50 shadow-sm relative">
            {/* Background dots */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-5" 
                 style={{ 
                   backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
                   backgroundSize: '20px 20px'
                 }}>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 relative z-10">
              {questionMode === "amount" ? (
                // Amount-based question inputs
                isCustomAmount ? (
                  // Custom amount input
                  <div className="flex w-full sm:flex-1">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <span className="text-primary-600 font-bold filter drop-shadow-sm">$</span>
                        <span className="absolute h-6 w-6 bg-blue-400/10 rounded-full -z-10 animate-pulse"></span>
                      </div>
                      
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-2.5 border-0 bg-primary-50/30 text-primary-900 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white/80 
                                   shadow-inner transition-all duration-150 backdrop-blur-sm"
                        style={{ boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.1)' }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && customAmount && !isPending) {
                            handleSubmitClick();
                          }
                        }}
                      />
                      
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none opacity-30">
                        <div className="h-3 w-0.5 bg-primary-300 rounded-full"></div>
                        <div className="h-2 w-0.5 bg-primary-300 rounded-full"></div>
                        <div className="h-4 w-0.5 bg-primary-300 rounded-full"></div>
                      </div>
                    </div>
                    
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
                  // Amount select dropdown
                  <Select value={selectedAmount || ""} onValueChange={setSelectedAmount}>
                    <SelectTrigger className="flex-1 border-0 bg-primary-50/30 text-primary-800 backdrop-blur-sm 
                                              shadow-inner hover:bg-white/80 hover:border-primary/40 transition-all duration-200"
                                  style={{ boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.1)' }}>
                      <SelectValue placeholder={t('chatbotPlaceholder')} />
                      
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none opacity-30">
                        <div className="h-3 w-0.5 bg-primary-300 rounded-full"></div>
                        <div className="h-2 w-0.5 bg-primary-300 rounded-full"></div>
                        <div className="h-4 w-0.5 bg-primary-300 rounded-full"></div>
                      </div>
                    </SelectTrigger>
                    
                    <SelectContent>
                      <SelectItem value="10">$10</SelectItem>
                      <SelectItem value="25">$25</SelectItem>
                      <SelectItem value="50">$50</SelectItem>
                      <SelectItem value="100">$100</SelectItem>
                      <SelectItem value="200">$200</SelectItem>
                      <SelectItem value="custom">{t('customSpend')}</SelectItem>
                    </SelectContent>
                  </Select>
                )
              ) : (
                // Free-form question input
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={freeFormQuestion}
                    onChange={(e) => setFreeFormQuestion(e.target.value)}
                    placeholder="Ask about your finances, bills, budget, or savings..."
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
                  
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none opacity-30">
                    <div className="h-3 w-0.5 bg-primary-300 rounded-full"></div>
                    <div className="h-2 w-0.5 bg-primary-300 rounded-full"></div>
                    <div className="h-4 w-0.5 bg-primary-300 rounded-full"></div>
                  </div>
                </div>
              )}
              
              {/* Submit button or loading indicator */}
              {isPending ? (
                <div className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary-600/90 text-white 
                                flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary-500 opacity-30 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-400/70 to-primary-400/0 
                                    animate-pulse" style={{ animationDuration: '1.5s' }}></div>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 drop-shadow-glow" />
                    <span className="font-medium tracking-wide">{t('thinking')}</span>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleSubmitClick}
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md"
                >
                  {questionMode === "freeform" ? "Ask" : "Calculate"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}