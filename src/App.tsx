
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ClubSessionProvider } from "./context/ClubSessionContext";
import MandatorySessionDialog from "./components/MandatorySessionDialog";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import Sessions from "./pages/Sessions";
import Invoices from "./pages/Invoices";
import Canteen from "./pages/Canteen";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

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
                  <Navbar />
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/tables" element={<Tables />} />
                      <Route path="/sessions" element={<Sessions />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/canteen" element={<Canteen />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/login" element={<Login />} />
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
