const express = require('express');
const router = express.Router();
const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');

// --- Fuel Management ---

router.get('/fuel', (req, res) => {
    try {
        const logs = db.fleet.fuelLogs.map(l => {
            const vehicle = db.fleet.vehicles.find(v => v.id === l.vehicle_id);
            return { ...l, vehicle };
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/fuel', (req, res) => {
    try {
        const log = {
            id: `FL-${Date.now()}`,
            fueled_at: new Date().toISOString(),
            ...req.body
        };
        db.fleet.fuelLogs.push(log);

        // Update vehicle fuel level (simplified logic)
        if (req.body.full_tank) {
            const vehicle = db.fleet.vehicles.find(v => v.id === req.body.vehicle_id);
            if (vehicle) vehicle.fuel_level = 100;
        }

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/fuel/:id', (req, res) => {
    try {
        const { id } = req.params;
        const index = db.fleet.fuelLogs.findIndex(l => l.id === id);
        if (index === -1) return res.status(404).json({ error: "Log not found" });

        db.fleet.fuelLogs.splice(index, 1);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Routes Management ---

// GET /api/fleet/routes - Get all routes
router.get('/routes', (req, res) => {
    try {
        const routes = db.fleet.routes.map(r => {
            // Hydrate vehicle and driver info
            const vehicle = db.fleet.vehicles.find(v => v.id === r.vehicle_id);
            const driver = db.fleet.drivers.find(d => d.id === r.driver_id);
            return { ...r, vehicle, driver };
        });
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/fleet/routes - Create new route
router.post('/routes', (req, res) => {
    try {
        const { name, vehicle_id, driver_id, stops } = req.body;
        if (!name || !vehicle_id || !driver_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newRoute = {
            id: `R-${Date.now()}`,
            name,
            vehicle_id,
            driver_id,
            status: 'scheduled',
            date: new Date().toISOString().split('T')[0],
            stops: stops || [] // Array of orders
        };

        db.fleet.routes.push(newRoute);

        // Update Vehicle Status
        const vehicle = db.fleet.vehicles.find(v => v.id === vehicle_id);
        if (vehicle) vehicle.status = 'scheduled';

        // Update Driver Status
        const driver = db.fleet.drivers.find(d => d.id === driver_id);
        if (driver) driver.status = 'assigned';

        res.status(201).json(newRoute);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/fleet/routes/:id/status - Update route status
router.put('/routes/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const route = db.fleet.routes.find(r => r.id === id);

        if (!route) return res.status(404).json({ error: "Route not found" });

        route.status = status;

        // If completed, free up resources
        if (status === 'completed') {
            const vehicle = db.fleet.vehicles.find(v => v.id === route.vehicle_id);
            if (vehicle) vehicle.status = 'available';

            const driver = db.fleet.drivers.find(d => d.id === route.driver_id);
            if (driver) driver.status = 'available';
        }

        res.json(route);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Resources (Vehicles/Drivers) ---

// --- Maintenance Management ---

router.get('/maintenance', (req, res) => {
    try {
        const records = db.fleet.maintenance.map(r => {
            const vehicle = db.fleet.vehicles.find(v => v.id === r.vehicle_id);
            return { ...r, vehicle };
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/maintenance', (req, res) => {
    try {
        const record = {
            id: `M-${Date.now()}`,
            ...req.body,
            status: req.body.status || 'pending',
            created_at: new Date().toISOString()
        };
        db.fleet.maintenance.push(record);

        // Update vehicle status if maintenance is active
        if (['in_progress', 'scheduled'].includes(record.status)) {
            const vehicle = db.fleet.vehicles.find(v => v.id === record.vehicle_id);
            if (vehicle) vehicle.status = 'maintenance';
        }

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/maintenance/:id', (req, res) => {
    try {
        const { id } = req.params;
        const index = db.fleet.maintenance.findIndex(m => m.id === id);
        if (index === -1) return res.status(404).json({ error: "Record not found" });

        db.fleet.maintenance[index] = { ...db.fleet.maintenance[index], ...req.body };

        // If completed, check if other active maintenance exists for this vehicle, else set to available
        const record = db.fleet.maintenance[index];
        if (record.status === 'completed') {
            const activeMaint = db.fleet.maintenance.find(m => m.vehicle_id === record.vehicle_id && ['in_progress', 'scheduled'].includes(m.status));
            if (!activeMaint) {
                const vehicle = db.fleet.vehicles.find(v => v.id === record.vehicle_id);
                if (vehicle) vehicle.status = 'available';
            }
        }

        res.json(db.fleet.maintenance[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/maintenance/:id', (req, res) => {
    try {
        const { id } = req.params;
        const index = db.fleet.maintenance.findIndex(m => m.id === id);
        if (index === -1) return res.status(404).json({ error: "Record not found" });

        db.fleet.maintenance.splice(index, 1);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Resources (Vehicles) ---

router.get('/vehicles', (req, res) => res.json(db.fleet.vehicles));

router.post('/vehicles', (req, res) => {
    try {
        const vehicle = {
            id: `V-00${db.fleet.vehicles.length + 1}`,
            ...req.body,
            status: req.body.status || 'available',
            created_at: new Date().toISOString()
        };
        db.fleet.vehicles.push(vehicle);
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/vehicles/:id', (req, res) => {
    try {
        const { id } = req.params;
        const index = db.fleet.vehicles.findIndex(v => v.id === id);
        if (index === -1) return res.status(404).json({ error: "Vehicle not found" });

        db.fleet.vehicles[index] = { ...db.fleet.vehicles[index], ...req.body };
        res.json(db.fleet.vehicles[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/vehicles/:id', (req, res) => {
    try {
        const { id } = req.params;
        const index = db.fleet.vehicles.findIndex(v => v.id === id);
        if (index === -1) return res.status(404).json({ error: "Vehicle not found" });

        db.fleet.vehicles.splice(index, 1);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/drivers', (req, res) => res.json(db.fleet.drivers));

module.exports = router;
