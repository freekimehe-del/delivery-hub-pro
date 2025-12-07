import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Fleet from "./pages/Fleet";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Shipments from "./pages/Shipments";
import Analytics from "./pages/Analytics";
import ApiDocs from "./pages/ApiDocs";
import Settings from "./pages/Settings";
import Customs from "./pages/Customs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/fleet/vehicles" element={<Fleet />} />
          <Route path="/fleet/drivers" element={<Fleet />} />
          <Route path="/fleet/maintenance" element={<Fleet />} />
          <Route path="/fleet/fuel" element={<Fleet />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/dispatch" element={<Orders />} />
          <Route path="/orders/routes" element={<Orders />} />
          <Route path="/orders/pod" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/billing" element={<Customers />} />
          <Route path="/customers/invoices" element={<Customers />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/shipments/carriers" element={<Shipments />} />
          <Route path="/shipments/routes" element={<Shipments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/customs" element={<Customs />} />
          <Route path="/customs/consignments" element={<Customs />} />
          <Route path="/customs/warehouses" element={<Customs />} />
          <Route path="/customs/hs-codes" element={<Customs />} />
          <Route path="/customs/auctions" element={<Customs />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="/api/docs" element={<ApiDocs />} />
          <Route path="/api/keys" element={<ApiDocs />} />
          <Route path="/api/webhooks" element={<ApiDocs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/company" element={<Settings />} />
          <Route path="/settings/notifications" element={<Settings />} />
          <Route path="/settings/areas" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
