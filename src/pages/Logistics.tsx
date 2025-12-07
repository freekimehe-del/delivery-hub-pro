import { Link } from "react-router-dom";

const Logistics = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Logistics</h1>
      <p className="text-sm text-muted-foreground mb-4">Shipment creation and management hub.</p>
      <div className="space-x-2">
        <Link to="/logistics/shipments" className="btn btn-primary">
          View Shipments
        </Link>
        <Link to="/logistics/create" className="btn btn-outline">
          Create Shipment
        </Link>
      </div>
    </div>
  );
};

export default Logistics;
