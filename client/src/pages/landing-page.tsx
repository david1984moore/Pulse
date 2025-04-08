import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Calendar, MessageSquare, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import LanguageToggle from "@/components/ui/language-toggle";
import { useState } from "react";
import { PulseLogo } from "@/components/ui/pulse-logo";

export default function LandingPage() {
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation - Refined and modern */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <div className="cursor-pointer">
                    <PulseLogo size="md" />
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
              <LanguageToggle />
              
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 text-sm font-medium rounded-lg"
                    >
                      {t('dashboard')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => logoutMutation.mutate()}
                    className="text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-2 text-sm font-medium rounded-lg ml-2"
                  >
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button 
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 text-sm font-medium rounded-lg"
                    >
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button 
                      variant="outline"
                      className="text-primary border border-primary/20 hover:bg-primary/5 px-4 py-2 text-sm font-medium rounded-lg ml-2"
                    >
                      {t('signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="block h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile menu, show/hide based on menu state */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-white border-t border-gray-100 shadow-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <div className="block px-3 py-2">
                  <LanguageToggle />
                </div>
                
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <span className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                        {t('dashboard')}
                      </span>
                    </Link>
                    <button
                      onClick={() => logoutMutation.mutate()}
                      className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <span className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                        {t('login')}
                      </span>
                    </Link>
                    <Link href="/signup">
                      <span className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                        {t('signup')}
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Enhanced Modern */}
      <div className="relative bg-white overflow-hidden">
        {/* Improved gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-blue-50/30"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-2xl opacity-70"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          <svg className="absolute right-0 top-1/4 opacity-10 text-primary w-96 h-96" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M45.9,-51.2C59.5,-43.7,70.8,-29.7,74.5,-13.5C78.2,2.7,74.3,21.1,64.5,35.1C54.7,49.1,39.1,58.7,22.1,64.8C5.1,70.9,-13.3,73.5,-30.7,68.7C-48.1,63.9,-64.5,51.8,-72.8,35.2C-81.1,18.6,-81.2,-2.3,-75.4,-20.9C-69.5,-39.5,-57.5,-55.7,-42.6,-62.7C-27.7,-69.7,-9.8,-67.4,5.1,-73.1C20,-78.7,32.3,-58.6,45.9,-51.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto pt-20 pb-28 px-4 sm:pt-32 sm:pb-40 sm:px-6 lg:px-8">
          <div className="max-w-4xl z-10 relative">
            {/* Improved title with accent */}
            <div className="mb-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-600 text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                Pulse Finance
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-800 sm:text-5xl lg:text-6xl mb-6 leading-tight">
              {t('heroTitle')}
              <span className="text-primary">.</span>
            </h1>
            
            <p className="mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed">
              {t('heroDescription')}
            </p>
            
            {/* Improved CTA buttons */}
            <div className="mt-12 flex flex-wrap gap-4">
              {!user ? (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl rounded-lg px-8 py-6 transform hover:-translate-y-0.5 transition-all">
                      {t('getStarted')}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-primary/20 text-primary-700 hover:bg-primary/5 hover:border-primary/30 rounded-lg px-8 py-6 transform hover:-translate-y-0.5 transition-all"
                    >
                      {t('signIn')}
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl rounded-lg px-8 py-6 transform hover:-translate-y-0.5 transition-all">
                    {t('goToDashboard')}
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Stats badges */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm">
                <span className="text-2xl font-bold text-primary">100%</span>
                <span className="text-xs text-gray-500 mt-1 text-center">Free to Use</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm">
                <span className="text-2xl font-bold text-primary">24/7</span>
                <span className="text-xs text-gray-500 mt-1 text-center">Financial Insights</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm sm:col-span-1 col-span-2">
                <span className="text-2xl font-bold text-primary">AI</span>
                <span className="text-xs text-gray-500 mt-1 text-center">Powered Assistant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced Design */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary-600 text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              {t('featuresTitle')}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 sm:text-4xl lg:text-5xl tracking-tight">
              {t('featuresTagline')}
              <span className="text-primary">.</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              {t('featuresDescription')}
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Income Management Card */}
              <div className="group transform hover:-translate-y-2 transition-all duration-300">
                <div className="flex flex-col h-full bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-8 flex-grow">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
                      <CircleDollarSign className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{t('incomeManagementTitle')}</h3>
                    <p className="text-gray-600">{t('incomeManagementDescription')}</p>
                  </div>
                  {/* Decorative pattern bottom */}
                  <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                </div>
              </div>

              {/* Calendar View Card */}
              <div className="group transform hover:-translate-y-2 transition-all duration-300">
                <div className="flex flex-col h-full bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-8 flex-grow">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{t('calendarViewTitle')}</h3>
                    <p className="text-gray-600">{t('calendarViewDescription')}</p>
                  </div>
                  {/* Decorative pattern bottom */}
                  <div className="h-2 w-full bg-gradient-to-r from-blue-400 to-blue-500"></div>
                </div>
              </div>

              {/* Spending Assistant Card */}
              <div className="group transform hover:-translate-y-2 transition-all duration-300">
                <div className="flex flex-col h-full bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-8 flex-grow">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-violet-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
                      <MessageSquare className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{t('spendingAssistantTitle')}</h3>
                    <p className="text-gray-600">{t('spendingAssistantDescription')}</p>
                  </div>
                  {/* Decorative pattern bottom */}
                  <div className="h-2 w-full bg-gradient-to-r from-primary to-violet-500"></div>
                </div>
              </div>
            </div>
            
            {/* Feature Callout */}
            <div className="mt-20 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                    AI Powered
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Get smarter financial insights with our AI assistant</h3>
                  <p className="text-gray-600 mb-8">Our AI assistant helps you make informed spending decisions based on your financial situation, upcoming bills, and spending patterns.</p>
                  <div>
                    <Link href="/signup">
                      <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-xl rounded-lg transform hover:-translate-y-0.5 transition-all">
                        Try Now
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/5 to-blue-50 p-8 flex items-center justify-center">
                  <div className="w-full max-w-md h-64 relative">
                    {/* Simulated Chat UI */}
                    <div className="absolute inset-0 rounded-xl bg-white shadow-md flex flex-col overflow-hidden border border-gray-100">
                      <div className="p-4 bg-primary text-white flex items-center">
                        <span className="h-3 w-3 bg-white rounded-full mr-2"></span>
                        <span className="text-sm font-medium">Alice Assistant</span>
                      </div>
                      <div className="flex-1 p-4 flex flex-col space-y-3">
                        <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 self-start max-w-xs">
                          Can I spend $50 on dinner tonight?
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3 text-sm text-gray-800 self-end max-w-xs">
                          Yes, you can spend $50. Your balance will be $350. Your next bill is in 5 days.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Clean and Minimal */}
      <footer className="bg-white border-t border-gray-100 mt-auto py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center mb-4">
            <PulseLogo size="md" />
          </div>
          <p className="text-gray-500 text-sm">{t('copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
