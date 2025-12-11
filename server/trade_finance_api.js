/**
 * Trade Finance API
 * Handles Letters of Credit (LC), Bank Contracts, and Import Financing.
 */

const { createClient } = require('@supabase/supabase-js');
const DB = require('./db'); // Fallback to mock DB if needed

// Prefer secure backend env vars first. Never expose service role to the client.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Mock Store for LCs if DB not connected
let mockLCs = [
    {
        id: 'lc_1',
        lc_number: 'LC-2024-001',
        bank_name: 'Bank Alfalah',
        applicant: 'ImaTech Logistics',
        beneficiary: 'Global Motors Japan',
        amount: 50000,
        currency: 'USD',
        issue_date: '2024-12-01',
        expiry_date: '2025-03-01',
        status: 'opened',
        description: 'Import of 5 Toyota Vitz Units'
    },
    {
        id: 'lc_2',
        lc_number: 'LC-2024-002',
        bank_name: 'Habib Bank Limited (HBL)',
        applicant: 'ImaTech Logistics',
        beneficiary: 'Shanghai Electronics',
        amount: 12000,
        currency: 'USD',
        issue_date: '2024-12-10',
        expiry_date: '2025-06-10',
        status: 'draft',
        description: 'Electronic Components Batch A'
    }
];

// --- API Functions ---

async function getLCs(req, res) {
    // If Supabase is connected
    if (supabase) {
        const { data, error } = await supabase.from('trade_lcs').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            return res.json({ lcs: data });
        }
        // Fallback or if table doesn't exist yet, continue to mock
    }

    // Return Mock Data
    res.json({ lcs: mockLCs });
}

async function createLC(req, res) {
    const { lc_number, bank_name, beneficiary, amount, currency, issue_date, expiry_date, description } = req.body;

    const newLC = {
        id: `lc_${Date.now()}`,
        lc_number,
        bank_name,
        applicant: 'ImaTech Logistics', // Default for now
        beneficiary,
        amount,
        currency,
        issue_date,
        expiry_date,
        status: 'draft', // Default status
        description,
        created_at: new Date().toISOString()
    };

    if (supabase) {
        const { data, error } = await supabase.from('trade_lcs').insert(newLC).select();
        if (!error && data) {
            return res.json({ lc: data[0], message: "LC Created in DB" });
        }
        console.warn("Supabase insert failed, using mock:", error?.message);
    }

    // Mock fallback
    mockLCs.unshift(newLC);
    res.json({ lc: newLC, message: "LC Created (Mock)" });
}

async function updateLCStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (supabase) {
        const { data, error } = await supabase.from('trade_lcs').update({ status }).eq('id', id).select();
        if (!error) return res.json({ lc: data[0] });
    }

    const lcIndex = mockLCs.findIndex(l => l.id === id);
    if (lcIndex > -1) {
        mockLCs[lcIndex].status = status;
        return res.json({ lc: mockLCs[lcIndex] });
    }

    res.status(404).json({ error: "LC not found" });
}

module.exports = {
    getLCs,
    createLC,
    updateLCStatus
};
