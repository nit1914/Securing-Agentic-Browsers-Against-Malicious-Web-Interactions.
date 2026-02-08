import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import ThreatLog from "./pages/ThreatLog";
import ActionMediator from "./pages/ActionMediator";
import DOMAnalyzer from "./pages/DOMAnalyzer";
import SecureBrowser from "./pages/SecureBrowser";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browser" element={<SecureBrowser />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/threats" element={<ThreatLog />} />
            <Route path="/mediator" element={<ActionMediator />} />
            <Route path="/dom-analyzer" element={<DOMAnalyzer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
