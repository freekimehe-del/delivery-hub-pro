/**
 * Inventory Management API
 * Handles deep inventory logic: Multi-location, Stock Types, and Movements.
 */
const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');

// Helper: Get consolidated stock for an SKU
const getStockSummary = (sku) => {
    const records = db.inventory.stock.filter(s => s.sku === sku);
    return records.reduce((acc, r) => ({
        available: acc.available + (r.quantities?.available || 0),
        reserved: acc.reserved + (r.quantities?.reserved || 0),
        damaged: acc.damaged + (r.quantities?.damaged || 0),
    }), { available: 0, reserved: 0, damaged: 0 });
};

module.exports = {
    // GET /api/inventory/dashboard
    getDashboardStats: (req, res) => {
        const totalSKUs = db.inventory.items.length;
        const totalValue = db.inventory.items.reduce((sum, item) => {
            const stock = getStockSummary(item.id);
            return sum + (stock.available * item.price);
        }, 0);

        // Alerts
        const lowStock = db.inventory.items.filter(item => {
            const stock = getStockSummary(item.id);
            return stock.available < item.safety_stock;
        }).length;

        // Top Movers (Mock logic based on movement count)
        const topMovers = db.inventory.items.slice(0, 5).map(item => ({
            sku: item.id,
            name: item.name,
            sold: Math.floor(Math.random() * 200) // Mock
        }));

        res.json({
            metrics: {
                total_skus: totalSKUs,
                stock_value: totalValue,
                turnover_rate: 4.2, // Mock
                low_stock_alerts: lowStock
            },
            top_movers: topMovers,
            recent_movements: db.inventory.movements.slice(-5).reverse()
        });
    },

    // GET /api/inventory/items
    getItems: (req, res) => {
        const { search, category } = req.query;
        let items = db.inventory.items.map(item => ({
            ...item,
            stock: getStockSummary(item.id)
        }));

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
        }
        if (category && category !== 'all') {
            items = items.filter(i => i.category === category);
        }

        res.json(items);
    },

    // GET /api/inventory/items/:sku
    getItemDetails: (req, res) => {
        const { sku } = req.params;
        const item = db.inventory.items.find(i => i.id === sku);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        const stockRecords = db.inventory.stock.filter(s => s.sku === sku);
        const movements = db.inventory.movements.filter(m => m.sku === sku).reverse();

        res.json({
            ...item,
            stock_breakdown: stockRecords, // Per warehouse/location
            movements: movements
        });
    },

    // POST /api/inventory/movements (GRN, Transfer, Pick)
    createMovement: (req, res) => {
        const { type, sku, qty, warehouse_id, ref, location } = req.body;

        // 1. Log Movement
        const movement = {
            id: uuidv4(),
            date: new Date().toISOString(),
            type, // RECEIPT, PICK, TRANSFER, ADJUSTMENT
            sku,
            qty: Number(qty),
            ref,
            warehouse_id
        };
        db.inventory.movements.push(movement);

        // 2. Update Stock Ledger
        let stockRecord = db.inventory.stock.find(s => s.sku === sku && s.warehouse_id === warehouse_id);

        if (!stockRecord) {
            // Create new record if receiving
            if (type === 'RECEIPT' || type === 'ADJUSTMENT') {
                stockRecord = {
                    id: uuidv4(),
                    sku,
                    warehouse_id,
                    quantities: { available: 0, reserved: 0, damaged: 0 },
                    locations: []
                };
                db.inventory.stock.push(stockRecord);
            } else {
                return res.status(400).json({ error: "Stock record not found for this warehouse" });
            }
        }

        // Apply Logic
        if (type === 'RECEIPT') {
            stockRecord.quantities.available += Number(qty);
            // Add to default location if provided
            if (location) {
                const loc = stockRecord.locations.find(l => l.zone === location.zone && l.bin === location.bin);
                if (loc) loc.qty += Number(qty);
                else stockRecord.locations.push({ ...location, qty: Number(qty) });
            }
        } else if (type === 'PICK' || type === 'SHIPMENT') {
            stockRecord.quantities.available -= Number(qty); // Assumes simple deduction
            // In real world, we'd deduct 'reserved' if it was allocated
        }

        res.json({ success: true, movement, new_stock: stockRecord.quantities });
    }
};
