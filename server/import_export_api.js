
/**
 * Import & Export API
 * Handles Indents (Imports) and CRO Bookings (Exports).
 */

const DB = require('./db');
const { createClient } = require('@supabase/supabase-js');

// Env setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// --- Imports (Indents) ---

async function getIndents(req, res) {
    // In a real app, we would fetch from Supabase 'indents' table
    // For now, return mock DB data + some initial seed if empty
    let data = DB.db.imports.indents;

    if (data.length === 0) {
        // Seed some initial data for demo
        data = [
            { id: 'IND-001', supplier: 'Tech Source ltd', origin: 'China', items: 'Electronics', value: 50000, status: 'Open', date: '2024-12-01' },
            { id: 'IND-002', supplier: 'Global Tex', origin: 'Bangladesh', items: 'Fabric', value: 12000, status: 'Shipped', date: '2024-11-20' },
        ];
        // Don't push to DB to avoid dupe on re-renders if we don't check, but here it's fine
    }

    res.json({ indents: data });
}

async function createIndent(req, res) {
    const { supplier, origin, items, value } = req.body;

    const newIndent = {
        id: `IND-${Date.now().toString().slice(-4)}`,
        supplier,
        origin,
        items,
        value: Number(value),
        status: 'Open',
        date: new Date().toISOString().split('T')[0]
    };

    DB.addIndent(newIndent);
    res.json({ indent: newIndent, message: "Indent Created" });
}

// --- Exports (Bookings) ---

async function getBookings(req, res) {
    let data = DB.db.exports.bookings;
    if (data.length === 0) {
        data = [
            { id: 'BK-001', carrier: 'Maersk', vessel: 'KINEAM', etd: '2024-12-20', containers: 2, status: 'Confirmed' },
            { id: 'BK-002', carrier: 'COSCO', vessel: 'XIN YA ZHOU', etd: '2024-12-25', containers: 5, status: 'Pending' },
        ];
    }
    res.json({ bookings: data });
}

async function createBooking(req, res) {
    const { carrier, vessel, etd, containers } = req.body;

    const newBooking = {
        id: `BK-${Date.now().toString().slice(-4)}`,
        carrier,
        vessel,
        etd,
        containers: Number(containers),
        status: 'Pending'
    };

    DB.addBooking(newBooking);
    res.json({ booking: newBooking, message: "Booking Request Sent" });
}

// Stats
async function getImportStats(req, res) {
    // Mock calculations
    res.json({
        open_indents: 12,
        on_water: 8,
        customs_holding: 3,
        duty_payable: 2400000
    });
}

async function getExportStats(req, res) {
    res.json({
        active_bookings: 18,
        gate_in: 5,
        pending_gds: 4,
        docs_completed: 142
    });
}


module.exports = {
    getIndents,
    createIndent,
    getBookings,
    createBooking,
    getImportStats,
    getExportStats
};
