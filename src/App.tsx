import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          {/* Animated Background */}
          <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
          </div>

          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <SignedIn>
                      <Index />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
