import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Fleet from "./pages/Fleet";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import ApiDocs from "./pages/ApiDocs";
import Settings from "./pages/Settings";
import Customs from "./pages/Customs";
import CustomsWizard from "./pages/customs/CustomsWizard";
import NotFound from "./pages/NotFound";
import Logistics from "./pages/Logistics";
import CreateShipment from "./pages/logistics/CreateShipment";
import Shipments from "./pages/logistics/Shipments";
import Manifests from "./pages/logistics/Manifests";
import CreateManifest from "./pages/logistics/CreateManifest";
import POD from "./pages/logistics/POD";
import Containers from "./pages/logistics/Containers";
import AIOptimizer from "./pages/logistics/AIOptimizer";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import Invoices from "./pages/finance/ar/Invoices";
import CreateInvoice from './pages/finance/ar/CreateInvoice';
import DriverSettlements from './pages/finance/logistics/DriverSettlements';
import FleetCosting from './pages/finance/logistics/FleetCosting';
import CostEstimator from './pages/finance/logistics/CostEstimator';
import Bills from './pages/finance/ap/Bills';
import CreateBill from "./pages/finance/ap/CreateBill";
import FinancialReports from "./pages/finance/reports/FinancialReports";

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
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/logistics/shipments" element={<Shipments />} />
          <Route path="/logistics/create" element={<CreateShipment />} />
          <Route path="/logistics/manifests" element={<Manifests />} />
          <Route path="/logistics/manifests/create" element={<CreateManifest />} />
          <Route path="/logistics/pod" element={<POD />} />
          <Route path="/logistics/containers" element={<Containers />} />
          <Route path="/logistics/ai-optimizer" element={<AIOptimizer />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/customs" element={<Customs />} />
          <Route path="/customs/filing" element={<CustomsWizard />} />
          <Route path="/customs/consignments" element={<Customs />} />
          <Route path="/customs/warehouses" element={<Customs />} />
          <Route path="/customs/hs-codes" element={<Customs />} />
          <Route path="/customs/auctions" element={<Customs />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/finance/dashboard" element={<FinanceDashboard />} />
          <Route path="/finance/invoices" element={<Invoices />} />
          <Route path="/finance/invoices/new" element={<CreateInvoice />} />
          <Route path="/finance/bills" element={<Bills />} />
          <Route path="/finance/bills/new" element={<CreateBill />} />
          <Route path="/finance/settlements" element={<DriverSettlements />} />
          <Route path="/finance/fleet-costs" element={<FleetCosting />} />
          <Route path="/finance/cost-estimator" element={<CostEstimator />} />
          <Route path="/finance/reports" element={<FinancialReports />} />
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
