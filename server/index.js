const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const upload = multer();
const app = express();
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now in dev/demo mode to avoid blockers
    }
  }
}));
app.use(express.json());

// Centralized DB & Engines
const DB = require('./db'); // The new "Brain"
const { generateManifestNumber, validateManifest } = require('./manifest_engine');
const financeAPI = require('./finance_api'); // Finance Module
const tradeFinanceApi = require('./trade_finance_api'); // Trade Finance Module
const complianceApi = require('./compliance_api'); // Compliance Module
const customsEngine = require('./customs_engine'); // Customs Module
const importExportApi = require('./import_export_api'); // Import/Export Module
const tripApi = require('./trip_api'); // Trip Management Module

// --- Trip Module Routes ---
app.use('/api/fleet', tripApi);
app.use('/api', require('./order_api'));
app.use('/api/transit', require('./transit_api'));
app.use('/api/dnd', require('./dnd_api'));

// --- Import & Export Module Routes ---
app.get('/api/imports/indents', importExportApi.getIndents);
app.post('/api/imports/indents', importExportApi.createIndent);
app.get('/api/imports/stats', importExportApi.getImportStats);

app.get('/api/exports/bookings', importExportApi.getBookings);
app.post('/api/exports/bookings', importExportApi.createBooking);
app.get('/api/exports/stats', importExportApi.getExportStats);

// Customs Duty Calculator Endpoint (Phase 2)
app.post('/api/customs/calculate-duty', (req, res) => {
  try {
    const { hs_code, value_pkr } = req.body;
    if (!hs_code || !value_pkr) {
      return res.status(400).json({ error: "hs_code and value_pkr are required" });
    }

    const result = customsEngine.calculateDuty(hs_code, parseFloat(value_pkr));
    console.log(`Calculated duty for ${hs_code}:`, result);
    res.json({ ok: true, data: result });
  } catch (e) {
    console.error("Duty Calc Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// The following container engine imports are no longer directly used for API logic,

// Finance: runtime flag to detect Supabase presence for mock fallback
const hasSupabase = !!((process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) && (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY));
// Simple in-memory invoices store for mock mode
const mockInvoices = [];
// as the DB now manages container state directly.
// const { getContainerStats, logReturn, scheduleMaintenance, getAllContainers } = require('./container_engine');

// In-memory store (mock) - These are now managed by DB.js
app.post('/api/finance/payments', financeAPI.recordPayment);
// Finance Report Routes (Added)
app.get('/api/finance/reports/pl', financeAPI.getProfitLoss);
app.get('/api/finance/reports/bs', financeAPI.getBalanceSheet);
app.get('/api/finance/driver-settlements', financeAPI.getDriverSettlements);
app.post('/api/finance/driver-settlements/process', financeAPI.processDriverSettlement);

// Landed Cost
app.get('/api/finance/clearance-jobs', financeAPI.getClearanceJobs);
app.get('/api/finance/clearance-jobs/:id/items', financeAPI.getJobItems);
app.post('/api/finance/landed-cost', financeAPI.saveLandedCost);
app.get('/api/finance/dashboard', financeAPI.getDashboardMetrics);

// Finance AR: Customers (fallback to DB mock if Supabase not configured)
app.get('/api/finance/customers', (req, res) => {
  if (!hasSupabase) {
    const customers = (DB.db.customers?.profiles || []).map((c, idx) => ({
      id: c.id || `cust_${idx + 1}`,
      customer_code: c.code || c.customer_code || `CUST-${(idx + 1).toString().padStart(3, '0')}`,
      customer_name: c.name || c.customer_name || c.company || c.full_name || `Customer ${(idx + 1)}`,
      email: c.email || `customer${idx + 1}@example.com`,
    }));
    return res.json({ customers });
  }
  return financeAPI.getCustomers(req, res);
});

// Finance AR: Unbilled shipments (fallback uses all DB shipments as unbilled)
app.get('/api/finance/shipments/unbilled', async (req, res) => {
  if (!hasSupabase) {
    const shipments = Object.values(DB.db.logistics?.shipments || {});
    return res.json({ shipments });
  }
  return financeAPI.getUnbilledShipments(req, res);
});

// Finance AR: Invoices list (fallback to in-memory store)
app.get('/api/finance/invoices', async (req, res) => {
  if (!hasSupabase) {
    // Supports ?status= filter similar to frontend usage
    const { status } = req.query || {};
    let data = mockInvoices;
    if (status && status !== 'all') {
      data = data.filter(inv => inv.status === status);
    }
    return res.json({ invoices: data });
  }
  return financeAPI.getInvoices(req, res);
});

// Finance AR: Create invoice (fallback to in-memory)
app.post('/api/finance/invoices', async (req, res) => {
  if (!hasSupabase) {
    try {
      const { customer_id, invoice_date, due_date, line_items = [], shipment_id, bl_number, notes } = req.body || {};
      const subtotal = line_items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0);
      const tax_amount = line_items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0) * Number(item.tax_rate || 0) / 100), 0);
      const total_amount = subtotal + tax_amount;
      const invoice = {
        id: `inv_${Date.now()}`,
        invoice_number: `INV-${Date.now()}`,
        customer_id: customer_id || (DB.db.customers?.profiles?.[0]?.id || 'CUST-001'),
        invoice_date: invoice_date || new Date().toISOString().split('T')[0],
        due_date: due_date || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
        shipment_id: shipment_id || null,
        bl_number: bl_number || null,
        subtotal,
        tax_amount,
        total_amount,
        balance: total_amount,
        notes: notes || null,
        status: 'sent',
        created_at: new Date().toISOString(),
      };
      mockInvoices.push(invoice);
      return res.status(201).json({ invoice, message: 'Invoice created successfully (mock)' });
    } catch (e) {
      return res.status(400).json({ error: e.message || 'Failed to create invoice' });
    }
  }
  return financeAPI.createInvoice(req, res);
});

// Finance AR: Update invoice status (optional for responsiveness)
app.patch('/api/finance/invoices/:id/status', (req, res) => {
  if (!hasSupabase) {
    const { id } = req.params;
    const { status } = req.body || {};
    const inv = mockInvoices.find(i => i.id === id || i.invoice_number === id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    inv.status = status || inv.status;
    return res.json({ invoice: inv });
  }
  return financeAPI.updateInvoiceStatus(req, res);
});

// POST /api/shipments - create a new shipment
app.post('/api/shipments', (req, res) => {
  const id = uuidv4();
  const { shipment_ref, type, mode, origin, destination, value, customer_id } = req.body;
  const record = {
    id,
    shipment_ref: shipment_ref || `SHP-${Date.now()}`,
    type,
    mode,
    origin,
    destination,
    value,
    customer_id: customer_id || 'CUST-001', // Default to first customer for mock
    status: 'created',
    created_at: new Date().toISOString()
  };
  DB.addShipment(record);
  return res.status(201).json(record);
});

// GET /api/shipments - list all shipments (mock)
app.get('/api/shipments', (req, res) => {
  try {
    const list = Object.values(DB.db.logistics.shipments);
    return res.json({ ok: true, shipments: list });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/shipments/:id/route - return a route plan (mock)
app.get('/api/shipments/:id/route', (req, res) => {
  const { id } = req.params;
  const s = DB.db.logistics.shipments[id];
  if (!s) return res.status(404).json({ error: 'not found' });
  const route = {
    legs: [
      { from: s.origin, to: 'Port of Karachi', mode: 'road', etaHours: 12 },
      { from: 'Port of Karachi', to: 'Torkham', mode: 'road', etaHours: 72 },
    ]
  };
  return res.json(route);
});

// POST /api/documents/upload - accept multipart file, perform OCR and HS validation
const { recognizeBuffer } = require('./ocr');
const { extractHSCodesFromText, validateHSCodes } = require('./hs_validator');

// Workflow / PSW stubs
const { submitGoodsDeclaration, submitTransitDeclaration, getDeclarationStatus } = require('./workflow/psw_client');
const { evaluate: evaluateRule } = require('./workflow/rules_engine');
const { calculateDuties } = require('./workflow/duty_engine');
const { generatePSID, verifyPayment } = require('./workflow/payment_gateway');
const { calculateBond, generateSeal, recordTransitEvent } = require('./workflow/transit_engine');

app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const shipment_id = req.body.shipment_id;
  if (!file) return res.status(400).json({ error: 'no file' });

  // Mock storage URL
  const url = `https://mock-storage.example/${shipment_id || 'unlinked'}/${file.originalname}`;

  // Run OCR (async)
  let ocrText = '';
  try {
    ocrText = await recognizeBuffer(file.buffer);
  } catch (e) {
    ocrText = '';
  }

  // Extract HS codes and validate
  const hsCodes = extractHSCodesFromText(ocrText);
  const hsValidation = validateHSCodes(hsCodes);

  const result = { url, ocrText, hsCodes, hsValidation };

  // Persist to Postgres if configured
  try {
    const { insertDocument } = require('./db');
    const saved = await insertDocument({
      shipment_id: shipment_id || null,
      doc_type: req.body.doc_type || 'invoice',
      reference_number: req.body.reference_number || null,
      issue_date: req.body.issue_date || null,
      expiry_date: req.body.expiry_date || null,
      storage_path: url,
      verification_status: 'processed',
      metadata_json: { ocrText, hsCodes, hsValidation },
    });
    if (saved) result.saved = saved;
  } catch (e) {
    // ignore DB errors in mock server
    console.error('DB persist failed', e && e.message ? e.message : e);
  }

  return res.status(201).json(result);
});

// POST /api/psw/goods-declaration - submit GD to PSW (mock)
app.post('/api/psw/goods-declaration', async (req, res) => {
  try {
    const payload = req.body || {};
    // run basic rules
    const ruleCheck = await evaluateRule('CH14_RULE_100', payload).catch(() => ({ ok: true }));
    if (!ruleCheck.ok) return res.status(400).json({ ok: false, error: 'validation_failed', details: ruleCheck });
    const pswResp = await submitGoodsDeclaration(payload);
    return res.status(201).json({ ok: true, psw: pswResp });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/psw/transit-declaration - submit TD to PSW (mock)
app.post('/api/psw/transit-declaration', async (req, res) => {
  try {
    const payload = req.body || {};
    const ruleCheck = await evaluateRule('CH25_RULE_350', payload).catch(() => ({ eligible: true }));
    if (ruleCheck.eligible === false) return res.status(400).json({ ok: false, error: 'transit_ineligible', details: ruleCheck });
    const pswResp = await submitTransitDeclaration(payload);
    return res.status(201).json({ ok: true, psw: pswResp });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/psw/status/:reference - fetch declaration status
app.get('/api/psw/status/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const status = await getDeclarationStatus(reference);
    return res.json({ ok: true, status });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/duties/calculate - calculates duties based on HS codes and value
app.post('/api/duties/calculate', async (req, res) => {
  try {
    const { hs_codes, declared_value } = req.body;
    const result = await calculateDuties({ hs_codes, value: declared_value });
    return res.json({ ok: true, result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/payments/generate - generate PSID for duty payment
app.post('/api/payments/generate', (req, res) => {
  try {
    const { shipment_id, breakdown } = req.body;
    const psid = generatePSID({ shipment_id, breakdown });
    return res.status(201).json({ ok: true, psid });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/payments/verify - verify a payment (mock)
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { psid, bankRef } = req.body;
    const result = await verifyPayment(psid, bankRef);
    return res.json({ ok: true, result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/transit/seal - apply a transit seal
app.post('/api/transit/seal', (req, res) => {
  try {
    const { shipment_id } = req.body;
    const seal = generateSeal(shipment_id);
    return res.status(201).json({ ok: true, seal });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/transit/event - record a transit event
app.post('/api/transit/event', (req, res) => {
  try {
    const { shipment_id, event } = req.body;
    const rec = recordTransitEvent(shipment_id, event);
    return res.status(201).json({ ok: true, event: rec });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// Detailed Proof of Delivery (POD)
// POST /api/pods - Submit evidence (multipart)
app.post('/api/pods', upload.any(), (req, res) => {
  try {
    const fields = req.body || {};
    const files = Array.isArray(req.files) ? req.files : [];

    // Ensure storage
    DB.db.logistics = DB.db.logistics || {};
    DB.db.logistics.pods = DB.db.logistics.pods || [];

    const id = uuidv4();
    const manifest_id = fields.manifest_id || fields.manifest || 'unknown';

    // Build attachment metadata (mock storage URLs)
    const attachments = files.map(f => ({
      filename: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      url: `https://mock-storage.example/pods/${manifest_id}/${id}/${encodeURIComponent(f.originalname)}`,
    }));

    const record = {
      id,
      manifest_id,
      signatory: fields.signatory || 'N/A',
      delivery_time: fields.delivery_time || new Date().toISOString(),
      location: fields.location || 'Unknown',
      gps_lat: fields.gps_lat ? Number(fields.gps_lat) : null,
      gps_lng: fields.gps_lng ? Number(fields.gps_lng) : null,
      condition: fields.condition || 'good',
      seal_intact: String(fields.seal_intact || 'true').toLowerCase() === 'true',
      notes: fields.notes || '',
      attachments,
      created_at: new Date().toISOString(),
    };

    DB.db.logistics.pods.push(record);

    return res.status(201).json({ ok: true, pod: record });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message ? e.message : 'Failed to submit POD' });
  }
});

// GET /api/pods - List PODs (optional manifest_id query)
app.get('/api/pods', (req, res) => {
  try {
    const manifest_id = req.query.manifest_id;
    const list = Array.isArray(DB.db.logistics?.pods) ? DB.db.logistics.pods : [];
    const pods = manifest_id ? list.filter(p => p.manifest_id === manifest_id) : list;
    return res.json({ ok: true, pods });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message ? e.message : 'Failed to fetch PODs' });
  }
});

// GET /api/pods/:manifest_id - Get PODs for a manifest
app.get('/api/pods/:manifest_id', (req, res) => {
  const { manifest_id } = req.params;
  const relatedPods = Object.values(DB.db.logistics.pods || {}).filter(p => p.manifest_id === manifest_id);
  return res.json({ ok: true, pods: relatedPods });
});

// --- Phase 2: Empty Container Management ---

// GET /api/containers - Get all containers and stats
app.get('/api/containers', (req, res) => {
  // Need to merge dynamic DB status with static engine logic if needed,
  // but for now container_engine can just read from DB if we refactor it,
  // or we just serve from DB directly.
  // For simplicity, serving from DB.
  return res.json({
    ok: true,
    stats: { total: DB.db.logistics.containers.length }, // simplified stats
    containers: DB.db.logistics.containers
  });
});

// POST /api/containers/return - Log a return with Detention Calculation
app.post('/api/containers/return', (req, res) => {
  try {
    const { container_id, location, condition, return_date } = req.body;

    // Calculate charges first
    const { calculateDetention } = require('./container_engine');
    const charges = calculateDetention(container_id, return_date);

    if (charges.error) return res.status(404).json({ ok: false, error: charges.error });

    // Update DB
    const container = DB.db.logistics.containers.find(c => c.id === container_id);
    if (container) {
      container.status = 'returned';
      container.location = location;
      container.condition = condition;
      container.last_charge = charges; // Store the charge record
    }

    return res.json({ ok: true, container, charges });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Phase 3: Analytics ---
app.get('/api/analytics/advanced', (req, res) => {
  // Calculate real-ish metrics based on DB
  const totalInvoices = (DB.db.customers?.invoices || []).reduce((acc, inv) => acc + inv.amount, 0);

  return res.json({
    ok: true,
    metrics: {
      detention_savings: 45000,
      repositioning_costs: 12000,
      revenue_pipeline: totalInvoices, // Integrated Metric
      efficiency_score: 88,
      volume_trend: [
        { month: 'Jan', volume: 10 },
        { month: 'Feb', volume: 15 },
        { month: 'Mar', volume: 12 },
        { month: 'Apr', volume: 18 },
        { month: 'May', volume: 20 },
        { month: 'Jun', volume: Object.keys(DB.db.logistics.shipments).length + 20 }
      ]
    }
  });
});

// --- Phase 4: AI Optimization ---
app.post('/api/ai/optimize', (req, res) => {
  const { origin, destination } = req.body;
  return res.json({
    ok: true,
    route: {
      path: [origin || "Origin", "Hub A", "Hub B", destination || "Dest"],
      savings: "15%",
      co2_reduction: "10kg",
      details: "AI recommends Intermodal Rail for Hub A -> Hub B leg to reduce carbon footprint."
    }
  });
});

// --- Logistics Manifest & Bill of Lading ---
app.post('/api/logistics/manifest-bl', (req, res) => {
  try {
    const now = new Date();
    const iso = now.toISOString();
    const dateTime = iso.split('.')[0].replace('T', ' ');

    const payload = req.body || {};

    // Normalize inputs with fallbacks
    const mode = payload.mode || payload.transport_mode || 'Sea';
    const carrier = payload.carrier_name || payload.carrier || 'Oceanic Shipping Lines (OSL)';
    const vessel = payload.vessel_name || payload.vessel || (mode.toLowerCase() === 'sea' ? 'OSL Horizon' : null);
    const voyage = payload.voyage_number || payload.voyage || (mode.toLowerCase() === 'sea' ? 'OSL-HRZ-072' : null);
    const flight = payload.flight_number || null;
    const truck = payload.truck_number || (mode.toLowerCase() === 'road' ? 'KHI-TRK-9482' : null);

    const pol = payload.pol || payload.port_loading || payload.port_of_loading || 'Karachi Port (PKKHI), Pakistan';
    const pod = payload.pod || payload.port_discharge || payload.port_of_discharge || 'Jebel Ali (AEJEA), UAE';
    const finalDestination = payload.final_destination || 'Dubai, UAE';

    const shipper = payload.shipper || {
      name: 'TechLogistics Corp',
      address: '12 Industrial Ave, Korangi, Karachi, Pakistan',
      contact: '+92 21 3000 1122, ops@techlogistics.com',
      assumed: true,
    };
    const consignee = payload.consignee || {
      name: 'Global Exports Ltd',
      address: '220 Harbor Road, Jebel Ali, Dubai, UAE',
      contact: '+971 4 123 4567, imports@globalexports.com',
      assumed: true,
    };
    const notify = payload.notify_party || payload.notify || {
      name: consignee.name,
      address: consignee.address,
      contact: '+971 4 123 4567',
      assumed: true,
    };

    const containers = Array.isArray(payload.containers)
      ? payload.containers
      : (payload.container ? [payload.container] : [
        { number: 'OSLU4567890', size_type: '40HC', seal: 'SL-998877', iso: '45G1', assumed: true },
      ]);

    const cargoLines = Array.isArray(payload.packages)
      ? payload.packages
      : (payload.package_details ? [payload.package_details] : [
        {
          packages: 200,
          package_type: 'Cartons on Pallets',
          description: 'Consumer Electronics (Routers, IoT Sensors)',
          hs_code: '8517.62; 9026.10',
          gross_weight_kg: 4800,
          net_weight_kg: 4100,
          volume_cbm: 28.5,
          marks_numbers: 'TECLOG/GE-2025/HRZ-072',
          assumed: true,
        },
      ]);

    const paymentTerms = payload.payment_terms || 'CIF';
    const specialInstructions = payload.special_instructions || [
      'Handle as general cargo.',
      'Ensure customs documentation is pre-verified 24 hours before vessel ETA.',
    ];

    const manifestNumber = (typeof generateManifestNumber === 'function')
      ? generateManifestNumber()
      : `MAN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    const blNumber = `BL-${manifestNumber.replace('MAN-', '')}`;

    const manifest = {
      manifest_number: manifestNumber,
      date_time: dateTime,
      shipper,
      consignee,
      notify_party: notify,
      mode,
      carrier,
      vessel,
      voyage,
      flight,
      truck_number: truck,
      port_of_loading: pol,
      port_of_discharge: pod,
      final_destination: finalDestination,
      containers: containers.map(c => ({
        container_number: c.number || c.container_number || 'OSLU4567890',
        size_type: c.size_type || c.size || '40HC',
        seal_number: c.seal || c.seal_number || 'SL-998877',
        iso: c.iso || '45G1',
        assumed: !!c.assumed,
      })),
      packages: cargoLines.map((l, idx) => ({
        line_no: idx + 1,
        number_of_packages: l.packages || l.number_of_packages || 200,
        type_of_packages: l.package_type || l.type_of_packages || 'Cartons on Pallets',
        description_of_goods: l.description || l.description_of_goods || 'Consumer Electronics (Routers, IoT Sensors)',
        hs_code: l.hs_code || '8517.62; 9026.10',
        gross_weight: Number(l.gross_weight_kg || l.gross_weight || 4800),
        net_weight: Number(l.net_weight_kg || l.net_weight || 4100),
        volume_cbm: Number(l.volume_cbm || l.volume || 28.5),
        marks_numbers: l.marks_numbers || 'TECLOG/GE-2025/HRZ-072',
        assumed: !!l.assumed,
      })),
      payment_terms: paymentTerms,
      special_instructions: Array.isArray(specialInstructions) ? specialInstructions : [String(specialInstructions)],
    };

    const firstContainer = manifest.containers[0] || {};
    const firstLine = manifest.packages[0] || {};

    const bl = {
      bl_number: blNumber,
      issue_date: iso.slice(0, 10),
      issue_place: ((pol && pol.split(',')[0]) || 'Karachi').trim(),
      shipper: { name: shipper.name, address: shipper.address },
      consignee: { name: consignee.name, address: consignee.address },
      notify_party: { name: notify.name, address: notify.address },
      vessel_voyage: vessel ? `${vessel}${voyage ? ' / ' + voyage : ''}` : (flight || truck || 'N/A'),
      port_of_loading: pol,
      port_of_discharge: pod,
      final_destination: finalDestination,
      description_of_goods: firstLine.description_of_goods,
      container_and_seal: `${firstContainer.container_number || 'N/A'} / ${firstContainer.seal_number || 'N/A'}`,
      marks_and_numbers: firstLine.marks_numbers || 'N/A',
      freight_and_charges: paymentTerms === 'CIF' ? 'Freight Prepaid (CIF)' : `Terms: ${paymentTerms}`,
      signed_for_carrier: `${carrier} – Authorized Signatory`,
    };

    // Optional: persist lightweight record in mock DB
    try {
      DB.db.logistics = DB.db.logistics || {};
      DB.db.logistics.manifests = DB.db.logistics.manifests || [];
      DB.db.logistics.manifests.push({ id: manifestNumber, manifest, bl, created_at: iso });
    } catch (_) { }

    return res.status(201).json({ ok: true, manifest, bl });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message ? e.message : 'Failed to generate manifest/BL' });
  }
});

// Frontend compatibility: Create manifest via /api/manifests
app.post('/api/manifests', (req, res) => {
  try {
    const now = new Date();
    const iso = now.toISOString();

    // Reuse generation by mimicking the same logic
    const payload = req.body || {};
    const mode = payload.mode || payload.transport_mode || 'Sea';
    const carrier = payload.carrier_name || payload.carrier || 'Oceanic Shipping Lines (OSL)';
    const vessel = payload.vessel_name || payload.vessel || (String(mode).toLowerCase() === 'maritime' || String(mode).toLowerCase() === 'sea' ? 'OSL Horizon' : null);
    const voyage = payload.voyage_number || payload.voyage || 'VOY-001';
    const pol = payload.pol || payload.port_loading || payload.port_of_loading || 'Karachi Port (PKKHI), Pakistan';
    const pod = payload.pod || payload.port_discharge || payload.port_of_discharge || 'Jebel Ali (AEJEA), UAE';

    // Generate via existing endpoint logic (inline copy)
    const requestLike = { body: { ...payload, transport_mode: mode, vessel_name: vessel, voyage_number: voyage, pol, pod } };
    const resBuffer = {};

    // Inline recomputation
    const dateTime = iso.split('.')[0].replace('T', ' ');

    const shipper = payload.shipper || {
      name: 'TechLogistics Corp', address: '12 Industrial Ave, Korangi, Karachi, Pakistan', contact: '+92 21 3000 1122, ops@techlogistics.com', assumed: true,
    };
    const consignee = payload.consignee || {
      name: 'Global Exports Ltd', address: '220 Harbor Road, Jebel Ali, Dubai, UAE', contact: '+971 4 123 4567, imports@globalexports.com', assumed: true,
    };
    const notify = payload.notify_party || payload.notify || { name: consignee.name, address: consignee.address, contact: '+971 4 123 4567', assumed: true };

    const containers = Array.isArray(payload.containers) ? payload.containers : (
      payload.container ? [payload.container] : [{ number: 'OSLU4567890', size_type: '40HC', seal: 'SL-998877', iso: '45G1', assumed: true }]
    );

    const cargoLines = Array.isArray(payload.packages) ? payload.packages : (
      payload.package_details ? [payload.package_details] : [{ packages: 200, package_type: 'Cartons on Pallets', description: 'Consumer Electronics (Routers, IoT Sensors)', hs_code: '8517.62; 9026.10', gross_weight_kg: 4800, net_weight_kg: 4100, volume_cbm: 28.5, marks_numbers: 'TECLOG/GE-2025/HRZ-072', assumed: true }]
    );

    const paymentTerms = payload.payment_terms || 'CIF';

    const manifestNumber = (typeof generateManifestNumber === 'function')
      ? generateManifestNumber()
      : `MAN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    const blNumber = `BL-${manifestNumber.replace('MAN-', '')}`;

    const manifest = {
      manifest_number: manifestNumber,
      date_time: dateTime,
      shipper,
      consignee,
      notify_party: notify,
      mode,
      carrier,
      vessel,
      voyage,
      port_of_loading: pol,
      port_of_discharge: pod,
      final_destination: payload.final_destination || 'Dubai, UAE',
      containers: containers.map(c => ({
        container_number: c.number || c.container_number || 'OSLU4567890',
        size_type: c.size_type || c.size || '40HC',
        seal_number: c.seal || c.seal_number || 'SL-998877',
        iso: c.iso || '45G1',
        assumed: !!c.assumed,
      })),
      packages: cargoLines.map((l, idx) => ({
        line_no: idx + 1,
        number_of_packages: l.packages || l.number_of_packages || 200,
        type_of_packages: l.package_type || l.type_of_packages || 'Cartons on Pallets',
        description_of_goods: l.description || l.description_of_goods || 'Consumer Electronics (Routers, IoT Sensors)',
        hs_code: l.hs_code || '8517.62; 9026.10',
        gross_weight: Number(l.gross_weight_kg || l.gross_weight || 4800),
        net_weight: Number(l.net_weight_kg || l.net_weight || 4100),
        volume_cbm: Number(l.volume_cbm || l.volume || 28.5),
        marks_numbers: l.marks_numbers || 'TECLOG/GE-2025/HRZ-072',
        assumed: !!l.assumed,
      })),
      payment_terms: paymentTerms,
      special_instructions: Array.isArray(payload.special_instructions) ? payload.special_instructions : (payload.special_instructions ? [String(payload.special_instructions)] : []),
    };

    const firstContainer = manifest.containers[0] || {};
    const firstLine = manifest.packages[0] || {};

    const bl = {
      bl_number: blNumber,
      issue_date: iso.slice(0, 10),
      issue_place: ((pol && pol.split(',')[0]) || 'Karachi').trim(),
      shipper: { name: shipper.name, address: shipper.address },
      consignee: { name: consignee.name, address: consignee.address },
      notify_party: { name: notify.name, address: notify.address },
      vessel_voyage: vessel ? `${vessel}${voyage ? ' / ' + voyage : ''}` : 'N/A',
      port_of_loading: pol,
      port_of_discharge: pod,
      final_destination: manifest.final_destination,
      description_of_goods: firstLine.description_of_goods,
      container_and_seal: `${firstContainer.container_number || 'N/A'} / ${firstContainer.seal_number || 'N/A'}`,
      marks_and_numbers: firstLine.marks_numbers || 'N/A',
      freight_and_charges: paymentTerms === 'CIF' ? 'Freight Prepaid (CIF)' : `Terms: ${paymentTerms}`,
      signed_for_carrier: `${carrier} – Authorized Signatory`,
    };

    // Save
    try {
      DB.db.logistics = DB.db.logistics || {};
      DB.db.logistics.manifests = DB.db.logistics.manifests || [];
      DB.db.logistics.manifests.push({ id: manifestNumber, manifest, bl, created_at: iso, status: 'created' });
    } catch (_) { }

    return res.status(201).json({ ok: true, id: manifestNumber, manifest, bl });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message ? e.message : 'Failed to create manifest' });
  }
});

// Frontend compatibility: List manifests via /api/manifests
app.get('/api/manifests', (req, res) => {
  try {
    const items = (DB.db.logistics && DB.db.logistics.manifests) ? DB.db.logistics.manifests : [];
    const manifests = items.map(rec => ({
      id: rec.id,
      manifest_number: rec.manifest?.manifest_number || rec.id,
      transport_mode: (rec.manifest?.mode || '').toLowerCase() || 'sea',
      carrier: rec.manifest?.carrier,
      vessel: rec.manifest?.vessel,
      voyage: rec.manifest?.voyage,
      pol: rec.manifest?.port_of_loading,
      pod: rec.manifest?.port_of_discharge,
      status: rec.status || 'created',
      created_at: rec.created_at,
      bl_number: rec.bl?.bl_number,
    }));
    return res.json({ manifests });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message ? e.message : 'Failed to fetch manifests' });
  }
});

// --- Phase 7: Customs Clearance Module ---
// --- Phase 7: Customs Clearance Module ---
app.use('/api/customs', require('./customs_api'));

// POST /api/customs/declarations - Create Draft
app.post('/api/customs/declarations', (req, res) => {
  const id = uuidv4();
  const decl = {
    id,
    status: 'draft',
    created_at: new Date().toISOString(),
    ...req.body
  };

  const valid = CustomsEngine.validateDeclaration(decl);
  if (!valid.isValid && req.body.submit) { // Only strict validate on submit
    return res.status(400).json({ ok: false, errors: valid.errors });
  }

  DB.addDeclaration(decl);
  return res.status(201).json({ ok: true, declaration: decl });
});

// POST /api/customs/calculate-duty - Assessment Preview
// POST /api/customs/calculate-duty - Assessment Preview
app.post('/api/customs/calculate-duty', (req, res) => {
  const { items, currency, is_filer, is_commercial } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ ok: false, error: 'items array is required' });
  }

  let totalPayable = 0;
  let totalValuePKR = 0;

  // Extended breakdown
  let breakdown = {
    customs_duty: 0,
    additional_customs_duty: 0,
    regulatory_duty: 0,
    fed: 0,
    sales_tax: 0,
    additional_sales_tax: 0,
    income_tax: 0
  };

  const options = {
    isFiler: is_filer !== false, // default true
    isCommercial: is_commercial !== false // default true
  };

  const itemResults = items.map(item => {
    const calc = CustomsEngine.calculateDuty(item.hs_code, Number(item.value), currency || 'USD', options);

    totalPayable += calc.total_payable;
    totalValuePKR += calc.value_pkr;

    breakdown.customs_duty += calc.breakdown.customs_duty;
    breakdown.additional_customs_duty += calc.breakdown.additional_customs_duty;
    breakdown.regulatory_duty += calc.breakdown.regulatory_duty;
    breakdown.fed += calc.breakdown.fed;
    breakdown.sales_tax += calc.breakdown.sales_tax;
    breakdown.additional_sales_tax += calc.breakdown.additional_sales_tax;
    breakdown.income_tax += calc.breakdown.income_tax;

    return { ...item, calculation: calc };
  });

  return res.json({
    ok: true,
    total_payable: totalPayable,
    total_value_pkr: totalValuePKR,
    currency: 'PKR',
    breakdown,
    item_details: itemResults
  });
});

// POST /api/customs/submit - Submit to PSW + Generate PSID
app.post('/api/customs/submit', (req, res) => {
  const { declaration_id } = req.body;
  const decl = DB.db.customs.declarations.find(d => d.id === declaration_id);

  if (!decl) return res.status(404).json({ error: 'Not found' });

  // 1. Calculate final duty
  let totalDuty = 0;
  decl.items.forEach(item => {
    const d = CustomsEngine.calculateDuty(item.hs_code, Number(item.value));
    totalDuty += d.total;
  });

  // 2. Generate PSID
  const psid = CustomsEngine.generatePSID(totalDuty);

  // 3. Update DB
  DB.updateDeclarationStatus(declaration_id, 'assessed');
  const dutyRecord = {
    id: uuidv4(),
    declaration_id,
    amount: totalDuty,
    psid,
    status: 'unpaid'
  };
  DB.addDuty(dutyRecord);

  return res.json({ ok: true, psid, duty: dutyRecord });
});

// POST /api/customs/pay - Simulate Payment
app.post('/api/customs/pay', (req, res) => {
  const { psid } = req.body;
  const duty = DB.db.customs.duties.find(d => d.psid === psid);
  if (!duty) return res.status(404).json({ error: 'Invalid PSID' });

  duty.status = 'paid';
  DB.updateDeclarationStatus(duty.declaration_id, 'cleared'); // Simplified flow

  return res.json({ ok: true, message: 'Payment Verified. Gate Pass Issued.' });
});


// --- Phase 8: Universal Dashboard APIs ---

// GET /api/orders - List & Stats
app.get('/api/orders', (req, res) => {
  // Return all orders + simple stats
  const orders = DB.db.orders.active;
  const history = DB.db.orders.history;
  const all = [...orders, ...history];

  const stats = {
    pending: orders.filter(o => o.status === 'created' || o.status === 'pending').length,
    dispatched: orders.filter(o => o.status === 'dispatched').length,
    in_transit: orders.filter(o => o.status === 'in_transit').length,
    delivered: history.filter(o => o.status === 'delivered').length
  };

  return res.json({ ok: true, orders: all, stats });
});

// GET /api/customers - List & Stats
app.get('/api/customers', (req, res) => {
  const customers = DB.db.customers.profiles;
  const invoices = DB.db.customers.invoices;

  // Calculate total revenue from invoices
  const revenue = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
  // Calculate outstanding balance (mock: sum of balances in profiles)
  const outstanding = customers.reduce((acc, c) => acc + (c.balance || 0), 0);

  const stats = {
    total_count: customers.length,
    active_count: customers.filter(c => c.status !== 'inactive').length,
    total_revenue: revenue,
    avg_order_value: invoices.length > 0 ? Math.round(revenue / invoices.length) : 0,
    outstanding_balance: outstanding
  };

  return res.json({ ok: true, customers, stats });
});

// GET /api/fleet/stats - Fleet Dashboard Stats
app.get('/api/fleet/stats', (req, res) => {
  const vehicles = DB.db.fleet.vehicles;
  const drivers = DB.db.fleet.drivers;

  const stats = {
    total_vehicles: vehicles.length,
    available_vehicles: vehicles.filter(v => v.status === 'available').length,
    in_transit: vehicles.filter(v => v.status === 'in_transit').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    total_drivers: drivers.length,
    available_drivers: drivers.filter(d => d.status === 'available').length
  };
  return res.json({ ok: true, stats });
});


// --- Trade Finance Routes ---
app.get('/api/trade/lcs', tradeFinanceApi.getLCs);
app.post('/api/trade/lcs', tradeFinanceApi.createLC);
app.put('/api/trade/lcs/:id/status', tradeFinanceApi.updateLCStatus);

// --- Compliance & Export Routes ---
app.get('/api/customs/gate-passes', complianceApi.getGatePasses);
app.post('/api/customs/gate-passes', complianceApi.createGatePass);
app.get('/api/customs/documents', complianceApi.getDocuments);
app.put('/api/customs/documents/:id', complianceApi.uploadDocument);

// OCR Routes
const ocr = require('./ocr');

app.post('/api/customs/ocr/scan', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const text = await ocr.recognizeBuffer(req.file.buffer);
    const extracted = ocr.extractDetails(text);

    // Mock enhancement if Tesseract fails locally or for demo
    if (!extracted.bl_number) {
      // If filename has BL info, use it (Demo Trick)
      if (req.file.originalname.includes('BL_')) extracted.bl_number = 'OSLU12345678';
    }

    res.json({ text_preview: text.substring(0, 200), extracted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "OCR Failed" });
  }
});

app.post('/api/manifests/verify', (req, res) => {
  const { manifest_id, gd_id } = req.body;
  // Mock lookup
  const manifest = { bl_number: 'BL123', port_code: 'KPT' }; // Replace with DB lookup
  const gd = DB.db.customs.declarations.find(d => d.id === gd_id);

  if (!gd) return res.status(404).json({ error: "GD not found" });

  // Use verification logic
  const { verifyManifestAgainstGD } = require('./manifest_engine');
  const result = verifyManifestAgainstGD(manifest, gd);

  res.json(result);
});

const trackingApi = require('./tracking_api'); // Tracking Module
const inventoryApi = require('./inventory_api'); // Inventory Module
const authApi = require('./auth_api'); // Auth Module
const notificationsApi = require('./notifications_api'); // Notifications Module
const fleetApi = require('./fleet_api'); // Fleet Module

// --- Auth Routes ---
app.use('/api/auth', authApi);

// --- Notification Routes ---
app.use('/api/notifications', notificationsApi);

// --- Fleet Routes ---
app.use('/api/fleet', fleetApi);

// --- Tracking Module Routes ---
app.get('/api/tracking/analytics', trackingApi.getTrackingAnalytics); // Specific route first
app.get('/api/tracking/:id', trackingApi.getTrackingHistory);
app.post('/api/tracking/events', trackingApi.addTrackingEvent);

// --- Inventory Module Routes ---
app.get('/api/inventory/dashboard', inventoryApi.getDashboardStats);
app.get('/api/inventory/items', inventoryApi.getItems);
app.get('/api/inventory/items/:sku', inventoryApi.getItemDetails);
app.post('/api/inventory/movements', inventoryApi.createMovement);

// --- Import & Export Modules ---
app.get('/api/imports/indents', importExportApi.getIndents);
app.post('/api/imports/indents', importExportApi.createIndent);
app.get('/api/imports/stats', importExportApi.getImportStats);

app.get('/api/exports/bookings', importExportApi.getBookings);
app.post('/api/exports/bookings', importExportApi.createBooking);
app.get('/api/exports/stats', importExportApi.getExportStats);
// -----------------------------

const port = process.env.PORT || 4000;

// Only listen when running locally (not in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
  // Final Start
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
