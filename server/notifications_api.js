const express = require('express');
const router = express.Router();
const { db, addNotification } = require('./db');
const { v4: uuidv4 } = require('uuid');

// GET /api/notifications - Get all notifications
router.get('/', (req, res) => {
    try {
        const notifications = db.notifications || [];
        // Sort by time if needed, but we unshift new ones so index 0 is newest
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/notifications - Create a new notification (Internal or External Trigger)
router.post('/', (req, res) => {
    try {
        const { title, message, type } = req.body;
        if (!title || !message) return res.status(400).json({ error: "Title and message required" });

        const newNotif = {
            id: uuidv4(),
            title,
            message,
            type: type || 'info',
            read: false,
            time: 'Just now' // In real app, use ISO string
        };

        addNotification(newNotif);
        res.status(201).json(newNotif);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/notifications/:id/read - Mark as read
router.put('/:id/read', (req, res) => {
    const { id } = req.params;
    const notif = db.notifications.find(n => n.id == id || n.id === id); // lenient check for mock numeric/string IDs
    if (notif) {
        notif.read = true;
        res.json(notif);
    } else {
        res.status(404).json({ error: "Notification not found" });
    }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', (req, res) => {
    db.notifications.forEach(n => n.read = true);
    res.json({ success: true, count: db.notifications.length });
});

module.exports = router;
