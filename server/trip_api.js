const express = require('express');
const router = express.Router();
const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');

// Helper to check if Supabase is configured (Runtime check)
const hasSupabase = !!((process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) && (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY));

// If Supabase is available, we would import the client here.
// For now, we will focus on the Mock DB implementation to ensure "run software" works immediately.
// The SQL file provided earlier allows the user to migrate when ready.

// --- Trip CRUD ---

// GET /api/fleet/trips
router.get('/trips', (req, res) => {
    try {
        const trips = db.fleet.trips.map(trip => {
            const vehicle = db.fleet.vehicles.find(v => v.id === trip.vehicle_id);
            const driver = db.fleet.drivers.find(d => d.id === trip.driver_id);
            // Calculate stops count
            const stopsCount = db.fleet.tripStops.filter(s => s.trip_id === trip.id).length;
            return { ...trip, vehicle, driver, stops_count: stopsCount };
        });
        res.json({ ok: true, trips });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// GET /api/fleet/trips/:id
router.get('/trips/:id', (req, res) => {
    try {
        const { id } = req.params;
        const trip = db.fleet.trips.find(t => t.id === id);
        if (!trip) return res.status(404).json({ ok: false, error: "Trip not found" });

        const vehicle = db.fleet.vehicles.find(v => v.id === trip.vehicle_id);
        const driver = db.fleet.drivers.find(d => d.id === trip.driver_id);
        const stops = db.fleet.tripStops.filter(s => s.trip_id === trip.id).sort((a, b) => a.sequence_number - b.sequence_number);
        const expenses = db.fleet.tripExpenses.filter(e => e.trip_id === trip.id);
        const fuelLogs = db.fleet.fuelLogs.filter(f => f.trip_id === trip.id);

        res.json({ ok: true, trip: { ...trip, vehicle, driver, stops, expenses, fuel_logs: fuelLogs } });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// POST /api/fleet/trips
router.post('/trips', (req, res) => {
    try {
        const { vehicle_id, driver_id, origin, destination, start_time, instructions } = req.body;

        if (!vehicle_id || !driver_id || !origin || !destination) {
            return res.status(400).json({ ok: false, error: "Missing required fields" });
        }

        const newTrip = {
            id: uuidv4(),
            trip_number: `TRP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            vehicle_id,
            driver_id,
            origin_location: origin,
            destination_location: destination,
            start_time: start_time || new Date().toISOString(),
            status: 'planned',
            instructions,
            total_distance_km: 0,
            created_at: new Date().toISOString()
        };

        db.fleet.trips.push(newTrip);

        // Update Vehicle/Driver Status
        const vehicle = db.fleet.vehicles.find(v => v.id === vehicle_id);
        if (vehicle) vehicle.status = 'scheduled';

        const driver = db.fleet.drivers.find(d => d.id === driver_id);
        if (driver) driver.status = 'assigned';

        res.status(201).json({ ok: true, trip: newTrip });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// PUT /api/fleet/trips/:id/status
router.put('/trips/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const trip = db.fleet.trips.find(t => t.id === id);
        if (!trip) return res.status(404).json({ ok: false, error: "Trip not found" });

        trip.status = status;
        trip.updated_at = new Date().toISOString();

        if (status === 'completed' || status === 'cancelled') {
            // Free up resources
            const vehicle = db.fleet.vehicles.find(v => v.id === trip.vehicle_id);
            if (vehicle) vehicle.status = 'available';

            const driver = db.fleet.drivers.find(d => d.id === trip.driver_id);
            if (driver) driver.status = 'available';
        } else if (status === 'in_transit') {
            const vehicle = db.fleet.vehicles.find(v => v.id === trip.vehicle_id);
            if (vehicle) vehicle.status = 'in_transit';
        }

        res.json({ ok: true, trip });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// --- Stops Management ---

// POST /api/fleet/trips/:id/stops
router.post('/trips/:id/stops', (req, res) => {
    try {
        const { id } = req.params;
        const { location_name, stop_type, sequence_number, address, notes } = req.body;

        const stop = {
            id: uuidv4(),
            trip_id: id,
            location_name,
            stop_type, // 'pickup', 'dropoff', 'fuel', 'rest'
            sequence_number: sequence_number || db.fleet.tripStops.filter(s => s.trip_id === id).length + 1,
            address,
            status: 'pending',
            notes,
            created_at: new Date().toISOString()
        };

        db.fleet.tripStops.push(stop);
        res.status(201).json({ ok: true, stop });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// PUT /api/fleet/stops/:stopId
router.put('/stops/:stopId', (req, res) => {
    try {
        const { stopId } = req.params;
        const updates = req.body;

        const stop = db.fleet.tripStops.find(s => s.id === stopId);
        if (!stop) return res.status(404).json({ ok: false, error: "Stop not found" });

        Object.assign(stop, updates);
        res.json({ ok: true, stop });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// --- Expenses & Fuel ---

// POST /api/fleet/trips/:id/expenses
router.post('/trips/:id/expenses', (req, res) => {
    try {
        const { id } = req.params;
        const { expense_type, amount, description } = req.body;

        const expense = {
            id: uuidv4(),
            trip_id: id,
            expense_type,
            amount: Number(amount),
            description,
            created_at: new Date().toISOString()
        };

        db.fleet.tripExpenses.push(expense);
        res.status(201).json({ ok: true, expense });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// POST /api/fleet/trips/:id/fuel
router.post('/trips/:id/fuel', (req, res) => {
    try {
        const { id } = req.params;
        const { liters, cost_per_liter, total_cost, odometer_reading, station_name } = req.body;

        const trip = db.fleet.trips.find(t => t.id === id);

        const fuelLog = {
            id: uuidv4(),
            trip_id: id,
            vehicle_id: trip ? trip.vehicle_id : null,
            driver_id: trip ? trip.driver_id : null,
            liters: Number(liters),
            cost_per_liter: Number(cost_per_liter),
            total_cost: Number(total_cost),
            odometer_reading: Number(odometer_reading),
            station_name,
            created_at: new Date().toISOString()
        };

        db.fleet.fuelLogs.push(fuelLog);

        // Update vehicle fuel level (simulated logic)
        if (trip) {
            const vehicle = db.fleet.vehicles.find(v => v.id === trip.vehicle_id);
            if (vehicle) {
                vehicle.fuel_level = 100; // Reset to full if assumed full tank, or estimate
            }
        }

        res.status(201).json({ ok: true, log: fuelLog });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

module.exports = router;
