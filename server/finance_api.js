/**
 * Finance Module API
 * Handles General Ledger, Invoices, Bills, Payments, and Financial Reports
 */

const { createClient } = require('@supabase/supabase-js');

// Prefer secure backend env vars first. Never expose service role to the client.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// =====================================================
// INVOICES (AR)
// =====================================================

async function getInvoices(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { status, customer_id, from_date, to_date } = req.query;

    let query = supabase
        .from('invoices')
        .select(`
            *,
            customer:finance_customers(customer_name, email),
            invoice_line_items(*)
        `)
        .order('invoice_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (from_date) query = query.gte('invoice_date', from_date);
    if (to_date) query = query.lte('invoice_date', to_date);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.json({ invoices: data || [] });
}

// Helper to get unbilled shipments (Integration with Logistics)
async function getUnbilledShipments(req, res) {
    // In a real DB, we would join shipment table with invoices where invoice.shipment_id is null
    // Here we will mock it by reading from the DB module
    const DB = require('./db');

    try {
        const allShipments = Object.values(DB.db.logistics.shipments);

        // Find shipment IDs that already have an invoice
        const { data: existingInvoices } = await supabase
            .from('invoices')
            .select('shipment_id')
            .not('shipment_id', 'is', null);

        const billedShipmentIds = new Set(existingInvoices?.map(i => i.shipment_id) || []);

        const unbilled = allShipments.filter(s => !billedShipmentIds.has(s.id));

        res.json({ shipments: unbilled });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --- Customers & Vendors ---

async function getCustomers(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    let { data: customers, error } = await supabase.from('finance_customers').select('*');

    // Auto-seed if empty
    if (!error && (!customers || customers.length === 0)) {
        const seedCustomers = [
            { customer_code: 'CUST-001', customer_name: 'TechLogistics Corp', email: 'accounts@techlogistics.com' },
            { customer_code: 'CUST-002', customer_name: 'Global Exports Ltd', email: 'billing@globalexports.com' }
        ];
        const { data: seeded } = await supabase.from('finance_customers').insert(seedCustomers).select();
        customers = seeded;
    }

    if (error) return res.status(400).json({ error: error.message });
    res.json({ customers });
}

async function getVendors(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    let { data: vendors, error } = await supabase.from('finance_vendors').select('*');

    // Auto-seed if empty
    if (!error && (!vendors || vendors.length === 0)) {
        const seedVendors = [
            { vendor_code: 'VEN-001', vendor_name: 'Shell Fuel Station', email: 'sales@shell.com' },
            { vendor_code: 'VEN-002', vendor_name: 'City Mechanics', email: 'fix@mechanics.com' }
        ];
        const { data: seeded } = await supabase.from('finance_vendors').insert(seedVendors).select();
        vendors = seeded;
    }

    if (error) return res.status(400).json({ error: error.message });
    res.json({ vendors });
}

// Internal helper for creating invoices
async function createInvoiceInternal(payload) {
    if (!supabase) throw new Error('Database not configured');

    const { customer_id, invoice_date, due_date, line_items, shipment_id, bl_number, notes } = payload;

    const subtotal = line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const tax_amount = line_items.reduce((sum, item) =>
        sum + (item.quantity * item.unit_price * (item.tax_rate || 0) / 100), 0
    );
    const total_amount = subtotal + tax_amount;

    const invoice_number = `INV-${Date.now()}`;

    const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .insert({
            invoice_number,
            customer_id,
            invoice_date,
            due_date,
            shipment_id,
            bl_number,
            subtotal,
            tax_amount,
            total_amount,
            notes,
            status: 'sent'
        })
        .select()
        .single();

    if (invError) throw new Error(invError.message);

    const lineItemsWithInvoiceId = line_items.map((item, idx) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        line_number: idx + 1
    }));

    const { error: itemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsWithInvoiceId);

    if (itemsError) throw new Error(itemsError.message);

    await createJournalEntryForInvoice(invoice);

    return invoice;
}

async function createInvoice(req, res) {
    try {
        const invoice = await createInvoiceInternal(req.body);
        res.json({ invoice, message: 'Invoice created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function updateInvoiceStatus(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ invoice: data });
}

// =====================================================
// BILLS (AP)
// =====================================================

async function getBills(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { status, vendor_id } = req.query;

    let query = supabase
        .from('bills')
        .select(`
            *,
            vendor:finance_vendors(vendor_name, email),
            bill_line_items(*)
        `)
        .order('bill_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (vendor_id) query = query.eq('vendor_id', vendor_id);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.json({ bills: data || [] });
}

async function createBill(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { vendor_id, bill_date, due_date, line_items, reference_number, notes } = req.body;

    const subtotal = line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const tax_amount = line_items.reduce((sum, item) =>
        sum + (item.quantity * item.unit_price * (item.tax_rate || 0) / 100), 0
    );
    const total_amount = subtotal + tax_amount;

    const bill_number = `BILL-${Date.now()}`;

    const { data: bill, error: billError } = await supabase
        .from('bills')
        .insert({
            bill_number,
            vendor_id,
            bill_date,
            due_date,
            reference_number,
            subtotal,
            tax_amount,
            total_amount,
            notes
        })
        .select()
        .single();

    if (billError) return res.status(400).json({ error: billError.message });

    const lineItemsWithBillId = line_items.map((item, idx) => ({
        bill_id: bill.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        line_number: idx + 1
    }));

    const { error: itemsError } = await supabase
        .from('bill_line_items')
        .insert(lineItemsWithBillId);

    if (itemsError) return res.status(400).json({ error: itemsError.message });

    res.json({ bill, message: 'Bill created successfully' });
}

// =====================================================
// PAYMENTS
// =====================================================

async function getPayments(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { payment_type, from_date, to_date } = req.query;

    let query = supabase
        .from('payments')
        .select(`
            *,
            customer:finance_customers(customer_name),
            vendor:finance_vendors(vendor_name),
            payment_allocations(*, invoice:invoices(invoice_number), bill:bills(bill_number))
        `)
        .order('payment_date', { ascending: false });

    if (payment_type) query = query.eq('payment_type', payment_type);
    if (from_date) query = query.gte('payment_date', from_date);
    if (to_date) query = query.lte('payment_date', to_date);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.json({ payments: data || [] });
}

async function recordPayment(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { payment_type, payment_date, amount, payment_method, customer_id, vendor_id, allocations, notes } = req.body;

    const payment_number = `PAY-${Date.now()}`;

    const { data: payment, error: payError } = await supabase
        .from('payments')
        .insert({
            payment_number,
            payment_type,
            payment_date,
            amount,
            payment_method,
            customer_id,
            vendor_id,
            notes,
            status: 'completed'
        })
        .select()
        .single();

    if (payError) return res.status(400).json({ error: payError.message });

    // Allocate payment to invoices/bills
    if (allocations && allocations.length > 0) {
        const allocationRecords = allocations.map(alloc => ({
            payment_id: payment.id,
            invoice_id: alloc.invoice_id,
            bill_id: alloc.bill_id,
            allocated_amount: alloc.amount
        }));

        await supabase.from('payment_allocations').insert(allocationRecords);

        // Update invoice/bill paid amounts
        for (const alloc of allocations) {
            if (alloc.invoice_id) {
                await supabase.rpc('update_invoice_paid_amount', {
                    invoice_id: alloc.invoice_id,
                    payment_amount: alloc.amount
                });
            }
            if (alloc.bill_id) {
                await supabase.rpc('update_bill_paid_amount', {
                    bill_id: alloc.bill_id,
                    payment_amount: alloc.amount
                });
            }
        }
    }

    res.json({ payment, message: 'Payment recorded successfully' });
}

// =====================================================
// GENERAL LEDGER
// =====================================================

async function getChartOfAccounts(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('is_active', true)
        .order('account_code');

    if (error) return res.status(400).json({ error: error.message });
    res.json({ accounts: data || [] });
}

async function getJournalEntries(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { from_date, to_date, status } = req.query;

    let query = supabase
        .from('journal_entries')
        .select(`
            *,
            journal_entry_lines(*, account:chart_of_accounts(account_name, account_code))
        `)
        .order('entry_date', { ascending: false });

    if (from_date) query = query.gte('entry_date', from_date);
    if (to_date) query = query.lte('entry_date', to_date);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.json({ entries: data || [] });
}

async function createJournalEntry(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { entry_date, description, lines } = req.body;

    // Validate debit = credit
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return res.status(400).json({ error: 'Debit and Credit must be equal' });
    }

    const entry_number = `JE-${Date.now()}`;

    const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
            entry_number,
            entry_date,
            description,
            status: 'posted'
        })
        .select()
        .single();

    if (entryError) return res.status(400).json({ error: entryError.message });

    const lineRecords = lines.map((line, idx) => ({
        journal_entry_id: entry.id,
        account_id: line.account_id,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: line.description,
        line_number: idx + 1
    }));

    const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(lineRecords);

    if (linesError) return res.status(400).json({ error: linesError.message });

    res.json({ entry, message: 'Journal entry created successfully' });
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function createJournalEntryForInvoice(invoice) {
    // This would create proper double-entry for invoice
    // Debit: Accounts Receivable
    // Credit: Revenue
    // Implementation depends on your chart of accounts setup
    console.log('Journal entry for invoice:', invoice.invoice_number);
}

// =====================================================
// REPORTS
// =====================================================

async function getDashboardMetrics(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    try {
        // Total AR
        const { data: arData } = await supabase
            .from('invoices')
            .select('balance')
            .in('status', ['sent', 'partial', 'overdue']);
        const totalAR = arData?.reduce((sum, inv) => sum + parseFloat(inv.balance || 0), 0) || 0;

        // Total AP
        const { data: apData } = await supabase
            .from('bills')
            .select('balance')
            .in('status', ['pending', 'approved', 'partial']);
        const totalAP = apData?.reduce((sum, bill) => sum + parseFloat(bill.balance || 0), 0) || 0;

        // Revenue this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const { data: revenueData } = await supabase
            .from('invoices')
            .select('total_amount')
            .gte('invoice_date', startOfMonth.toISOString().split('T')[0]);
        const monthlyRevenue = revenueData?.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) || 0;

        // Overdue invoices
        const today = new Date().toISOString().split('T')[0];
        const { data: overdueData } = await supabase
            .from('invoices')
            .select('id')
            .lt('due_date', today)
            .neq('status', 'paid');
        const overdueCount = overdueData?.length || 0;

        res.json({
            metrics: {
                total_ar: totalAR,
                total_ap: totalAP,
                monthly_revenue: monthlyRevenue,
                overdue_invoices: overdueCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --- Driver Settlements ---

async function getDriverSettlements(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    // In a real app, we would query the database for trips that are completed but not settled.
    // Ideally joins: trips -> drivers -> finance_settlements
    // For now, we'll mock the data response structure.

    // Mock Data
    const settlements = [
        {
            id: 'set_1',
            driver_id: 'd1',
            driver_name: 'Ahmed Khan',
            trip_count: 5,
            total_km: 1250,
            base_pay: 50000,
            allowance: 12500, // 10 per km
            deductions: 2000, // Advances
            total_payable: 60500,
            status: 'pending'
        },
        {
            id: 'set_2',
            driver_id: 'd2',
            driver_name: 'Bilal Ahmed',
            trip_count: 3,
            total_km: 800,
            base_pay: 30000,
            allowance: 8000,
            deductions: 0,
            total_payable: 38000,
            status: 'pending'
        }
    ];

    res.json({ settlements });
}

async function processDriverSettlement(req, res) {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });

    const { settlement_id } = req.body;

    // Logic:
    // 1. Mark trips as settled
    // 2. Create a "Bill" in AP for the driver (or just record payment if cash)
    // 3. Create General Ledger entry: Debit Driver Expense, Credit Cash/Payable

    const settlementBill = {
        id: `bill_${Date.now()}`,
        vendor_id: `VEN-DRIVER-001`, // Mock: Driver as Vendor
        reference: `SETTLE-${settlement_id}`,
        amount: 60500, // ideally fetched from settlement id
        due_date: new Date().toISOString().split('T')[0],
        status: 'approved'
    };

    // Insert Bill mock
    await supabase.from('bills').insert(settlementBill);

    res.json({ ok: true, message: 'Settlement Processed. Bill generated.', bill: settlementBill });
}

/*
    async function getJournalEntries(req, res) {
        if (!supabase) return res.status(500).json({ error: 'Database not configured' });

        const { from_date, to_date, status } = req.query;

        let query = supabase
            .from('journal_entries')
            .select(`
            *,
            journal_entry_lines(*, account:chart_of_accounts(account_name, account_code))
        `)
            .order('entry_date', { ascending: false });

        if (from_date) query = query.gte('entry_date', from_date);
        if (to_date) query = query.lte('entry_date', to_date);
        if (status) query = query.eq('status', status);

        const { data, error } = await query;

        if (error) return res.status(400).json({ error: error.message });
        res.json({ entries: data || [] });
    }

    async function createJournalEntry(req, res) {
        if (!supabase) return res.status(500).json({ error: 'Database not configured' });

        const { entry_date, description, lines } = req.body;

        // Validate debit = credit
        const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return res.status(400).json({ error: 'Debit and Credit must be equal' });
        }

        const entry_number = `JE-${Date.now()}`;

        const { data: entry, error: entryError } = await supabase
            .from('journal_entries')
            .insert({
                entry_number,
                entry_date,
                description,
                status: 'posted'
            })
            .select()
            .single();

        if (entryError) return res.status(400).json({ error: entryError.message });

        const lineRecords = lines.map((line, idx) => ({
            journal_entry_id: entry.id,
            account_id: line.account_id,
            debit: line.debit || 0,
            credit: line.credit || 0,
            description: line.description,
            line_number: idx + 1
        }));

        const { error: linesError } = await supabase
            .from('journal_entry_lines')
            .insert(lineRecords);

        if (linesError) return res.status(400).json({ error: linesError.message });

        res.json({ entry, message: 'Journal entry created successfully' });
    }

    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    async function createJournalEntryForInvoice(invoice) {
        // This would create proper double-entry for invoice
        // Debit: Accounts Receivable
        // Credit: Revenue
        // Implementation depends on your chart of accounts setup
        console.log('Journal entry for invoice:', invoice.invoice_number);
    }

    // =====================================================
    // REPORTS
    // =====================================================

    async function getProfitLoss(req, res) {
        if (!supabase) return res.status(500).json({ error: 'Database not configured' });

        // Default to current year
        const fromDate = req.query.from || `${new Date().getFullYear()}-01-01`;
        const toDate = req.query.to || new Date().toISOString().split('T')[0];

        try {
            // Fetch Revenue and Expense accounts
            const { data: accounts } = await supabase
                .from('chart_of_accounts')
                .select('*')
                .in('account_type', ['Revenue', 'Expense']);

            // For each account, get sum of credits - sum of debits (for Revenue) or Debits - Credits (for Expenses)
            // Ideally this is a complex SQL join, but for simplicity/mock we calculate via JS or fetch lines
            // Mocking the result for now until we have real GL data

            const report = {
                revenue: [
                    { id: '1', account_name: 'Freight Revenue', amount: 1500000 },
                    { id: '2', account_name: 'Customs Clearance Fees', amount: 250000 },
                    { id: '3', account_name: 'Warehouse Storage Fees', amount: 120000 }
                ],
                expense: [
                    { id: '4', account_name: 'Fuel Expense', amount: 450000 },
                    { id: '5', account_name: 'Driver Wages', amount: 300000 },
                    { id: '6', account_name: 'Vehicle Maintenance', amount: 150000 },
                    { id: '7', account_name: 'Port Handling Charges', amount: 80000 }
                ]
            };

            const totalRevenue = report.revenue.reduce((s, i) => s + i.amount, 0);
            const totalExpense = report.expense.reduce((s, i) => s + i.amount, 0);
            const netProfit = totalRevenue - totalExpense;

            res.json({ fromDate, toDate, report, summary: { totalRevenue, totalExpense, netProfit } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async function getBalanceSheet(req, res) {
        if (!supabase) return res.status(500).json({ error: 'Database not configured' });
        const asOfDate = req.query.date || new Date().toISOString().split('T')[0];

        // Mock Balance Sheet
        const report = {
            assets: [
                { category: 'Current Assets', accounts: [{ name: 'Cash', amount: 500000 }, { name: 'Accounts Receivable', amount: 1200000 }, { name: 'Bank - HBL', amount: 3500000 }] },
                { category: 'Fixed Assets', accounts: [{ name: 'Fleet Vehicles', amount: 15000000 }, { name: 'Office Equipment', amount: 500000 }] }
            ],
            liabilities: [
                { category: 'Current Liabilities', accounts: [{ name: 'Accounts Payable', amount: 850000 }, { name: 'Tax Payable', amount: 120000 }] },
                { category: 'Long Term Liabilities', accounts: [{ name: 'Bank Loan', amount: 5000000 }] }
            ],
            equity: [
                { category: 'Equity', accounts: [{ name: 'Share Capital', amount: 10000000 }, { name: 'Retained Earnings', amount: 4730000 }] }
            ]
        };

        res.json({ asOfDate, report });
    }

    async function getDashboardMetrics(req, res) {
        if (!supabase) return res.status(500).json({ error: 'Database not configured' });

        try {
            // Total AR
            const { data: arData } = await supabase
                .from('invoices')
                .select('balance')
                .in('status', ['sent', 'partial', 'overdue']);
            const totalAR = arData?.reduce((sum, inv) => sum + parseFloat(inv.balance || 0), 0) || 0;

            // Total AP
            const { data: apData } = await supabase
                .from('bills')
                .select('balance')
                .in('status', ['pending', 'approved', 'partial']);
            const totalAP = apData?.reduce((sum, bill) => sum + parseFloat(bill.balance || 0), 0) || 0;

            // Revenue this month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            const { data: revenueData } = await supabase
                .from('invoices')
                .select('total_amount')
                .gte('invoice_date', startOfMonth.toISOString().split('T')[0]);
            const monthlyRevenue = revenueData?.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) || 0;

            // Overdue invoices
            const today = new Date().toISOString().split('T')[0];
            const { data: overdueData } = await supabase
                .from('invoices')
                .select('id')
                .lt('due_date', today)
                .neq('status', 'paid');
            const overdueCount = overdueData?.length || 0;

            res.json({
                metrics: {
                    total_ar: totalAR,
                    total_ap: totalAP,
                    monthly_revenue: monthlyRevenue,
                    overdue_invoices: overdueCount
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- Driver Settlements ---

    async function getDriverSettlements(req, res) {
        if (!supabase) return res.status(500).json({ error: 'Database not configured' });

        // In a real app, we would query the database for trips that are completed but not settled.
        // Ideally joins: trips -> drivers -> finance_settlements
        // For now, we'll mock the data response structure.

        // Mock Data
        const settlements = [
            {
                id: 'set_1',
                driver_id: 'd1',
                driver_name: 'Ahmed Khan',
                trip_count: 5,
                total_km: 1250,
                base_pay: 50000,
                allowance: 12500, // 10 per km
                deductions: 2000, // Advances
                total_payable: 60500,
                status: 'pending'
            },
            {
                id: 'set_2',
                driver_id: 'd2',
                driver_name: 'Bilal Ahmed',
                trip_count: 3,
                total_km: 800,
                base_pay: 30000,
                allowance: 8000,
                deductions: 0,
                total_payable: 38000,
                status: 'pending'
            }
        ];

        res.json({ settlements });
    }

    async function processDriverSettlement(req, res) {
        if (!supabase) return res.status(500).json({ error: 'Database not configured' });

        const { settlement_id } = req.body;

        // Logic:
        // 1. Mark trips as settled
        // 2. Create a "Bill" in AP for the driver (or just record payment if cash)
        // 3. Create General Ledger entry: Debit Driver Expense, Credit Cash/Payable

        const settlementBill = {
            id: `bill_${Date.now()}`,
            vendor_id: `VEN-DRIVER-001`, // Mock: Driver as Vendor
            reference: `SETTLE-${settlement_id}`,
            amount: 60500, // ideally fetched from settlement id
            due_date: new Date().toISOString().split('T')[0],
            status: 'approved'
        };

        // Insert Bill mock
        await supabase.from('bills').insert(settlementBill);

        res.json({ ok: true, message: 'Settlement Processed. Bill generated.', bill: settlementBill });
    }

    // --- Fleet Costs ---

    async function getFleetCosts(req, res) {
        if (!supabase) return res.status(500).json({ error: 'Database not configured' });

        // Mock Data
        const costs = [
            {
                id: 'cost_1',
                date: '2025-05-10',
                vehicle_id: 'v1',
                vehicle_plate: 'K-1234',
                type: 'fuel', // or 'maintenance'
                amount: 5000,
                description: 'Diesel refill at Shell',
                recorded_by: 'Driver Ahmed',
                status: 'recorded'
            },
            {
                id: 'cost_2',
                date: '2025-05-12',
                vehicle_id: 'v1',
                vehicle_plate: 'K-1234',
                type: 'maintenance',
                amount: 15000,
                description: 'Oil change and filter replacement',
                recorded_by: 'Workshop Manager',
                status: 'recorded'
            }
        ];
        res.json({ costs });
    }

    async function recordFleetCost(req, res) {
        if (!supabase) return res.status(500).json({ error: 'Database not configured' });

        const { vehicle_id, type, amount, description } = req.body;

        // Logic:
        // 1. Insert into fleet_costs table
        // 2. Create Journal Entry: Debit Vehicle Expense, Credit Cash/Bank/Payable

        // Determine GL Account based on type
        // Mock: 6000-Fuel, 6100-Maintenance
        const accountCode = type === 'fuel' ? '6000' : '6100';

        const costRecord = {
            id: `cost_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            vehicle_id,
            type,
            amount,
            description,
            status: 'recorded'
        };

        // Ideally we insert into DB here
        // await supabase.from('fleet_costs').insert(costRecord);

        res.json({ ok: true, cost: costRecord, message: 'Cost recorded successfully' });
    }

    // --- Job Costing ---

    async function estimateShipmentCost(req, res) {
        const { origin, destination, mode, weight, distance_km } = req.body;

        // Simple Cost Estimation Logic
        // 1. Fuel Cost (Distance * Avg Consumption * Fuel Price)
        // 2. Driver Pay (Distance * Rate)
        // 3. Maintenance Overhead (Distance * Rate)
        // 4. Tolls/Other (Flat)

        const dist = distance_km || 1000; // default
        const w = weight || 1000;

        let fuelCost = 0;
        let driverCost = 0;
        let maintCost = 0;

        if (mode === 'road') {
            // Truck avg: 3 km/l. Fuel: 280 PKR/l.
            // Cost per km = 280 / 3 = ~93 PKR/km
            fuelCost = dist * 93;

            // Driver: 10 PKR/km
            driverCost = dist * 10;

            // Maint: 5 PKR/km
            maintCost = dist * 5;
        } else {
            // Air/Sea handling
            fuelCost = dist * (mode === 'air' ? 50 : 10);
        }

        const totalCost = fuelCost + driverCost + maintCost;

        // Suggested Price (Margin 30%)
        const suggestedPrice = totalCost * 1.3;

        res.json({
            breakdown: {
                fuel: Math.round(fuelCost),
                driver: Math.round(driverCost),
                maintenance: Math.round(maintCost),
                total_cost: Math.round(totalCost)
            },
            suggested_price: Math.round(suggestedPrice),
            margin_percent: 30
        });
    }

    */

// Reinstate Reports at top-level (no DB required)
async function getProfitLoss(req, res) {
  // Default to current year
  const fromDate = req.query?.from || `${new Date().getFullYear()}-01-01`;
  const toDate = req.query?.to || new Date().toISOString().split('T')[0];

  // Mock P&L report
  const report = {
    revenue: [
      { id: '1', account_name: 'Freight Revenue', amount: 1500000 },
      { id: '2', account_name: 'Customs Clearance Fees', amount: 250000 },
      { id: '3', account_name: 'Warehouse Storage Fees', amount: 120000 },
    ],
    expense: [
      { id: '4', account_name: 'Fuel Expense', amount: 450000 },
      { id: '5', account_name: 'Driver Wages', amount: 300000 },
      { id: '6', account_name: 'Vehicle Maintenance', amount: 150000 },
      { id: '7', account_name: 'Port Handling Charges', amount: 80000 },
    ],
  };

  const totalRevenue = report.revenue.reduce((s, i) => s + i.amount, 0);
  const totalExpense = report.expense.reduce((s, i) => s + i.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  return res.json({ fromDate, toDate, report, summary: { totalRevenue, totalExpense, netProfit } });
}

async function getBalanceSheet(req, res) {
  const asOfDate = req.query?.date || new Date().toISOString().split('T')[0];

  // Mock Balance Sheet
  const report = {
    assets: [
      { category: 'Current Assets', accounts: [
        { name: 'Cash', amount: 500000 },
        { name: 'Accounts Receivable', amount: 1200000 },
        { name: 'Bank - HBL', amount: 3500000 },
      ]},
      { category: 'Fixed Assets', accounts: [
        { name: 'Fleet Vehicles', amount: 15000000 },
        { name: 'Office Equipment', amount: 500000 },
      ]},
    ],
    liabilities: [
      { category: 'Current Liabilities', accounts: [
        { name: 'Accounts Payable', amount: 850000 },
        { name: 'Tax Payable', amount: 120000 },
      ]},
      { category: 'Long Term Liabilities', accounts: [
        { name: 'Bank Loan', amount: 5000000 },
      ]},
    ],
    equity: [
      { category: 'Equity', accounts: [
        { name: 'Share Capital', amount: 10000000 },
        { name: 'Retained Earnings', amount: 4730000 },
      ]},
    ],
  };

  return res.json({ asOfDate, report });
}

module.exports = {
  getInvoices,
  getUnbilledShipments,
  getCustomers,
  getVendors,
  createInvoice,
  createInvoiceInternal,
  updateInvoiceStatus,
  getBills,
  createBill,
  getPayments,
  recordPayment,
  getChartOfAccounts,
  getJournalEntries,
  createJournalEntry,
  getDashboardMetrics,
  getDriverSettlements,
  processDriverSettlement,
  // The following were part of a duplicated nested block and are intentionally omitted until reintroduced:
  // getFleetCosts,
  // recordFleetCost,
  // estimateShipmentCost,
  getProfitLoss,
  getBalanceSheet,
};
