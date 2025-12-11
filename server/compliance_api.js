/**
 * Compliance & Export API
 * Handles Export Gate Passes (entering port) and PSW Document requirements.
 */

const { createClient } = require('@supabase/supabase-js');

// Env setup (reused)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Mock Data
let gatePasses = [
    {
        id: 'gp_1',
        pass_number: 'GP-KPT-001',
        gd_number: 'KAP-EX-99283',
        vehicle_number: 'TLA-921',
        driver_cnic: '42101-1234567-1',
        no_of_packages: 400,
        status: 'entered', // generated, entered, exited
        created_at: '2024-12-05T10:00:00Z'
    }
];

let documents = [
    {
        id: 'doc_1',
        name: 'Phytosanitary Certificate',
        type: 'regulatory',
        reference: 'PHYTO-PK-2024-001',
        status: 'verified', // pending, uploaded, verified, rejected
        expiry_date: '2025-01-01'
    },
    {
        id: 'doc_2',
        name: 'Certificate of Origin',
        type: 'regulatory',
        reference: '',
        status: 'pending',
        expiry_date: ''
    }
];

// --- Gate Pass Functions ---

async function getGatePasses(req, res) {
    if (supabase) {
        const { data, error } = await supabase.from('customs_gate_passes').select('*').order('created_at', { ascending: false });
        if (!error && data) return res.json({ gate_passes: data });
    }
    res.json({ gate_passes: gatePasses });
}

const DB = require('./db'); // Access mock DB for GD status check

async function createGatePass(req, res) {
    const { gd_number, vehicle_number, driver_cnic, driver_name, no_of_packages } = req.body;

    // 1. Verify GD Status (Smart Gate Pass)
    // In real app: Supabase lookup. Here: Mock DB.
    // We expect gd_number to match declaration ID or a new field 'sys_id'
    // For demo, we check if GD exists and if it is 'assessed' or 'cleared'
    // Defaulting to allow if 'status' isn't stricter in our mock yet, but we will enforce existence.

    const gd = DB.db.customs.declarations.find(d => d.id === gd_number || d.sys_id === gd_number);

    // STRICT CHECK: For demo purposes, we will assume if it exists, it's okay, UNLESS it's explicitly 'rejected'
    // In production, this would be: if (gd.status !== 'cleared') ...
    if (!gd) {
        return res.status(404).json({ error: "GD Not Found. Gate Pass Denied." });
    }

    // Simulate "Hold"
    if (gd.status === 'examination_required') {
        return res.status(400).json({ error: "GD is marked for Examination. Gate Pass Denied." });
    }

    const newPass = {
        id: `gp_${Date.now()}`,
        pass_number: `GP-PQA-${Math.floor(Math.random() * 10000)}`, // Simulate Port Qasim ID
        gd_number,
        vehicle_number,
        driver_cnic,
        driver_name,
        no_of_packages,
        status: 'generated',
        created_at: new Date().toISOString()
    };

    if (supabase) {
        const { data, error } = await supabase.from('customs_gate_passes').insert(newPass).select();
        if (!error && data) return res.json({ gate_pass: data[0] });
    }

    gatePasses.unshift(newPass);
    res.json({ gate_pass: newPass, message: "Gate Pass Generated" });
}

// --- Document Functions ---

async function getDocuments(req, res) {
    // In real app, filter by Consignment ID or Job ID
    if (supabase) {
        const { data, error } = await supabase.from('customs_documents').select('*');
        if (!error && data) return res.json({ documents: data });
    }
    res.json({ documents });
}

async function uploadDocument(req, res) {
    const { id } = req.params; // Document ID (if updating) or create new
    // This is a metadata update mock. File upload would handle binary data separately.

    const { reference, status } = req.body;

    const docIndex = documents.findIndex(d => d.id === id);
    if (docIndex > -1) {
        documents[docIndex].reference = reference || documents[docIndex].reference;
        documents[docIndex].status = status || 'uploaded';
        return res.json({ document: documents[docIndex] });
    }

    res.status(404).json({ error: "Document not found" });
}

module.exports = {
    getGatePasses,
    createGatePass,
    getDocuments,
    uploadDocument
};
