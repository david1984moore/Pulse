import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ECGDemoPage from "@/pages/ecg-demo-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { LanguageProvider } from "./hooks/use-language";
import { BillFormStateProvider } from "./hooks/use-bill-form-state";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/signup" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <Route path="/ecg-demo" component={ECGDemoPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <BillFormStateProvider>
            <Router />
            <Toaster />
          </BillFormStateProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
