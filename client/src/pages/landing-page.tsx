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
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <span className="text-primary font-bold text-2xl cursor-pointer">pulse</span>
                </Link>
              </div>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <LanguageToggle />
              
              {user ? (
                <>
                  <Link href="/dashboard">
                    <span className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">{t('dashboard')}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => logoutMutation.mutate()}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <span className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">{t('login')}</span>
                  </Link>
                  <Link href="/signup">
                    <span className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">{t('signup')}</span>
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

      {/* Hero Section */}
      <div className="relative bg-primary-700">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 opacity-75"></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Take control of your finances</h1>
          <p className="mt-6 max-w-3xl text-xl text-gray-100">Track your money, manage bills, and know exactly what you can spend with Pulse - your personal financial assistant.</p>
          <div className="mt-10">
            {!user ? (
              <>
                <Link href="/signup">
                  <Button size="lg" className="mr-4 bg-white text-primary-700 hover:bg-gray-50">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-primary-600 hover:text-white font-medium bg-primary-600/20">
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-50">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Keep your finger on the pulse of your money</p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Simple tools that help you track income, manage bills, and make smarter spending decisions.</p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                        <CircleDollarSign className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Income & Bill Management</h3>
                    <p className="mt-5 text-base text-gray-500">Easily track your income sources and upcoming bills. Get a clear picture of your financial obligations.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Bill Calendar</h3>
                    <p className="mt-5 text-base text-gray-500">See your bills visually on a calendar. Never miss a payment with clear due date indicators.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Spending Assistant</h3>
                    <p className="mt-5 text-base text-gray-500">Ask our chatbot if you can afford to make a purchase. Get smart advice based on your current financial situation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <p className="text-gray-400 text-sm">© 2025 pulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
