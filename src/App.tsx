
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import Sessions from "./pages/Sessions";
import Reports from "./pages/Reports";
import ActiveGame from "./pages/ActiveGame";
import Invoice from "./pages/Invoice";
import Admin from "./pages/Admin";
import Canteen from "./pages/Canteen";
import NotFound from "./pages/NotFound";

// Components
import Navbar from "./components/Navbar";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";

// Route guard for authenticated routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Route guard for admin routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (user.role === 'super_admin' || user.role === 'sub_admin') ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/" replace />
  );
};

// Route guard for reports (admin + manager access)
const ReportsRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (user.role === 'super_admin' || user.role === 'sub_admin' || user.role === 'manager') ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/" replace />
  );
};

// Separate AppRoutes component that uses authentication hooks
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/tables" element={<PrivateRoute><Tables /></PrivateRoute>} />
      <Route path="/sessions" element={<PrivateRoute><Sessions /></PrivateRoute>} />
      <Route path="/game/:gameId" element={<PrivateRoute><ActiveGame /></PrivateRoute>} />
      <Route path="/invoice/:invoiceId" element={<PrivateRoute><Invoice /></PrivateRoute>} />
      <Route path="/canteen" element={<PrivateRoute><Canteen /></PrivateRoute>} />
      
      {/* Reports route (admin + manager access) */}
      <Route path="/reports" element={<ReportsRoute><Reports /></ReportsRoute>} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <Toaster />
              <Sonner />
              <div className="min-h-screen bg-gray-50">
                <AppRoutes />
              </div>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
