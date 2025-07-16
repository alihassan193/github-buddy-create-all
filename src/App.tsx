
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ClubSessionProvider } from "./context/ClubSessionContext";
import MandatorySessionDialog from "./components/MandatorySessionDialog";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <ClubSessionProvider>
              <DataProvider>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      <Route path="/*" element={<Index />} />
                    </Routes>
                  </Suspense>
                  <MandatorySessionDialog />
                </div>
              </DataProvider>
            </ClubSessionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
