/**
 * Tracking API
 * Handles real-time tracking events and status updates.
 */

const { v4: uuidv4 } = require('uuid');

// Mock Event Store (Simulating 'tracking_events' table)
let trackingEvents = [
    {
        id: 'evt_001',
        tracking_id: 'TRK-DEMO-001',
        event_type: 'pickup',
        status: 'active',
        location: { lat: 24.8607, lng: 67.0011, name: 'Karachi Warehouse' },
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        metadata: { handler: 'Ahmed Khan' }
    },
    {
        id: 'evt_002',
        tracking_id: 'TRK-DEMO-001',
        event_type: 'transit',
        status: 'active',
        location: { lat: 25.3960, lng: 68.3578, name: 'Hyderabad Bypass' },
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        metadata: { speed: 65, temperature: 24 }
    }
];

// GET /api/tracking/:id
async function getTrackingHistory(req, res) {
    const { id } = req.params;

    // Filter events for this ID
    const events = trackingEvents
        .filter(t => t.tracking_id === id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first

    if (events.length === 0) {
        return res.status(404).json({ error: 'Tracking ID not found' });
    }

    // Current status is the most recent event's status
    const current = events[0];

    res.json({
        tracking_id: id,
        current_status: current.status,
        current_location: current.location,
        last_updated: current.timestamp,
        history: events
    });
}

// POST /api/tracking/events
async function addTrackingEvent(req, res) {
    const { tracking_id, event_type, status, location, metadata } = req.body;

    if (!tracking_id || !event_type) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const newEvent = {
        id: uuidv4(),
        tracking_id,
        event_type,
        status: status || 'active',
        location: location || { lat: 0, lng: 0, name: 'Unknown' },
        timestamp: new Date().toISOString(),
        metadata: metadata || {}
    };

    trackingEvents.push(newEvent);
    res.json({ success: true, event: newEvent });
}

// GET /api/tracking/analytics
async function getTrackingAnalytics(req, res) {
    // Unique active shipments
    const active = new Set(trackingEvents.filter(e => e.status === 'active').map(e => e.tracking_id)).size;
    const delayed = new Set(trackingEvents.filter(e => e.status === 'delayed').map(e => e.tracking_id)).size;
    const delivered = new Set(trackingEvents.filter(e => e.event_type === 'delivered').map(e => e.tracking_id)).size;

    res.json({
        active_shipments: active,
        delayed_shipments: delayed,
        start_of_day_delivered: delivered
    });
}

module.exports = {
    getTrackingHistory,
    addTrackingEvent,
    getTrackingAnalytics
};
