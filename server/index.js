const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const upload = multer();
const app = express();
app.use(cors());
app.use(express.json());

// Centralized DB & Engines
const DB = require('./db'); // The new "Brain"
const { generateManifestNumber, validateManifest } = require('./manifest_engine');
const financeAPI = require('./finance_api'); // Finance Module
// The following container engine imports are no longer directly used for API logic,
// as the DB now manages container state directly.
// const { getContainerStats, logReturn, scheduleMaintenance, getAllContainers } = require('./container_engine');

// In-memory store (mock) - These are now managed by DB.js
app.post('/api/finance/payments', financeAPI.recordPayment);
app.get('/api/finance/ledger/accounts', financeAPI.getChartOfAccounts);
app.get('/api/finance/ledger/entries', financeAPI.getJournalEntries);
app.post('/api/finance/ledger/entries', financeAPI.createJournalEntry);
app.get('/api/finance/dashboard', financeAPI.getDashboardMetrics);
app.get('/api/finance/settlements', financeAPI.getDriverSettlements);
app.post('/api/finance/settlements/process', financeAPI.processDriverSettlement);
app.get('/api/finance/fleet-costs', financeAPI.getFleetCosts);
app.post('/api/finance/fleet-costs', financeAPI.recordFleetCost);
app.post('/api/finance/rates/calculate', financeAPI.estimateShipmentCost);

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

// GET /api/pods/:manifest_id - Get PODs for a manifest
app.get('/api/pods/:manifest_id', (req, res) => {
  const { manifest_id } = req.params;
  const relatedPods = Object.values(DB.db.logistics.pods).filter(p => p.manifest_id === manifest_id);
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

// POST /api/containers/return - Log a return
app.post('/api/containers/return', (req, res) => {
  // Update DB directly for now
  const { container_id, location, condition } = req.body;
  const container = DB.db.logistics.containers.find(c => c.id === container_id);
  if (container) {
    container.status = 'returned';
    container.location = location;
  }
  return res.json({ ok: true, container });
});

// POST /api/containers/maintenance - Schedule maintenance
app.post('/api/containers/maintenance', (req, res) => {
  const { container_id } = req.body;
  const container = DB.db.logistics.containers.find(c => c.id === container_id);
  if (container) {
    container.status = 'maintenance';
  }
  return res.json({ ok: true, container });
});

// --- Phase 3: Analytics ---
app.get('/api/analytics/advanced', (req, res) => {
  // Calculate real-ish metrics based on DB
  const totalInvoices = DB.db.customers.invoices.reduce((acc, inv) => acc + inv.amount, 0);

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

// --- Phase 7: Customs Clearance Module ---
const CustomsEngine = require('./customs_engine');

// GET /api/customs/declarations - List
app.get('/api/customs/declarations', (req, res) => {
  return res.json({ ok: true, declarations: DB.db.customs.declarations });
});

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
app.post('/api/customs/calculate-duty', (req, res) => {
  const { items } = req.body;
  let totalDuty = 0;
  let breakdown = { customs_duty: 0, add_customs_duty: 0, sales_tax: 0, income_tax: 0 };

  items.forEach(item => {
    const res = CustomsEngine.calculateDuty(item.hs_code, Number(item.value));
    totalDuty += res.total;
    breakdown.customs_duty += res.breakdown.customs_duty;
    breakdown.add_customs_duty += res.breakdown.add_customs_duty;
    breakdown.sales_tax += res.breakdown.sales_tax;
    breakdown.income_tax += res.breakdown.income_tax;
  });

  return res.json({ ok: true, total: totalDuty, breakdown });
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


const port = process.env.PORT || 4000;

// Only listen when running locally (not in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
  app.listen(port, () => console.log(`Mock API server running on http://localhost:${port}`));
}

// Export for Vercel serverless
module.exports = app;
