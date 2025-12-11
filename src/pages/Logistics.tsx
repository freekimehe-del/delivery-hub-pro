import { Routes, Route } from "react-router-dom";
import LogisticsDashboard from "./LogisticsDashboard";
import Shipments from "./logistics/Shipments";
import CreateShipment from "./logistics/CreateShipment";
import Manifests from "./logistics/Manifests";
import CreateManifest from "./logistics/CreateManifest";
import POD from "./logistics/POD";
import Containers from "./logistics/Containers";
import AIOptimizer from "./logistics/AIOptimizer";
import NotFound from "./NotFound";
 
const Logistics = () => {
  return (
    <Routes>
      <Route index element={<LogisticsDashboard />} />
      <Route path="shipments" element={<Shipments />} />
      <Route path="create" element={<CreateShipment />} />
      <Route path="manifests" element={<Manifests />} />
      <Route path="manifests/create" element={<CreateManifest />} />
      <Route path="pod" element={<POD />} />
      <Route path="containers" element={<Containers />} />
      <Route path="ai-optimizer" element={<AIOptimizer />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Logistics;
