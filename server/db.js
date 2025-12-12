/**
 * Centralized Mock Database
 * Acts as the single source of truth for the application.
 */

// Initial State
const db = {
  fleet: {
    vehicles: [
      { id: 'V-001', plate: 'KHI-1234', license_plate: 'KHI-1234', name: 'Freightliner M2', status: 'available', location: 'Port of Karachi', fuel_level: 80, make: 'Freightliner', model: 'M2 106', year: 2022 },
      { id: 'V-002', plate: 'LHR-5678', license_plate: 'LHR-5678', name: 'Isuzu NPR', status: 'maintenance', location: 'Sukkur', fuel_level: 45, make: 'Isuzu', model: 'NPR HD', year: 2021 },
      { id: 'V-003', plate: 'ISL-9012', license_plate: 'ISL-9012', name: 'Ford Transit', status: 'available', location: 'Islamabad', fuel_level: 10, make: 'Ford', model: 'Transit 350', year: 2023 },
    ],
    drivers: [
      { id: 'D-001', name: 'Ahmed Khan', status: 'active', assigned_vehicle: 'V-002' },
      { id: 'D-002', name: 'Bilal Ahmed', status: 'available', assigned_vehicle: null },
    ],
    routes: [
      {
        id: 'R-1001',
        name: 'Morning Delivery - North',
        vehicle_id: 'V-002',
        driver_id: 'D-001',
        status: 'in_transit',
        date: '2024-03-25',
        stops: [
          { order_id: 'ORD-001', address: 'Clifton Block 4', status: 'completed' },
          { order_id: 'ORD-002', address: 'DHA Phase 6', status: 'pending' }
        ]
      }
    ],
    // New Trip Management Module
    trips: [
      {
        id: 'TRP-001',
        trip_number: 'TRP-2024-001',
        vehicle_id: 'V-002',
        driver_id: 'D-001',
        origin_location: 'Port of Karachi',
        destination_location: 'Lahore Distribution Center',
        start_time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        status: 'in_transit',
        instructions: 'Fragile cargo, maintain steady speed.',
        total_distance_km: 1200,
        current_location_lat: 27.7131,
        current_location_lng: 68.8256, // Somewhere near Sukkur
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: 'TRP-002',
        trip_number: 'TRP-2024-002',
        vehicle_id: 'V-001',
        driver_id: 'D-002',
        origin_location: 'Islamabad Warehouse',
        destination_location: 'Rawalpindi Retail',
        start_time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
        status: 'planned',
        instructions: 'Morning delivery requested.',
        total_distance_km: 25,
        created_at: new Date().toISOString()
      },
      {
        id: 'TRP-003',
        trip_number: 'TRP-2024-003',
        vehicle_id: 'V-003',
        driver_id: 'D-001',
        origin_location: 'Quetta Depot',
        destination_location: 'Karachi Port',
        start_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        status: 'completed',
        instructions: 'Return empty containers.',
        total_distance_km: 680,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString()
      }
    ],
    tripStops: [
      { id: 'TS-001', trip_id: 'TRP-001', sequence_number: 1, location_name: 'Hyderabad Toll Plaza', stop_type: 'checkpoint', status: 'completed' },
      { id: 'TS-002', trip_id: 'TRP-001', sequence_number: 2, location_name: 'Moro Rest Area', stop_type: 'rest', status: 'pending' },
      { id: 'TS-003', trip_id: 'TRP-001', sequence_number: 3, location_name: 'Sukkur Bypass', stop_type: 'fuel', status: 'pending' }
    ],
    tripExpenses: [
      { id: 'EX-001', trip_id: 'TRP-001', expense_type: 'toll', amount: 500, description: 'M-9 Motorway Toll', created_at: new Date().toISOString() }
    ],
    fuelLogs: [
      {
        id: 'FL-001',
        vehicle_id: 'V-001',
        fueled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        quantity_gallons: 11.9, // approx 45L
        price_per_gallon: 1050, // approx
        total_cost: 12500,
        odometer_reading: 15400,
        mp: 12.5,
        mpg: 8.2, // calculated
        station_name: 'Shell Clifton',
        full_tank: true,
        fuel_type: 'diesel',
        trip_id: null
      },
      {
        id: 'FL-002',
        vehicle_id: 'V-002',
        fueled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        quantity_gallons: 15.8, // approx 60L
        price_per_gallon: 1063,
        total_cost: 16800,
        odometer_reading: 22100,
        mpg: 7.5,
        station_name: 'PSO Highway',
        full_tank: true,
        fuel_type: 'diesel',
        trip_id: 'TRP-001'
      }
    ],
    trackingLogs: [],
    maintenance: [
      {
        id: 'M-001',
        title: 'Oil Change & Filter Replacement',
        vehicle_id: 'V-002',
        description: 'Routine 5000km maintenance',
        maintenance_type: 'scheduled',
        status: 'completed',
        priority: 'medium',
        scheduled_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        total_cost: 150,
        labor_cost: 50,
        parts_cost: 100,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
      },
      {
        id: 'M-002',
        title: 'Brake Pad Inspection',
        vehicle_id: 'V-001',
        description: 'Driver reported squeaking noise',
        maintenance_type: 'inspection',
        status: 'in_progress',
        priority: 'high',
        scheduled_date: new Date().toISOString(),
        total_cost: 0,
        labor_cost: 0,
        parts_cost: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'M-003',
        title: 'Annual Certification',
        vehicle_id: 'V-003',
        description: 'Government fitness certificate renewal',
        maintenance_type: 'scheduled',
        status: 'scheduled',
        priority: 'critical',
        scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        total_cost: 500,
        created_at: new Date().toISOString()
      }
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
    active: [
      {
        id: 'ORD-2025-001',
        order_number: 'ORD-2025-001',
        customer_id: 'CUST-001',
        warehouse_id: 'WH-001',
        status: 'pending',
        payment_status: 'unpaid',
        shipping_address: { line1: '123 Business Park', city: 'Karachi', state: 'Sindh' },
        priority: 'normal',
        expected_delivery: new Date(Date.now() + 86400000 * 2).toISOString(),
        total_amount: 1250.00,
        marketing_source: 'Direct',
        created_at: new Date().toISOString(),
        items: [
          { sku: 'SKU-001', name: 'Wireless Mouse', quantity: 50, unit_price: 25.00, total_price: 1250.00 }
        ]
      },
      {
        id: 'ORD-2025-002',
        order_number: 'ORD-2025-002',
        customer_id: 'CUST-002',
        warehouse_id: 'WH-001',
        status: 'ready_for_dispatch',
        payment_status: 'paid',
        shipping_address: { line1: '456 Tech Lane', city: 'Lahore', state: 'Punjab' },
        priority: 'high',
        expected_delivery: new Date(Date.now() + 86400000).toISOString(),
        total_amount: 3000.00,
        marketing_source: 'Web',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        items: [
          { sku: 'SKU-002', name: 'Ergonomic Chair', quantity: 20, unit_price: 150.00, total_price: 3000.00 }
        ]
      },
      {
        id: 'ORD-2025-003',
        order_number: 'ORD-2025-003',
        customer_id: 'CUST-001',
        warehouse_id: 'WH-001',
        status: 'in_transit',
        payment_status: 'paid',
        shipping_address: { line1: '789 Trade Center', city: 'Islamabad', state: 'ICT' },
        priority: 'normal',
        expected_delivery: new Date().toISOString(),
        total_amount: 450.00,
        marketing_source: 'Sales',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        items: [
          { sku: 'SKU-003', name: 'Monitor Stand', quantity: 10, unit_price: 45.00, total_price: 450.00 }
        ]
      }
    ],
    history: [], // Completed orders
    logs: [
      { id: 'LOG-1', order_id: 'ORD-2025-003', previous_status: 'pending', new_status: 'confirmed', created_at: new Date(Date.now() - 86000000).toISOString() },
      { id: 'LOG-2', order_id: 'ORD-2025-003', previous_status: 'confirmed', new_status: 'processing', created_at: new Date(Date.now() - 85000000).toISOString() },
      { id: 'LOG-3', order_id: 'ORD-2025-003', previous_status: 'processing', new_status: 'dispatched', created_at: new Date(Date.now() - 40000000).toISOString() }
    ]
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
  },
  finance: {
    landed_costs: []
  },
  imports: {
    indents: []
  },
  exports: {
    bookings: []
  },
  // --- Inventory Management ---
  inventory: {
    items: [
      { id: 'SKU-001', name: 'Wireless Mouse', category: 'Electronics', safety_stock: 50, price: 25.00, weight: 0.2 },
      { id: 'SKU-002', name: 'Ergonomic Chair', category: 'Furniture', safety_stock: 10, price: 150.00, weight: 15.0 },
      { id: 'SKU-003', name: 'Monitor Stand', category: 'Furniture', safety_stock: 20, price: 45.00, weight: 2.5 },
      { id: 'SKU-004', name: 'USB-C Cable', category: 'Electronics', safety_stock: 100, price: 12.00, weight: 0.1 }
    ],
    // Detailed stock ledger
    stock: [
      {
        id: 'STK-001', sku: 'SKU-001', warehouse_id: 'WH-001',
        quantities: { available: 450, reserved: 20, damaged: 5 },
        locations: [{ zone: 'A', rack: 'R1', bin: 'B1', qty: 475 }]
      },
      {
        id: 'STK-002', sku: 'SKU-002', warehouse_id: 'WH-001',
        quantities: { available: 8, reserved: 2, damaged: 0 },
        locations: [{ zone: 'B', rack: 'R5', bin: 'Floor', qty: 10 }]
      }
    ],
    // Audit log
    movements: [
      { id: 'M-001', date: '2024-03-20T10:00:00Z', type: 'RECEIPT', sku: 'SKU-001', qty: 500, ref: 'PO-1001', warehouse_id: 'WH-001' },
      { id: 'M-002', date: '2024-03-21T14:30:00Z', type: 'PICK', sku: 'SKU-001', qty: -25, ref: 'ORD-5501', warehouse_id: 'WH-001' }
    ]
  },
  // User Management & RBAC
  users: [
    {
      id: "u1",
      username: "admin",
      password: "admin123",
      role: "super_admin",
      name: "System Administrator",
      email: "admin@deliveryhub.pro",
      permissions: { all: true }
    },
    {
      id: "u2",
      username: "fleet",
      password: "fleet123",
      role: "fleet_manager",
      name: "Alex Fleet",
      email: "fleet@deliveryhub.pro",
      permissions: { fleet: ["create", "read", "update", "delete"], logistics: ["read"], orders: ["read"] }
    },
    {
      id: "u3",
      username: "warehouse",
      password: "warehouse123",
      role: "warehouse_manager",
      name: "Sarah Storage",
      email: "warehouse@deliveryhub.pro",
      permissions: { inventory: ["create", "read", "update", "delete"], orders: ["read", "update"], logistics: ["read"] }
    },
    {
      id: "u4",
      username: "logistics",
      password: "logistics123",
      role: "logistics_coordinator",
      name: "Mike Logistics",
      email: "mike@deliveryhub.pro",
      permissions: { logistics: ["create", "read", "update"], orders: ["create", "read", "update"], fleet: ["read"] }
    }
  ],
  // Notification System
  transit: {
    carriers: [
      { id: 'BC-001', name: 'NLC (National Logistics Cell)', license: 'LIC-NLC-001', bond_limit: 50000000 },
      { id: 'BC-002', name: 'Bilal Logistics Bonded', license: 'LIC-BL-786', bond_limit: 10000000 }
    ],
    routes: [
      { id: 'RT-KHI-TKM', name: 'KHI -> Torkham (ATT)', origin: 'Karachi Port', destination: 'Torkham Border', checkpoints: ['Hyderabad', 'Sukkur', 'Peshawar'] },
      { id: 'RT-KHI-CHM', name: 'KHI -> Chaman (ATT)', origin: 'Port Qasim', destination: 'Chaman Border', checkpoints: ['Hyderabad', 'Sukkur', 'Quetta'] },
      { id: 'RT-LOC-LHR', name: 'KHI -> Lahore (Bonded)', origin: 'Karachi Port', destination: 'Lahore Dry Port', checkpoints: ['Hyderabad', 'Multan'] }
    ],
    shipments: [
      {
        id: 'TS-001',
        gd_number: 'KAP-AT-12345',
        type: 'afghan_transit',
        customer_name: 'Kabul Traders',
        carrier_id: 'BC-001',
        container_no: 'TRLU-9876543',
        bl_number: 'HLCU123456',
        seal_number: 'SL-998877',
        route_id: 'RT-KHI-TKM',
        status: 'in_transit',
        current_location: 'Sukkur Bypass',
        weboc_status: 'Gate Out Confirmed',
        eta: new Date(Date.now() + 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'TS-002',
        gd_number: 'KAP-TP-55555',
        type: 'transshipment',
        customer_name: 'Global Forwarders',
        carrier_id: 'BC-002',
        container_no: 'MSKU-1122334',
        bl_number: 'MAEU000111',
        seal_number: 'SL-112233',
        route_id: 'RT-LOC-LHR',
        status: 'port_arrival',
        current_location: 'Karachi Port Terminal',
        weboc_status: 'Examination Pending',
        eta: new Date(Date.now() + 86400000 * 4).toISOString(),
        created_at: new Date().toISOString()
      }
    ],
    activity_logs: []
  },
  dnd: {
    terminals: [
      { id: 'TERM-QICT', name: 'Qasim International Container Terminal (QICT)', code: 'QICT' },
      { id: 'TERM-SAPT', name: 'South Asia Pakistan Terminal (SAPT)', code: 'SAPT' },
      { id: 'TERM-KICT', name: 'Karachi International Container Terminal (KICT)', code: 'KICT' }
    ],
    shipping_lines: [
      { id: 'SL-MAERSK', name: 'Maersk Line', code: 'MAEU' },
      { id: 'SL-MSC', name: 'Mediterranean Shipping Company', code: 'MSCU' },
      { id: 'SL-COSCO', name: 'COSCO Shipping', code: 'COSU' }
    ],
    rules: [
      // QICT Demurrage Rules (Import)
      {
        id: 'RULE-QICT-IMP',
        entity_id: 'TERM-QICT',
        type: 'demurrage',
        free_days: 5,
        currency: 'PKR',
        slabs: [
          { from: 6, to: 10, rate: 5000 },
          { from: 11, to: 15, rate: 8500 },
          { from: 16, to: 1000, rate: 12000 }
        ]
      },
      // Maersk Detention Rules (Import)
      {
        id: 'RULE-MAERSK-IMP',
        entity_id: 'SL-MAERSK',
        type: 'detention',
        free_days: 14,
        currency: 'PKR',
        slabs: [
          { from: 15, to: 21, rate: 15000 },
          { from: 22, to: 1000, rate: 25000 }
        ]
      }
    ],
    container_cycles: [
      {
        id: 'CYC-001',
        container_no: 'MSKU-9876543',
        shipping_line_id: 'SL-MAERSK',
        terminal_id: 'TERM-QICT',
        bl_number: 'MAEU12345678',
        vessel_arrival: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        discharge_date: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
        gate_out: null, // Still at port -> Demurrage ticking
        empty_return: null,
        status: 'at_terminal'
      },
      {
        id: 'CYC-002',
        container_no: 'MRKU-1122334',
        shipping_line_id: 'SL-MAERSK',
        terminal_id: 'TERM-SAPT',
        bl_number: 'MAEU87654321',
        vessel_arrival: new Date(Date.now() - 86400000 * 25).toISOString(),
        discharge_date: new Date(Date.now() - 86400000 * 24).toISOString(),
        gate_out: new Date(Date.now() - 86400000 * 18).toISOString(), // 18 days ago (Left port)
        empty_return: null, // Not returned -> Detention ticking (Day 18 of detention clock)
        status: 'gate_out'
      }
    ]
  },
  notifications: [
    { id: 1, title: 'Welcome to Delivery Hub', message: 'System updated to version 2.0', type: 'info', read: false, time: 'Just now' },
    { id: 2, title: 'Low Stock Alert', message: 'Wireless Mouse (SKU-001) is below safety stock', type: 'warning', read: false, time: '10 min ago' },
    { id: 3, title: 'New Order', message: 'Order #ORD-2025-001 received from Global Traders', type: 'success', read: true, time: '1 hour ago' }
  ]
};

// Data Access Methods (Repository Pattern Mock)

// --- Notifications ---
const addNotification = (notif) => {
  db.notifications.unshift(notif);
  if (db.notifications.length > 50) db.notifications.pop(); // Keep list manageable
  return notif;
};
const getAvailableVehicles = () => {
  return db.fleet.vehicles.filter(v => v.status === 'available');
};

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

// --- Finance ---
const addLandedCost = (costSheet) => {
  db.finance.landed_costs.push(costSheet);
  return costSheet;
}

module.exports = {
  db,
  addNotification,
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
  addBond,
  addLandedCost,
  addIndent: (indent) => { db.imports.indents.push(indent); return indent; },
  addBooking: (booking) => { db.exports.bookings.push(booking); return booking; }
};
