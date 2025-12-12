const express = require('express');
const router = express.Router();
const { db, addNotification } = require('./db');

// --- Helpers ---
const getTransitShipment = (id) => db.transit.shipments.find(s => s.id === id);

// --- Routes ---

// GET /api/transit/shipments
router.get('/shipments', (req, res) => {
    try {
        const { type, status } = req.query;
        let data = db.transit.shipments;

        if (type) data = data.filter(d => d.type === type);
        if (status) data = data.filter(d => d.status === status);

        // Enrich with Route and Carrier Name
        const enriched = data.map(s => {
            const route = db.transit.routes.find(r => r.id === s.route_id);
            const carrier = db.transit.carriers.find(c => c.id === s.carrier_id);
            return { ...s, route_name: route?.name, carrier_name: carrier?.name };
        });

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/transit/shipments/:id
router.get('/shipments/:id', (req, res) => {
    try {
        const { id } = req.params;
        const shipment = getTransitShipment(id);

        if (!shipment) return res.status(404).json({ error: "Shipment not found" });

        // Enrich
        const route = db.transit.routes.find(r => r.id === shipment.route_id);
        const carrier = db.transit.carriers.find(c => c.id === shipment.carrier_id);
        const logs = db.transit.activity_logs.filter(l => l.shipment_id === id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({ ...shipment, route, carrier, logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/transit/shipments (Create GD Entry)
router.post('/shipments', (req, res) => {
    try {
        const { gd_number, type, customer_name, container_no, bl_number, route_id, carrier_id } = req.body;

        if (!gd_number || !type) return res.status(400).json({ error: "GD Number and Type are required" });

        const newShipment = {
            id: `TS-${Date.now()}`,
            gd_number, type, customer_name, container_no, bl_number, route_id, carrier_id,
            status: 'port_arrival',
            weboc_status: 'GD Filed',
            current_location: 'Karachi Port',
            created_at: new Date().toISOString()
        };

        db.transit.shipments.push(newShipment);
        addNotification({
            id: Date.now(),
            title: 'New Transit Shipment',
            message: `GD ${gd_number} filed for ${customer_name}`,
            type: 'info',
            time: 'Just now'
        });

        res.status(201).json(newShipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/transit/shipments/:id/checkpoint (Update Location/Checkpoints)
router.put('/shipments/:id/checkpoint', (req, res) => {
    try {
        const { id } = req.params;
        const { location, status, remarks } = req.body;

        const shipment = getTransitShipment(id);
        if (!shipment) return res.status(404).json({ error: "Shipment not found" });

        shipment.current_location = location;
        if (status) shipment.status = status;

        // Log activity
        const log = {
            id: `LOG-${Date.now()}`,
            shipment_id: id,
            location,
            status_update: status,
            remarks,
            timestamp: new Date().toISOString()
        };
        db.transit.activity_logs.push(log);

        res.json(shipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/transit/shipments/:id/customs (WeBOC integration)
router.post('/shipments/:id/customs', (req, res) => {
    try {
        const { id } = req.params;
        const { weboc_status } = req.body;

        const shipment = getTransitShipment(id);
        if (!shipment) return res.status(404).json({ error: "Shipment not found" });

        shipment.weboc_status = weboc_status;
        res.json({ success: true, weboc_status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/transit/stats (Dashboard)
router.get('/stats', (req, res) => {
    try {
        const total = db.transit.shipments.length;
        const att = db.transit.shipments.filter(s => s.type === 'afghan_transit').length;
        const transshipment = db.transit.shipments.filter(s => s.type === 'transshipment').length;
        const at_border = db.transit.shipments.filter(s => ['border_arrival', 'in_transit'].includes(s.status)).length;
        const delayed = db.transit.shipments.filter(s => s.status === 'hold').length;

        res.json({ total, att, transshipment, at_border, delayed });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
