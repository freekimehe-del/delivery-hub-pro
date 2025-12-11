/**
 * Container Engine
 * Manages empty container lifecycle, returns, and maintenance.
 */

const CONTAINER_STATUS = {
    AVAILABLE: 'available',
    IN_USE: 'in_use',
    MAINTENANCE: 'maintenance',
    RETURNED: 'returned'
};

// Mock Container Database
let containers = [
    { id: 'CONT-001', type: '20ft', status: 'available', location: 'Port of Karachi', condition: 'good' },
    { id: 'CONT-002', type: '40ft', status: 'in_use', location: 'Lahore Depot', condition: 'good' },
    { id: 'CONT-003', type: '20ft', status: 'maintenance', location: 'Karachi Repair Yard', condition: 'damaged' },
    { id: 'CONT-004', type: '40ft HC', status: 'returned', location: 'Port Qasim', condition: 'good' },
];

function getContainerStats() {
    return {
        total: containers.length,
        available: containers.filter(c => c.status === CONTAINER_STATUS.AVAILABLE).length,
        maintenance: containers.filter(c => c.status === CONTAINER_STATUS.MAINTENANCE).length,
        returned: containers.filter(c => c.status === CONTAINER_STATUS.RETURNED).length,
    };
}

function logReturn(containerId, location, condition) {
    const container = containers.find(c => c.id === containerId);
    if (!container) return { error: 'Container not found' };

    container.status = CONTAINER_STATUS.RETURNED;
    container.location = location;
    container.condition = condition;

    // Auto-schedule maintenance if damaged
    if (condition === 'damaged') {
        scheduleMaintenance(containerId, 'Auto-scheduled due to damage on return');
    }

    return container;
}

function scheduleMaintenance(containerId, reason) {
    const container = containers.find(c => c.id === containerId);
    if (!container) return { error: 'Container not found' };

    container.status = CONTAINER_STATUS.MAINTENANCE;
    container.maintenance_reason = reason;
    return container;
}

const FREE_DAYS = 5;
const DAILY_RATE = 50; // USD

function calculateDetention(containerId, returnDateStr) {
    const container = containers.find(c => c.id === containerId);
    if (!container) return { error: 'Container not found' };

    // Mock "Out" date (Assumed 10 days ago for demo if not tracked)
    const outDate = new Date();
    outDate.setDate(outDate.getDate() - 12); // Simulate it was taken 12 days ago

    const returnDate = new Date(returnDateStr || Date.now());

    // Calc diff in days
    const diffTime = Math.abs(returnDate - outDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const detentionDays = Math.max(0, diffDays - FREE_DAYS);
    const amount = detentionDays * DAILY_RATE;

    return {
        container_id: containerId,
        days_out: diffDays,
        free_days: FREE_DAYS,
        detention_days: detentionDays,
        rate: DAILY_RATE,
        total_amount: amount,
        currency: 'USD'
    };
}

function getAllContainers() {
    return containers;
}

module.exports = {
    getContainerStats,
    logReturn,
    scheduleMaintenance,
    getAllContainers,
    calculateDetention
};
