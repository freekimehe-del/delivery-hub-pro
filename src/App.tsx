import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import UserManagement from "./pages/settings/UserManagement";

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
import GDDashboard from "./pages/customs/GDDashboard";
import GDForm from "./pages/customs/GDForm";
import TradeFinanceDashboard from "./pages/customs/TradeFinanceDashboard";
import BiltyGenerator from "./pages/logistics/BiltyGenerator";
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
import WarehouseDashboard from "./pages/warehousing/Dashboard";
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
import TripManagement from "./pages/fleet/TripManagement";
import TripPlanner from "./pages/fleet/TripPlanner";
import TripDetail from "./pages/fleet/TripDetail";
import TransitDashboard from "./pages/logistics/TransitDashboard";
import DndDashboard from "./pages/logistics/DndDashboard";
import FuelManagement from "./pages/fleet/FuelManagement";

// imports cleaned up
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/command-center" element={<CommandCenter />} />


              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/*" element={<Orders />} />

              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/*" element={<Customers />} />

              <Route path="/analytics" element={<Analytics />} />

              {/* Logistics Module */}
              <Route path="/logistics" element={<Logistics />} />
              <Route path="/logistics/shipments" element={<Shipments />} />
              <Route path="/logistics/create" element={<CreateShipment />} />
              <Route path="/logistics/bookings" element={<Bookings />} />
              <Route path="/logistics/bookings/*" element={<CreateBooking />} />
              <Route path="/logistics/manifests" element={<Manifests />} />
              <Route path="/logistics/manifests/*" element={<CreateManifest />} />
              <Route path="/logistics/pod" element={<POD />} />
              <Route path="/logistics/containers" element={<Containers />} />
              <Route path="/logistics/ai-optimizer" element={<AIOptimizer />} />
              <Route path="/logistics/tracking" element={<TrackingDashboard />} />
              <Route path="/logistics/tracking/:id" element={<TrackingView />} />
              <Route path="/logistics/transit" element={<TransitDashboard />} />
              <Route path="/logistics/dnd" element={<DndDashboard />} />
              <Route path="/logistics/bilty" element={<BiltyGenerator />} />

              {/* Customs Module */}
              <Route path="/logistics/customs" element={<CustomsLayout />}>
                <Route index element={<GDDashboard />} />
                <Route path="new-gd" element={<GDForm />} />
                <Route path="calculator" element={<DutyCalculator />} />
                <Route path="trade-finance" element={<TradeFinanceDashboard />} />
                <Route path="trade-finance/new-lc" element={<CreateLC />} />
                <Route path="compliance" element={<ComplianceDashboard />} />
                <Route path="gate-pass" element={<ExportGatePass />} />
                <Route path="dashboard" element={<GDDashboard />} />
                <Route path=":id" element={<GDForm />} /> {/* View/Edit Mode */}
              </Route>

              <Route path="/clearance" element={<ClearanceDashboard />} />
              <Route path="/clearance/*" element={<ClearanceDashboard />} />

              <Route path="/customs/calculator" element={<DutyCalculator />} />
              <Route path="/customs/*" element={<Customs />} />

              {/* Warehouse Dept */}
              <Route path="/warehousing" element={<InventoryDashboard />} />
              <Route path="/warehousing/inventory" element={<WarehouseInventory />} />
              <Route path="/warehousing/movements" element={<StockMovement />} />
              <Route path="/warehousing/operations" element={<WarehouseDashboard />} />
              <Route path="/warehousing/putaway" element={<PlaceholderPage />} />
              <Route path="/warehousing/picking" element={<PlaceholderPage />} />
              <Route path="/warehousing/shipping" element={<PlaceholderPage />} />
              <Route path="/warehousing/qc" element={<PlaceholderPage />} />
              <Route path="/warehousing/reports" element={<WarehouseReports />} />

              {/* Fleet & Transport Dept */}
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/fleet/vehicles" element={<Fleet />} />
              <Route path="/fleet/drivers" element={<Fleet />} />
              <Route path="/fleet/fuel" element={<Fleet />} />
              <Route path="/fleet/maintenance" element={<Fleet />} />

              {/* Trip Management */}
              <Route path="/fleet/trip-management" element={<TripManagement />} />
              <Route path="/fleet/trip-management/new" element={<TripPlanner />} />
              <Route path="/fleet/trip-management/:id" element={<TripDetail />} />

              {/* Operations Dept */}
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/*" element={<Orders />} />
              <Route path="/operations/dispatch" element={<Orders />} />
              <Route path="/operations/customers" element={<Customers />} />
              <Route path="/operations/vendors" element={<PlaceholderPage />} />
              <Route path="/operations/performance" element={<Analytics />} />

              {/* Customs & Compliance Dept */}
              <Route path="/logistics/manifests" element={<Manifests />} />
              <Route path="/customs/docs" element={<PlaceholderPage />} />
              <Route path="/logistics/customs" element={<CustomsLayout />}>
                <Route index element={<CustomsContent />} />
                <Route path="new-gd" element={<GoodsDeclaration />} />
                <Route path="calculator" element={<DutyCalculator />} />
                <Route path="trade-finance" element={<TradeFinanceDashboard />} />
                <Route path="trade-finance/new-lc" element={<CreateLC />} />
                <Route path="compliance" element={<ComplianceDashboard />} />
                <Route path="gate-pass" element={<ExportGatePass />} />
              </Route>
              <Route path="/customs/compliance" element={<PlaceholderPage />} />
              <Route path="/customs/reports" element={<PlaceholderPage />} />

              {/* Finance Dept */}
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/finance/dashboard" element={<FinanceDashboard />} />
              <Route path="/finance/invoices" element={<Invoices />} />
              <Route path="/finance/bills" element={<Bills />} />
              <Route path="/finance/payments" element={<PlaceholderPage />} />
              <Route path="/finance/expenses" element={<PlaceholderPage />} />
              <Route path="/finance/reports" element={<FinancialReports />} />
              <Route path="/finance/budget" element={<PlaceholderPage />} />

              {/* Customer Service Dept */}
              <Route path="/service/tracking" element={<TrackingDashboard />} />
              <Route path="/service/support" element={<PlaceholderPage />} />
              <Route path="/service/complaints" element={<PlaceholderPage />} />
              <Route path="/service/updates" element={<PlaceholderPage />} />
              <Route path="/service/portal" element={<PlaceholderPage />} />

              {/* Legacy / Compatibility Routes (Keep for now) */}
              <Route path="/imports" element={<ImportDashboard />} />
              <Route path="/imports/indents" element={<Indents />} />
              <Route path="/exports" element={<ExportDashboard />} />
              <Route path="/exports/bookings" element={<ExportBookings />} />

              {/* Finance Module */}
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/finance/*" element={<FinanceDashboard />} />
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
              <Route path="/api/*" element={<ApiDocs />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/*" element={<Settings />} />
              <Route path="/settings/users" element={<UserManagement />} />
              <Route path="/settings/roles" element={<Roles />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
