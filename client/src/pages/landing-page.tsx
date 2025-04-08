import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Calendar, MessageSquare, Menu, X, Check, SendHorizontal, ChevronLeft, ChevronRight, Home, Wifi, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import LanguageToggle from "@/components/ui/language-toggle";
import { useState } from "react";
import { PulseLogo } from "@/components/ui/pulse-logo";
import CalendarMockup from "@/components/mockups/CalendarMockup";
import AliceMockup from "@/components/mockups/AliceMockup";

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
            
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <LanguageToggle />
              
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">{t('dashboard')}</Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => logoutMutation.mutate()}
                  >
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth?mode=login">
                    <Button variant="ghost">{t('login')}</Button>
                  </Link>
                  <Link href="/auth?mode=register">
                    <Button>{t('signup')}</Button>
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex items-center md:hidden">
              <button
                className="bg-white p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-40 flex">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <PulseLogo size="md" />
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    <LanguageToggle />
                    
                    {user ? (
                      <>
                        <Link href="/dashboard">
                          <Button variant="ghost" className="w-full justify-start">
                            {t('dashboard')}
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => logoutMutation.mutate()}
                        >
                          {t('logout')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth?mode=login">
                          <Button variant="ghost" className="w-full justify-start">
                            {t('login')}
                          </Button>
                        </Link>
                        <Link href="/auth?mode=register">
                          <Button className="w-full justify-start">
                            {t('signup')}
                          </Button>
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Hero section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>
            
            <main className="pt-10 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">{t('heroTitle')}</span>{' '}
                  <span className="block text-primary xl:inline">{t('welcome')}</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {t('heroDescription')}
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {user ? (
                    <div className="rounded-md shadow">
                      <Link href="/dashboard">
                        <Button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
                          {t('goToDashboard')}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md shadow">
                        <Link href="/auth?mode=register">
                          <Button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
                            {t('getStarted')}
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Link href="/auth?mode=login">
                          <Button variant="outline" className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10">
                            {t('signIn')}
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-primary/10 sm:h-72 md:h-96 lg:w-full lg:h-full p-4 lg:p-8 flex items-center justify-center">
            <div className="max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-1 bg-gradient-to-r from-primary/20 to-primary/5">
                <div className="h-2 w-8 bg-primary/20 rounded-full mx-auto"></div>
              </div>
              <div className="p-4 flex flex-col space-y-1">
                <div className="bg-primary/5 h-6 w-36 rounded-md"></div>
                <div className="bg-primary/10 h-10 w-full rounded-md mt-2"></div>
                <div className="flex space-x-2 mt-3">
                  <div className="bg-emerald-100 h-8 w-24 rounded-md"></div>
                  <div className="bg-red-100 h-8 w-24 rounded-md"></div>
                </div>
                <div className="bg-gray-100 h-24 w-full rounded-md mt-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section - Improved spacing and layout */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-10">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">{t('featuresTagline')}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t('featuresTitle')}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              {t('featuresDescription')}
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-3">
              {/* Income Management Feature */}
              <div className="relative">
                <div className="absolute -left-4 -top-4 w-16 h-16 bg-primary/10 rounded-full"></div>
                <div className="relative rounded-2xl border border-gray-100 bg-white shadow-lg p-6 overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mb-10"></div>
                  <div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-white mb-5">
                      <CircleDollarSign className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t('incomeManagementTitle')}</h3>
                    <p className="text-base text-gray-600">{t('incomeManagementDescription')}</p>
                  </div>
                  <div className="mt-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center p-2 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100">
                      <span className="text-sm font-semibold text-gray-700 flex items-center">
                        <span className="w-6 h-6 bg-emerald-500 rounded-full mr-2 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                        Income
                      </span>
                      <span className="text-sm font-bold text-emerald-600">+$2,400</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Calendar View Feature */}
              <div className="relative">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full"></div>
                <div className="relative rounded-2xl border border-gray-100 bg-white shadow-lg p-6 overflow-hidden">
                  <div className="absolute left-0 bottom-0 w-20 h-20 bg-blue-50 rounded-full -ml-10 -mb-10"></div>
                  <div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-white mb-5">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t('calendarViewTitle')}</h3>
                    <p className="text-base text-gray-600">{t('calendarViewDescription')}</p>
                  </div>
                  
                  {/* Calendar Preview - Using dedicated mockup component */}
                  <div className="mt-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm mb-4">
                      {/* Header text */}
                      <p className="text-sm text-gray-600 mb-2">
                        See all your bills on a monthly calendar to plan ahead and never miss a payment.
                      </p>
                    </div>
                    
                    {/* Using our dedicated calendar mockup component */}
                    <CalendarMockup />
                  </div>
                </div>
              </div>
              
              {/* AI Assistant Feature */}
              <div className="relative">
                <div className="absolute -left-4 -top-4 w-16 h-16 bg-purple-50 rounded-full"></div>
                <div className="relative rounded-2xl border border-gray-100 bg-white shadow-lg p-6 overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mb-10"></div>
                  <div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-white mb-5">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t('spendingAssistantTitle')}</h3>
                    <p className="text-base text-gray-600">{t('spendingAssistantDescription')}</p>
                  </div>
                  
                  {/* Alice Preview - Using dedicated mockup component */}
                  <div className="mt-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm mb-4">
                      {/* Info text */}
                      <p className="text-sm text-gray-600 mb-2">
                        Ask our chatbot if you can afford to make a purchase. Get smart advice based on your current financial situation.
                      </p>
                    </div>
                    
                    {/* Using our dedicated Alice mockup component */}
                    <AliceMockup />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Preview Section with improved spacing */}
      <div className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Track Your Finances with Elegance
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Powerful tools that give you complete visibility and control over your financial life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-4">
              <div className="rounded-xl bg-white shadow-md p-6 border border-gray-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 relative z-10">Financial Dashboard</h3>
                <p className="text-gray-600 mb-6 relative z-10">
                  See your complete financial picture at a glance with our intuitive dashboard.
                </p>
                <ul className="space-y-3 relative z-10">
                  <li className="flex items-center">
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary/10 text-primary mr-3">
                      <Check className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">Visual income and expense tracking</span>
                  </li>
                  <li className="flex items-center">
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary/10 text-primary mr-3">
                      <Check className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">Monthly bill calendar</span>
                  </li>
                  <li className="flex items-center">
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary/10 text-primary mr-3">
                      <Check className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">Customizable spending categories</span>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-xl bg-white shadow-md p-6 border border-gray-100 relative overflow-hidden">
                <div className="absolute left-0 bottom-0 w-32 h-32 bg-blue-50 rounded-full -ml-16 -mb-16"></div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 relative z-10">AI-Powered Insights</h3>
                <p className="text-gray-600 mb-6 relative z-10">
                  Alice, your financial assistant, provides real-time spending recommendations.
                </p>
                <ul className="space-y-3 relative z-10">
                  <li className="flex items-center">
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary/10 text-primary mr-3">
                      <Check className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">Smart spending recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary/10 text-primary mr-3">
                      <Check className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">Instant answers to financial questions</span>
                  </li>
                  <li className="flex items-center">
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary/10 text-primary mr-3">
                      <Check className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">Personalized financial advice</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <div className="relative h-96 lg:h-auto overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                {/* Dashboard mockup - Updated to match actual dashboard */}
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-white shadow-lg border border-gray-200">
                  {/* Removed header as requested */}
                  
                  {/* Financial Summary - Matching dashboard's IncomeBills component */}
                  <div className="p-4">
                    <div className="bg-gradient-to-b from-white to-slate-50 p-3 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden mb-3">
                      <div className="absolute right-0 top-0 w-16 h-16 bg-blue-50 rounded-full -mr-8 -mt-8 opacity-60"></div>
                      <div className="absolute bottom-0 left-0 w-10 h-10 bg-emerald-50 rounded-full -ml-4 -mb-4 opacity-60"></div>
                      
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center relative z-10">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                        Financial Summary
                      </h3>
                      
                      <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center p-2 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100 shadow-md">
                          <span className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full mr-2 flex items-center justify-center shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                            Monthly Income
                          </span>
                          <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                            +$2,400.00
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-100 shadow-md">
                          <span className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-500 rounded-full mr-2 flex items-center justify-center shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                            Monthly Bills
                          </span>
                          <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                            -$1,600.00
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-gradient-to-r from-primary/10 to-white rounded-lg border border-primary/20 shadow-md">
                          <span className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-6 h-6 bg-primary rounded-full mr-2 flex items-center justify-center shadow-sm">
                              <CircleDollarSign className="h-3 w-3 text-white" />
                            </span>
                            Available to Spend
                          </span>
                          <span className="text-sm font-bold text-white bg-primary px-2 py-1 rounded-lg">
                            $800.00
                          </span>
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
      
      {/* Footer - Improved spacing */}
      <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-100 mt-auto py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <PulseLogo size="md" />
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                Your personal finance tracker with intelligent insights. Manage your money smarter.
              </p>
              <p className="text-gray-500 text-sm">{t('copyright')}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/dashboard">
                    <span className="text-gray-600 hover:text-primary transition-colors cursor-pointer">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="/auth?mode=login">
                    <span className="text-gray-600 hover:text-primary transition-colors cursor-pointer">Login</span>
                  </Link>
                </li>
                <li>
                  <Link href="/auth?mode=register">
                    <span className="text-gray-600 hover:text-primary transition-colors cursor-pointer">Sign Up</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Features</h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-gray-600">Income Tracking</span>
                </li>
                <li>
                  <span className="text-gray-600">Bill Management</span>
                </li>
                <li>
                  <span className="text-gray-600">AI Spending Assistant</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
