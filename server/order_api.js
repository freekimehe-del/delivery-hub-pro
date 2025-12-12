const express = require('express');
const router = express.Router();
const { db, addNotification } = require('./db');

// --- Helpers ---
const getOrder = (id) => db.orders.active.find(o => o.id === id) || db.orders.history.find(o => o.id === id);

// --- Routes ---

// GET /api/orders - List orders with filters
router.get('/orders', (req, res) => {
    try {
        const { status, customer_id } = req.query;
        let orders = [...db.orders.active, ...db.orders.history];

        if (status) orders = orders.filter(o => o.status === status);
        if (customer_id) orders = orders.filter(o => o.customer_id === customer_id);

        // Sort by date desc
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Basic Stats
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            dispatch: orders.filter(o => ['ready_for_dispatch', 'dispatched'].includes(o.status)).length,
            in_transit: orders.filter(o => o.status === 'in_transit').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        };

        res.json({ orders, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/orders/:id - Detailed view
router.get('/orders/:id', (req, res) => {
    try {
        const order = getOrder(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Enrich with Customer
        const customer = db.customers.profiles.find(c => c.id === order.customer_id);

        // Enrich with Logs
        const logs = db.orders.logs.filter(l => l.order_id === order.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({ ...order, customer, logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/orders - Create Order
router.post('/orders', (req, res) => {
    try {
        const { customer_id, items, shipping_address, expected_delivery, priority } = req.body;

        // Validations
        if (!customer_id || !items || !items.length) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Inventory Check
        for (const item of items) {
            // Find stock (simplified: assume single warehouse WH-001)
            const stock = db.inventory.stock.find(s => s.sku === item.sku && s.warehouse_id === 'WH-001');
            if (!stock || stock.quantities.available < item.quantity) {
                return res.status(409).json({ error: `Insufficient stock for SKU: ${item.sku}` });
            }
        }

        // Reserve Inventory
        items.forEach(item => {
            const stock = db.inventory.stock.find(s => s.sku === item.sku && s.warehouse_id === 'WH-001');
            if (stock) {
                stock.quantities.available -= item.quantity;
                stock.quantities.reserved += item.quantity;
            }
        });

        const newOrder = {
            id: `ORD-${new Date().getFullYear()}-${String(db.orders.active.length + db.orders.history.length + 1).padStart(3, '0')}`,
            order_number: `ORD-${Date.now()}`,
            customer_id,
            warehouse_id: 'WH-001',
            status: 'pending',
            payment_status: 'unpaid',
            shipping_address,
            priority: priority || 'normal',
            expected_delivery,
            created_at: new Date().toISOString(),
            items: items.map(i => {
                const product = db.inventory.items.find(p => p.id === i.sku);
                return {
                    sku: i.sku,
                    name: product ? product.name : 'Unknown Item',
                    quantity: i.quantity,
                    unit_price: product ? product.price : 0,
                    total_price: (product ? product.price : 0) * i.quantity
                };
            })
        };

        // Calculate Totals
        newOrder.subtotal = newOrder.items.reduce((sum, i) => sum + i.total_price, 0);
        newOrder.tax = newOrder.subtotal * 0.10; // 10% tax
        newOrder.shipping_cost = 50; // flat rate mock
        newOrder.total_amount = newOrder.subtotal + newOrder.tax + newOrder.shipping_cost;

        db.orders.active.push(newOrder);

        // Log creation
        db.orders.logs.push({
            id: `LOG-${Date.now()}`,
            order_id: newOrder.id,
            previous_status: null,
            new_status: 'pending',
            notes: 'Order created',
            created_at: new Date().toISOString()
        });

        addNotification({
            id: Date.now(),
            title: 'New Order Received',
            message: `Order #${newOrder.id} from customer ${customer_id}`,
            type: 'info',
            time: 'Just now'
        });

        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/orders/:id/status - Update Status (Workflow Engine)
router.put('/orders/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const order = getOrder(id);

        if (!order) return res.status(404).json({ error: "Order not found" });

        const previous_status = order.status;

        // State Machine Validations
        // (Simplified for mock: allow most transitions)

        // Business Logic per status
        if (status === 'dispatched' && previous_status !== 'dispatched') {
            // Deduct from Reserved? or Wait for delivery?
            // Usually 'dispatched' implies it left the warehouse, so remove from Inventory completely
            order.items.forEach(item => {
                const stock = db.inventory.stock.find(s => s.sku === item.sku && s.warehouse_id === 'WH-001');
                if (stock) {
                    stock.quantities.reserved -= item.quantity;
                    // It was already deducted from 'available' during reservation, so now we just clear reservation.
                    // But wait, stock ledger 'reserved' implies it is physically there but spoken for.
                    // If dispatched, it leaves physical stock.
                    // So: Reserved -> 0. (Physical count implicitly reduced if we track on_hand vs available).
                    // In our mock: available + reserved + damaged = physical_total? 
                    // Let's assume on_hand = available + reserved.
                    // So reducing reserved without increasing available means total drops. Correct.
                }
            });
        }

        if (status === 'delivered') {
            order.payment_status = 'paid'; // Auto-pay on delivery for mock
            // Generate Invoice
            const invoice = {
                id: `INV-${Date.now()}`,
                invoice_number: `INV-${Date.now()}`,
                order_id: order.id,
                customer_id: order.customer_id,
                amount: order.total_amount,
                status: 'paid',
                due_date: new Date().toISOString(),
                created_at: new Date().toISOString()
            };
            const { createInvoice } = require('./db');
            // Note: need to import function or use db directly if exposed.
            // db.createInvoice is not exposed directly on db object, but module exports. 
            // But we are inside order_api requiring db. Let's just push to db.customers.invoices
            db.customers.invoices.push(invoice);
        }

        order.status = status;

        // Log Change
        db.orders.logs.push({
            id: `LOG-${Date.now()}`,
            order_id: order.id,
            previous_status,
            new_status: status,
            notes: notes || 'Status updated',
            created_at: new Date().toISOString()
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
