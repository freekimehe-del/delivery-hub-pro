import { Route, Routes } from "react-router-dom";
import FinanceDashboard from "./finance/FinanceDashboard";
import Invoices from "./finance/ar/Invoices";
import CreateInvoice from './finance/ar/CreateInvoice';
import Bills from './finance/ap/Bills';
import CreateBill from "./finance/ap/CreateBill";
import DriverSettlements from './finance/logistics/DriverSettlements';
import FleetCosting from './finance/logistics/FleetCosting';
import CostEstimator from './finance/logistics/CostEstimator';
import FinancialReports from "./finance/reports/FinancialReports";
import NotFound from "./NotFound";

const Finance = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<FinanceDashboard />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="invoices/create" element={<CreateInvoice />} />
      <Route path="bills" element={<Bills />} />
      <Route path="bills/new" element={<CreateBill />} />
      <Route path="settlements" element={<DriverSettlements />} />
      <Route path="fleet-costs" element={<FleetCosting />} />
      <Route path="cost-estimator" element={<CostEstimator />} />
      <Route path="reports" element={<FinancialReports />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Finance;