const express = require('express');
const router = express.Router();
const { db } = require('./db');
const { differenceInDays, parseISO, addDays } = require('date-fns');

// --- Helpers ---

// Calculate cost based on days elapsed and rule slabs
function calculateCost(daysElapsed, rule) {
    if (!daysElapsed || daysElapsed <= rule.free_days) return { total: 0, breakdown: [] };

    let totalCost = 0;
    const breakdown = [];
    let remainingDays = daysElapsed - rule.free_days;
    let currentDay = rule.free_days + 1;

    // Iterate slabs
    for (const slab of rule.slabs) {
        if (remainingDays <= 0) break;

        // Determine days in this slab
        // slab.to can be very high (1000) for "rest"
        const slabRange = (slab.to - slab.from) + 1;
        const daysInSlab = Math.min(remainingDays, slabRange);

        if (daysInSlab > 0) {
            const cost = daysInSlab * slab.rate;
            totalCost += cost;
            breakdown.push({
                days: daysInSlab,
                rate: slab.rate,
                cost: cost,
                desc: `Days ${slab.from}-${Math.min(slab.to, currentDay + daysInSlab - 1)}`
            });

            remainingDays -= daysInSlab;
            currentDay += daysInSlab;
        }
    }

    return { total: totalCost, breakdown };
}

// --- Routes ---

// GET /api/dnd/cycles (Active Containers)
router.get('/cycles', (req, res) => {
    try {
        const cycles = db.dnd.container_cycles;

        // Enrich with calculated estimates
        const enriched = cycles.map(cycle => {
            const now = new Date();
            let demurrageCost = { total: 0, breakdown: [] };
            let detentionCost = { total: 0, breakdown: [] };
            let daysDemurrage = 0;
            let daysDetention = 0;

            // 1. Calculate Demurrage
            const discharge = parseISO(cycle.discharge_date);
            const gateOut = cycle.gate_out ? parseISO(cycle.gate_out) : now;

            // Demurrage clock runs from Discharge until Gate Out (or Now)
            daysDemurrage = differenceInDays(gateOut, discharge) + 1; // Inclusive

            const demRule = db.dnd.rules.find(r => r.entity_id === cycle.terminal_id && r.type === 'demurrage');
            if (demRule) {
                demurrageCost = calculateCost(daysDemurrage, demRule);
            }

            // 2. Calculate Detention
            if (cycle.gate_out) {
                const returnDate = cycle.empty_return ? parseISO(cycle.empty_return) : now;
                // Detention clock runs from Gate Out until Empty Return (or Now)
                daysDetention = differenceInDays(returnDate, parseISO(cycle.gate_out)) + 1;

                const detRule = db.dnd.rules.find(r => r.entity_id === cycle.shipping_line_id && r.type === 'detention');
                if (detRule) {
                    detentionCost = calculateCost(daysDetention, detRule);
                }
            }

            return {
                ...cycle,
                stats: {
                    days_demurrage: daysDemurrage,
                    days_detention: daysDetention,
                    demurrage_cost: demurrageCost.total,
                    detention_cost: detentionCost.total,
                    currency: demRule?.currency || 'PKR'
                }
            };
        });

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/dnd/rules
router.get('/rules', (req, res) => {
    res.json(db.dnd.rules);
});

// POST /api/dnd/calculate (Simulator)
router.post('/calculate', (req, res) => {
    try {
        const { terminal_id, shipping_line_id, discharge_date, gate_out_date, empty_return_date } = req.body;

        let demurrage = { total: 0, breakdown: [] };
        let detention = { total: 0, breakdown: [] };

        // 1. Demurrage
        if (terminal_id && discharge_date) {
            const discharge = parseISO(discharge_date);
            const gateOut = gate_out_date ? parseISO(gate_out_date) : new Date();
            const days = differenceInDays(gateOut, discharge) + 1;

            const rule = db.dnd.rules.find(r => r.entity_id === terminal_id && r.type === 'demurrage');
            if (rule) demurrage = calculateCost(days, rule);
        }

        // 2. Detention
        if (shipping_line_id && gate_out_date) {
            const gateOut = parseISO(gate_out_date);
            const returnDate = empty_return_date ? parseISO(empty_return_date) : new Date();
            const days = differenceInDays(returnDate, gateOut) + 1;

            const rule = db.dnd.rules.find(r => r.entity_id === shipping_line_id && r.type === 'detention');
            if (rule) detention = calculateCost(days, rule);
        }

        res.json({
            demurrage,
            detention,
            total: demurrage.total + detention.total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
