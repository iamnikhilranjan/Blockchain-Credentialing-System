import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import { BlockchainProvider } from "@/contexts/BlockchainContext";
import Index from "./pages/Index";
import Verify from "./pages/Verify";
import Certificates from "./pages/Certificates";
import Issue from "./pages/Issue";
import Roles from "./pages/Roles";
import Institute from "./pages/Institute";
import DigiLocker from "./pages/DigiLocker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  // <ThirdwebProvider>
  //   <BlockchainProvider>
  //     <div className="p-10 text-blue-500">App Minimal - Blockchain Active</div>
  //   </BlockchainProvider>
  // </ThirdwebProvider>
  <QueryClientProvider client={queryClient}>
    <ThirdwebProvider>
      <BlockchainProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/issue" element={<Issue />} />
              <Route path="/institute" element={<Institute />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/digilocker" element={<DigiLocker />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BlockchainProvider>
    </ThirdwebProvider>
  </QueryClientProvider>
);

export default App;
