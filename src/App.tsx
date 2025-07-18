
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
import ProtectedRoute from "./components/ProtectedRoute";
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
                      <Route path="/login" element={<Login />} />
                      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/tables" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
                      <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
                      <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                      <Route path="/canteen" element={<ProtectedRoute><Canteen /></ProtectedRoute>} />
                      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
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
