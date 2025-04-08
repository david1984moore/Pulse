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
                    <PulseLogo size="md" animated={true} />
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

      {/* Hero Section - Clean and Modern */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
        <div className="relative max-w-7xl mx-auto pt-16 pb-24 px-4 sm:pt-24 sm:pb-32 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center mb-6">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              <span className="text-gray-500 font-medium text-sm uppercase tracking-wider">pulse finance</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 sm:text-5xl lg:text-6xl mb-6 leading-tight">
              {t('heroTitle')}
            </h1>
            
            <p className="mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed">
              {t('heroDescription')}
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              {!user ? (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-md rounded-lg px-6">
                      {t('getStarted')}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-6"
                    >
                      {t('signIn')}
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-md rounded-lg px-6">
                    {t('goToDashboard')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Subtle background elements */}
        <div className="absolute bottom-0 right-0 w-full h-40 md:w-1/2 md:h-full overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-blue-50 rounded-full"></div>
          <div className="absolute top-1/2 right-1/2 w-32 h-32 bg-gray-50 rounded-full"></div>
        </div>
      </div>

      {/* Features Section - Modern and Refined */}
      <div className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center items-center mb-4">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('featuresTitle')}</h2>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-800 sm:text-4xl tracking-tight">{t('featuresTagline')}</p>
            <p className="mt-5 text-lg text-gray-600">{t('featuresDescription')}</p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Income Management Card */}
              <div className="group">
                <div className="flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-300 overflow-hidden border border-gray-200">
                  <div className="p-6 flex-grow">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors">
                      <CircleDollarSign className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('incomeManagementTitle')}</h3>
                    <p className="text-gray-600 text-sm">{t('incomeManagementDescription')}</p>
                  </div>
                  <div className="h-1 w-full bg-emerald-100"></div>
                </div>
              </div>

              {/* Calendar View Card */}
              <div className="group">
                <div className="flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-300 overflow-hidden border border-gray-200">
                  <div className="p-6 flex-grow">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('calendarViewTitle')}</h3>
                    <p className="text-gray-600 text-sm">{t('calendarViewDescription')}</p>
                  </div>
                  <div className="h-1 w-full bg-blue-100"></div>
                </div>
              </div>

              {/* Spending Assistant Card */}
              <div className="group">
                <div className="flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-300 overflow-hidden border border-gray-200">
                  <div className="p-6 flex-grow">
                    <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center mb-5 group-hover:bg-violet-100 transition-colors">
                      <MessageSquare className="h-5 w-5 text-violet-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('spendingAssistantTitle')}</h3>
                    <p className="text-gray-600 text-sm">{t('spendingAssistantDescription')}</p>
                  </div>
                  <div className="h-1 w-full bg-violet-100"></div>
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
            <PulseLogo size="md" animated={true} />
          </div>
          <p className="text-gray-500 text-sm">{t('copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
