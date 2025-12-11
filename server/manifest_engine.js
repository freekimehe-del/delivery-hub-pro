/**
 * Manifest Engine
 * Handles PSW-compliant manifest number generation and validation.
 */

// In-memory sequence counter
let manifestSequence = 1000;

/**
 * Generates a PSW-compliant manifest number.
 * Format: [PORT]-[YEAR]-[MODE]-[SEQ] (e.g., KPT-2025-M-1001)
 * Modes: M=Maritime, A=Air, R=Road
 * Ports: KPT (Karachi Port), PQA (Port Qasim), GWD (Gwadar)
 */
function generateManifestNumber(mode, portCode = 'KPT') {
    const year = new Date().getFullYear();
    let modeCode = 'M';
    if (mode === 'air') modeCode = 'A';
    if (mode === 'road') modeCode = 'R';

    manifestSequence++;
    const sequence = String(manifestSequence).padStart(4, '0');

    return `${portCode}-${year}-${modeCode}-${sequence}`;
}

/**
 * Validates manifest details against Pakistan Customs rules.
 */
function validateManifest(manifest) {
    const errors = [];
    if (!manifest.transport_mode) errors.push('Missing transport mode');
    if (!manifest.legs || manifest.legs.length === 0) errors.push('At least one leg is required');

    // PSW Compliance Check
    if (manifest.transport_mode === 'maritime') {
        if (!manifest.vessel_name) errors.push('Vessel name required for maritime manifests');
        // IGM (Import General Manifest) is mandatory for filing
        if (!manifest.vir_number) errors.push('VIR/IGM Number is required (e.g., IGM-1234)');
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Verifies if a Manifest matches a Goods Declaration (GD).
 * Primarily checks if the BL/AWB Number matches.
 */
function verifyManifestAgainstGD(manifest, gd) {
    if (!manifest || !gd) return { match: false, reason: "Missing record" };

    // Check BL Number
    if (manifest.bl_number !== gd.bl_number) {
        return { match: false, reason: `BL Mismatch: Manifest(${manifest.bl_number}) vs GD(${gd.bl_number})` };
    }

    // Check Port if available
    if (manifest.port_code && gd.collectorate && !gd.collectorate.includes(manifest.port_code)) {
        return { match: false, reason: `Port Mismatch: Manifest(${manifest.port_code}) vs GD(${gd.collectorate})` };
    }

    return { match: true };
}

module.exports = {
    generateManifestNumber,
    validateManifest,
    verifyManifestAgainstGD
};
