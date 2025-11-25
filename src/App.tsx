import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeadsList from "./pages/leads/LeadsList";
import CreateLead from "./pages/leads/CreateLead";
import ViewLead from "./pages/leads/ViewLead";
import EditLead from "./pages/leads/EditLead";
import QuotationsList from "./pages/quotations/QuotationsList";
import QuotationCreate from "./pages/quotations/QuotationCreate";
import EditQuotation from "./pages/quotations/EditQuotation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <LeadsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/create"
            element={
              <ProtectedRoute>
                <CreateLead />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/:id"
            element={
              <ProtectedRoute>
                <ViewLead />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/:id/edit"
            element={
              <ProtectedRoute>
                <EditLead />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <ProtectedRoute>
                <QuotationsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/create"
            element={
              <ProtectedRoute>
                <QuotationCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/:id/edit"
            element={
              <ProtectedRoute>
                <EditQuotation />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
