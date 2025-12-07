const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const upload = multer();
const app = express();
app.use(cors());
app.use(express.json());

// In-memory store (mock)
const shipments = {};

// POST /api/shipments - create a new shipment
app.post('/api/shipments', (req, res) => {
  const id = uuidv4();
  const { shipment_ref, type, mode, origin, destination, value } = req.body;
  const record = { id, shipment_ref: shipment_ref || `SHP-${Date.now()}`, type, mode, origin, destination, value, status: 'created', created_at: new Date().toISOString() };
  shipments[id] = record;
  return res.status(201).json(record);
});

// GET /api/shipments - list all shipments (mock)
app.get('/api/shipments', (req, res) => {
  try {
    const list = Object.values(shipments);
    return res.json({ ok: true, shipments: list });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/shipments/:id/route - return a route plan (mock)
app.get('/api/shipments/:id/route', (req, res) => {
  const { id } = req.params;
  const s = shipments[id];
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

// GET /api/rates/calculate - mock rate calculation
app.get('/api/rates/calculate', (req, res) => {
  const { mode, origin, destination, weight } = req.query;
  const base = mode === 'air' ? 0.015 : 0.005; // arbitrary per kg
  const cost = Number(weight || 1000) * base * 1000; // PKR
  return res.json({ currency: 'PKR', cost });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Mock API server running on http://localhost:${port}`));
