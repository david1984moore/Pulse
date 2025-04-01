import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Calendar, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const { user, logoutMutation } = useAuth();

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
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <Link href="/">
                <span className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Home</span>
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <span className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Dashboard</span>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => logoutMutation.mutate()}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <span className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Login</span>
                  </Link>
                  <Link href="/signup">
                    <span className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-primary-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900 opacity-90"></div>
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
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-primary-600 hover:text-white">
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
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Everything you need to manage your money</p>
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
