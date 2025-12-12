const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, addDeclaration, updateDeclarationStatus, addDuty } = require('./db');

// --- Helper: Mock Duty Rates ---
const HS_DUTY_MAP = {
    // Electronics
    '8517.12': { cd: 11, st: 18, acd: 2, rd: 0, it: 6, desc: 'Mobile Phones' },
    '8528.72': { cd: 20, st: 18, acd: 6, rd: 10, it: 6, desc: 'LED TV' },
    // Vehicles
    '8703.23': { cd: 35, st: 18, acd: 7, rd: 30, it: 12, desc: 'Pass. Car > 1500cc' },
    // Textiles
    '5201.00': { cd: 0, st: 0, acd: 0, rd: 0, it: 1, desc: 'Raw Cotton' },
    // Default
    'DEFAULT': { cd: 20, st: 18, acd: 2, rd: 0, it: 6, desc: 'General Goods' }
};

// --- API Routes ---

// 1. Get All GDs
router.get('/', (req, res) => {
    try {
        const list = db.customs.declarations || [];
        res.json({ ok: true, gds: list });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// 2. Get Single GD
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const gd = db.customs.declarations.find(x => x.id === id || x.gd_number === id);
        if (!gd) return res.status(404).json({ ok: false, error: 'GD Not Found' });
        res.json({ ok: true, gd });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// 3. Create GD (Draft)
router.post('/', (req, res) => {
    try {
        const payload = req.body;

        // Generate Identifiers
        const id = uuidv4();
        const year = new Date().getFullYear();
        // Format: KAP-IM-YYYY-XXXXX (Karachi Appraisement - Import)
        const typeCode = payload.declaration_type === 'export' ? 'EX' : 'IM';
        const uniqueNum = Math.floor(10000 + Math.random() * 90000);
        const gd_number = `KAP-${typeCode}-${year}-${uniqueNum}`;

        const newGD = {
            id,
            gd_number,
            status: 'draft',
            created_at: new Date().toISOString(),
            ...payload
        };

        addDeclaration(newGD);

        // If items exist, calculate approximate duties automatically
        if (payload.items && payload.items.length > 0) {
            // Basic calculation simulation
            newGD.total_duty = payload.items.reduce((acc, item) => {
                const rates = HS_DUTY_MAP[item.hs_code] || HS_DUTY_MAP['DEFAULT'];
                // Simple formula: Value * (CD%+ST%+...)
                const totalRate = rates.cd + rates.st + rates.acd + rates.rd + rates.it;
                const itemVal = item.assessed_value_pkr || 0;
                return acc + (itemVal * (totalRate / 100));
            }, 0);
        }

        res.status(201).json({ ok: true, gd: newGD });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// 4. Calculate Duties (Simulation)
router.post('/calculate-duty', (req, res) => {
    try {
        const { hs_code, value_pkr } = req.body;
        const rateInfo = HS_DUTY_MAP[hs_code] || HS_DUTY_MAP['DEFAULT'];

        const value = Number(value_pkr || 0);

        // Waterfall Calculation (Simplified for demo, usually iterative)
        // Value for CD = Declared Value
        const cdAmt = value * (rateInfo.cd / 100);

        // Value for ST = Value + CD + ACD + RD
        // Here we just do simpler aggregate for demo speed
        const stAmt = value * (rateInfo.st / 100);
        const acdAmt = value * (rateInfo.acd / 100);
        const rdAmt = value * (rateInfo.rd / 100);
        const itAmt = value * (rateInfo.it / 100);

        const total = cdAmt + stAmt + acdAmt + rdAmt + itAmt;

        res.json({
            ok: true,
            breakdown: {
                hs_code: hs_code || 'Unknown',
                description: rateInfo.desc,
                customs_duty: cdAmt,
                sales_tax: stAmt,
                add_customs_duty: acdAmt,
                reg_duty: rdAmt,
                income_tax: itAmt,
                total_duty: total,
                rates: rateInfo
            }
        });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

module.exports = router;
