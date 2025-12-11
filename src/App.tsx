import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CommandCenter from "./pages/CommandCenter";
import Fleet from "./pages/Fleet";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import ApiDocs from "./pages/ApiDocs";
import Settings from "./pages/Settings";
import Customs, { CustomsContent } from "./pages/Customs";
import CustomsWizard from "./pages/customs/CustomsWizard";
import CustomsLayout from "./pages/customs/CustomsLayout";
import GoodsDeclaration from "./pages/customs/GoodsDeclaration";
import TradeFinanceDashboard from "./pages/customs/TradeFinanceDashboard";
import CreateLC from "./pages/customs/CreateLC";
import ComplianceDashboard from "./pages/customs/ComplianceDashboard";
import ExportGatePass from "./pages/customs/ExportGatePass";
import Roles from "./pages/settings/Roles";
import NotFound from "./pages/NotFound";
import Logistics from "./pages/Logistics";
import CreateShipment from "./pages/logistics/CreateShipment";
import Shipments from "./pages/logistics/Shipments";
import Bookings from "./pages/logistics/Bookings";
import CreateBooking from "./pages/logistics/CreateBooking";
import BookingDetails from "./pages/logistics/BookingDetails";
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
import NewClearanceJob from "./pages/clearance/NewClearanceJob";
import HSCodes from "./pages/customs/HSCodes";
import DutyCalculator from "./pages/customs/DutyCalculator";
import ClearanceDashboard from "./pages/clearance/ClearanceDashboard";
import GDFiling from "./pages/clearance/GDFiling";
import LandedCost from "./pages/finance/logistics/LandedCost";
import WarehouseDashboard from "./pages/warehousing/Dashboard"; // Keeping existing as legacy or sub-view?
import InventoryDashboard from "./pages/warehousing/InventoryDashboard";
import StockMovement from "./pages/warehousing/StockMovement";
import WarehouseInventory from "./pages/warehousing/Inventory";
import WarehouseReports from "./pages/warehousing/Reports";
import ImportDashboard from "./pages/imports/ImportDashboard";
import Indents from "./pages/imports/Indents";
import ExportDashboard from "./pages/exports/ExportDashboard";
import ExportBookings from "./pages/exports/Bookings";
import TrackingDashboard from "./pages/logistics/tracking/TrackingDashboard";
import TrackingView from "./pages/logistics/tracking/TrackingView";
import { DollarSign, PieChart } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/command-center" element={<CommandCenter />} />
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
          <Route path="/logistics/bookings" element={<Bookings />} />
          <Route path="/logistics/bookings/create" element={<CreateBooking />} />
          <Route path="/logistics/bookings/:id" element={<BookingDetails />} />
          <Route path="/logistics/bookings/:id/edit" element={<CreateBooking />} />
          <Route path="/logistics/manifests" element={<Manifests />} />
          <Route path="/logistics/manifests/create" element={<CreateManifest />} />
          <Route path="/logistics/manifests/:id" element={<CreateManifest />} />
          <Route path="/logistics/manifests/:id/edit" element={<CreateManifest />} />
          <Route path="/logistics/pod" element={<POD />} />
          <Route path="/logistics/containers" element={<Containers />} />
          <Route path="/logistics/ai-optimizer" element={<AIOptimizer />} />

          <Route path="/logistics/ai-optimizer" element={<AIOptimizer />} />
          <Route path="/logistics/tracking" element={<TrackingDashboard />} />
          <Route path="/logistics/tracking/:id" element={<TrackingView />} />

          <Route path="/logistics/customs" element={<CustomsLayout />}>
            <Route index element={<CustomsContent />} />
            <Route path="new-gd" element={<GoodsDeclaration />} />
            <Route path="calculator" element={<DutyCalculator />} />
            <Route path="trade-finance" element={<TradeFinanceDashboard />} />
            <Route path="trade-finance/new-lc" element={<CreateLC />} />
            <Route path="compliance" element={<ComplianceDashboard />} />
            <Route path="gate-pass" element={<ExportGatePass />} />
          </Route>

          <Route path="/clearance" element={<ClearanceDashboard />} />
          <Route path="/clearance/new" element={<NewClearanceJob />} />
          <Route path="/clearance/:jobId/file-gd" element={<GDFiling />} />
          <Route path="/customs/calculator" element={<DutyCalculator />} />
          <Route path="/customs/filing" element={<CustomsWizard />} />
          <Route path="/customs/consignments" element={<Customs />} />

          <Route path="/customs/hs-codes" element={<HSCodes />} />
          <Route path="/customs/auctions" element={<Customs />} />

          <Route path="/warehousing" element={<InventoryDashboard />} />
          <Route path="/warehousing/operations" element={<WarehouseDashboard />} />
          <Route path="/warehousing/inventory" element={<WarehouseInventory />} />
          <Route path="/warehousing/movements" element={<StockMovement />} />
          <Route path="/warehousing/reports" element={<WarehouseReports />} />

          <Route path="/imports" element={<ImportDashboard />} />
          <Route path="/imports/indents" element={<Indents />} />
          <Route path="/exports" element={<ExportDashboard />} />
          <Route path="/exports/bookings" element={<ExportBookings />} />

          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/finance/dashboard" element={<FinanceDashboard />} />
          <Route path="/finance/invoices" element={<Invoices />} />
          <Route path="/finance/invoices/create" element={<CreateInvoice />} />
          <Route path="/finance/bills" element={<Bills />} />
          <Route path="/finance/bills/new" element={<CreateBill />} />
          <Route path="/finance/settlements" element={<DriverSettlements />} />
          <Route path="/finance/fleet-costs" element={<FleetCosting />} />
          <Route path="/finance/cost-estimator" element={<CostEstimator />} />
          <Route path="/finance/landed-cost" element={<LandedCost />} />
          <Route path="/finance/reports" element={<FinancialReports />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="/api/docs" element={<ApiDocs />} />
          <Route path="/api/keys" element={<ApiDocs />} />
          <Route path="/api/webhooks" element={<ApiDocs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/company" element={<Settings />} />
          <Route path="/settings/notifications" element={<Settings />} />
          <Route path="/settings/areas" element={<Settings />} />
          <Route path="/settings/roles" element={<Roles />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
