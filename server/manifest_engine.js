/**
 * Manifest Engine
 * Handles PSW-compliant manifest number generation and validation.
 */

// In-memory sequence counter
let manifestSequence = 1000;

/**
 * Generates a PSW-compliant manifest number.
 * Format: [YEAR][MODE][SEQ] (e.g., 2025H1001 for Maritime)
 * Modes: M=Maritime, A=Air, R=Road
 */
function generateManifestNumber(mode) {
    const year = new Date().getFullYear();
    let modeCode = 'M';
    if (mode === 'air') modeCode = 'A';
    if (mode === 'road') modeCode = 'R';

    manifestSequence++;
    const sequence = String(manifestSequence).padStart(6, '0');

    return `${year}${modeCode}${sequence}`;
}

/**
 * Validates manifest details against basic rules.
 */
function validateManifest(manifest) {
    const errors = [];
    if (!manifest.transport_mode) errors.push('Missing transport mode');
    if (!manifest.legs || manifest.legs.length === 0) errors.push('At least one leg is required');

    // PSW Compliance Check (Mock)
    if (manifest.transport_mode === 'maritime' && !manifest.vessel_name) {
        errors.push('Vessel name required for maritime manifests');
    }

    return { isValid: errors.length === 0, errors };
}

module.exports = {
    generateManifestNumber,
    validateManifest
};
