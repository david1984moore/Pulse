import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Calendar, MessageSquare, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import LanguageToggle from "@/components/ui/language-toggle";
import { useState } from "react";

export default function LandingPage() {
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation - Sleek and modern */}
      <nav className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <span className="font-bold text-2xl cursor-pointer bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">pulse</span>
                </Link>
              </div>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <LanguageToggle />
              
              {user ? (
                <>
                  <Link href="/dashboard">
                    <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">{t('dashboard')}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => logoutMutation.mutate()}
                    className="text-gray-600 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">{t('login')}</span>
                  </Link>
                  <Link href="/signup">
                    <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">{t('signup')}</span>
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile menu, show/hide based on menu state */}
          {mobileMenuOpen && (
            <div className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <div className="block px-3 py-2 rounded-md">
                  <LanguageToggle />
                </div>
                
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 cursor-pointer">
                        {t('dashboard')}
                      </span>
                    </Link>
                    <button
                      onClick={() => logoutMutation.mutate()}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
                    >
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 cursor-pointer">
                        {t('login')}
                      </span>
                    </Link>
                    <Link href="/signup">
                      <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 cursor-pointer">
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

      {/* Hero Section - Modern and Sleek */}
      <div className="relative bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-primary/10"></div>
        <div className="relative max-w-7xl mx-auto pt-20 pb-32 px-4 sm:pt-24 sm:pb-40 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center mb-8">
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-purple-600 rounded-full mr-4"></div>
              <span className="text-primary font-medium">pulse finance</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl mb-6">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 max-w-3xl text-xl text-gray-600 leading-relaxed">
              {t('heroDescription')}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {!user ? (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                      {t('getStarted')}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                      {t('signIn')}
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                    {t('goToDashboard')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-full h-40 md:w-1/2 md:h-full overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl"></div>
          <div className="absolute top-20 right-20 w-40 h-40 bg-purple-600/10 rounded-full filter blur-2xl"></div>
        </div>
      </div>

      {/* Features Section - Clean and Modern */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center items-center mb-4">
              <div className="h-1 w-12 bg-primary rounded-full mr-2"></div>
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">{t('featuresTitle')}</h2>
              <div className="h-1 w-12 bg-primary rounded-full ml-2"></div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">{t('featuresTagline')}</p>
            <p className="mt-5 text-lg text-gray-600">{t('featuresDescription')}</p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group">
                <div className="flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
                  <div className="p-6 flex-grow">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <CircleDollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('incomeManagementTitle')}</h3>
                    <p className="text-gray-600">{t('incomeManagementDescription')}</p>
                  </div>
                  <div className="h-1 w-full bg-gradient-to-r from-primary/20 to-primary/40"></div>
                </div>
              </div>

              <div className="group">
                <div className="flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
                  <div className="p-6 flex-grow">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('calendarViewTitle')}</h3>
                    <p className="text-gray-600">{t('calendarViewDescription')}</p>
                  </div>
                  <div className="h-1 w-full bg-gradient-to-r from-primary/30 to-primary/50"></div>
                </div>
              </div>

              <div className="group">
                <div className="flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
                  <div className="p-6 flex-grow">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('spendingAssistantTitle')}</h3>
                    <p className="text-gray-600">{t('spendingAssistantDescription')}</p>
                  </div>
                  <div className="h-1 w-full bg-gradient-to-r from-primary/20 to-primary/40"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Simple and Sleek */}
      <footer className="bg-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center mb-6">
            <span className="font-bold text-xl mr-2 bg-gradient-to-r from-primary/90 to-purple-500/90 bg-clip-text text-transparent">pulse</span>
            <span className="text-gray-400 text-sm">finance</span>
          </div>
          <p className="text-gray-400 text-sm">{t('copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
