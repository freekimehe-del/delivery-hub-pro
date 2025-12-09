/**
 * Centralized Mock Database
 * Acts as the single source of truth for the application.
 */

// Initial State
const db = {
  fleet: {
    vehicles: [
      { id: 'V-001', plate: 'KHI-1234', status: 'available', location: 'Port of Karachi', fuel_level: 80 },
      { id: 'V-002', plate: 'LHR-5678', status: 'in_transit', location: 'Sukkur', fuel_level: 45 },
      { id: 'V-003', plate: 'ISL-9012', status: 'maintenance', location: 'Islamabad', fuel_level: 10 },
    ],
    drivers: [
      { id: 'D-001', name: 'Ahmed Khan', status: 'active', assigned_vehicle: 'V-002' },
      { id: 'D-002', name: 'Bilal Ahmed', status: 'available', assigned_vehicle: null },
    ]
  },
  logistics: {
    shipments: {},
    manifests: {},
    containers: [
      { id: 'CONT-001', type: '20ft', status: 'available', location: 'Port of Karachi', condition: 'good' },
      { id: 'CONT-002', type: '40ft', status: 'in_use', location: 'Lahore Depot', condition: 'good' },
    ],
    pods: {}
  },
  orders: {
    active: [],
    history: [] // Completed orders
  },
  customers: {
    profiles: [
      { id: 'CUST-001', name: 'Global Traders', balance: 0 },
      { id: 'CUST-002', name: 'Tech Imports Ltd', balance: 50000 },
    ],
    invoices: []
  },
  customs: {
    consignments: {},
    declarations: [],
    duties: [],
    bonds: [],
    documents: []
  }
};

// Data Access Methods (Repository Pattern Mock)

// --- Fleet ---
const getAvailableVehicles = () => db.fleet.vehicles.filter(v => v.status === 'available');
const assignVehicle = (vehicleId, orderId) => {
  const v = db.fleet.vehicles.find(v => v.id === vehicleId);
  if (v) {
    v.status = 'in_transit';
    v.current_order = orderId;
    return true;
  }
  return false;
};

// --- Logistics ---
const addShipment = (shipment) => {
  db.logistics.shipments[shipment.id] = shipment;
  return shipment;
};
const addManifest = (manifest) => {
  db.logistics.manifests[manifest.id] = manifest;
  return manifest;
};
const addPOD = (pod) => {
  db.logistics.pods[pod.id] = pod;
  return pod;
};

// --- Orders ---
const createOrder = (order) => {
  db.orders.active.push(order);
  return order;
};

// --- Customers ---
const createInvoice = (invoice) => {
  db.customers.invoices.push(invoice);
  // Update customer balance (mock)
  const customer = db.customers.profiles.find(c => c.id === invoice.customer_id);
  if (customer) {
    customer.balance += invoice.amount;
  }
  return invoice;
};

// --- Customs ---
const addDeclaration = (decl) => {
  db.customs.declarations.push(decl);
  return decl;
};
const updateDeclarationStatus = (id, status) => {
  const d = db.customs.declarations.find(x => x.id === id);
  if (d) d.status = status;
  return d;
};
const addDuty = (duty) => {
  db.customs.duties.push(duty);
  return duty;
};
const addBond = (bond) => {
  db.customs.bonds.push(bond);
  return bond;
};

module.exports = {
  db,
  getAvailableVehicles,
  assignVehicle,
  addShipment,
  addManifest,
  addPOD,
  createOrder,
  createInvoice,
  addDeclaration,
  updateDeclarationStatus,
  addDuty,
  addBond
};
