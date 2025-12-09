/**
 * Customs Logic Engine to handle Business Rules, Duty Calculation, and Validation.
 * Simulates connection to PSW (Pakistan Single Window).
 */

// Rule Engine for Duty Calculation
// In reality, this would query a Tariff DB (PCT Codes).
const calculateDuty = (hsCode, value) => {
    // Mock Tariffs
    // 8703 (Cars): 30% CD, 17% ST, 6% ACD
    // 8471 (Computers): 0% CD, 17% ST
    // Default: 20% CD

    let cdRate = 0.20;
    let acdRate = 0.0;

    if (hsCode && hsCode.startsWith('87')) {
        cdRate = 0.30;
        acdRate = 0.06;
    } else if (hsCode && hsCode.startsWith('8471')) {
        cdRate = 0.0;
    }

    const stRate = 0.17; // General Sales Tax
    const itRate = 0.11; // Income Tax

    const cd = value * cdRate;
    const acd = value * acdRate;
    const st = (value + cd + acd) * stRate;
    const it = (value + cd + acd + st) * itRate;

    const total = Math.round(cd + acd + st + it);

    return {
        breakdown: {
            customs_duty: Math.round(cd),
            add_customs_duty: Math.round(acd),
            sales_tax: Math.round(st),
            income_tax: Math.round(it)
        },
        total,
        currency: 'PKR'
    };
};

const validateDeclaration = (decl) => {
    const errors = [];
    if (!decl.type) errors.push("Declaration Type (GD/TD) is required");
    if (!decl.bl_number) errors.push("BL Number is required");
    if (!decl.items || decl.items.length === 0) errors.push("At least one item is required");

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Mock PSW Interaction
const generatePSID = (amount) => {
    return 'PSID-' + Math.floor(Math.random() * 1000000000).toString();
};

const calculateBondRequirement = (items) => {
    // For Transit, bond usually covers the potential duty + penalty
    let totalValue = 0;
    items.forEach(i => totalValue += (i.value || 0));

    // Bond is approx 1.5x of Duty
    // Using quick estimation logic
    const estimatedDuty = totalValue * 0.40;
    return Math.round(estimatedDuty * 1.5);
};

module.exports = {
    calculateDuty,
    validateDeclaration,
    generatePSID,
    calculateBondRequirement
};
