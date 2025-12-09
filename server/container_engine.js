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

function getAllContainers() {
    return containers;
}

module.exports = {
    getContainerStats,
    logReturn,
    scheduleMaintenance,
    getAllContainers
};
