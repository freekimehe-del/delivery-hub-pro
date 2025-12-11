/**
 * Customs Logic Engine to handle Business Rules, Duty Calculation, and Validation.
 * Tailored for Pakistan Customs (WeBOC/PSW) requirements.
 */

// Exchange Rates (Mock - In real app, fetch from NBP/Customs)
const EXCHANGE_RATES = {
    USD: 278.50,
    EUR: 301.20,
    GBP: 355.10,
    CNY: 38.45
};

/**
 * Calculates the Assessable Value and Total Import Duties/Taxes.
 * Ref: Customs Act 1969, Sales Tax Act 1990, Income Tax Ordinance 2001.
 * 
 * @param {string} hsCode - The Harmonized System Code (PCT).
 * @param {number} declaredValueFC - Declared value in Foreign Currency.
 * @param {string} currency - 'USD', 'PKR', etc.
 * @param {object} options - flags: { isFiler, isCommercial, hasSRO }
 */
const calculateDuty = (hsCode, declaredValueFC, currency = 'USD', options = {}) => {
    const {
        isFiler = true,      // Tax Filer status (IT 5.5% vs 11%)
        isCommercial = true, // Commercial Importer (affects IT / VAT)
        hasFreeTrade = false // FTA/PTA applicability
    } = options;

    // 0. Currency Conversion
    const exchangeRate = currency === 'PKR' ? 1 : (EXCHANGE_RATES[currency] || EXCHANGE_RATES.USD);
    const valuePKR = declaredValueFC * exchangeRate;

    // 1. Assessable Value (AV) = C&F Value + 1% Landing Charges
    // Section 25 of Customs Act, 1969
    const landingCharges = valuePKR * 0.01;
    const assessableValue = valuePKR + landingCharges;

    // 2. Mock Tariff Lookup (PCT Code based)
    // Structure: [CD, ACD, RD, ST, AST, IT]
    let rates = {
        cd: 0.20,  // Customs Duty: 20% (Standard Slab)
        acd: 0.02, // Add. Customs Duty: 2% (SRO 1125)
        rd: 0.0,   // Regulatory Duty
        fed: 0.0,  // Federal Excise Duty
        st: 0.18,  // Sales Tax: 18% (Standard increased from 17%)
    };

    // Specific logic for demo PCTs
    if (hsCode) {
        if (hsCode.startsWith('8703')) { // Vehicles
            rates.cd = 0.30;
            rates.acd = 0.07;
            rates.rd = 0.15; // Heavy RD on cars
            rates.fed = 0.05;
        } else if (hsCode.startsWith('8517')) { // Mobile Phones/Telecom
            rates.cd = 0.11;
            rates.st = 0.18;
            rates.rd = 0.0; // Mobile Levy usually separate, but treating as 0 RD for now
        } else if (hsCode.startsWith('8471')) { // Laptops/Computers
            rates.cd = 0.0; // Exempt
            rates.acd = 0.0;
            rates.st = 0.18;
        } else if (hsCode.startsWith('3004')) { // Pharmaceuticals
            rates.cd = 0.10;
            rates.st = 0.0; // Often exempt (Fifth Schedule)
        }
    }

    if (hasFreeTrade) {
        rates.cd = rates.cd * 0.5; // 50% concession for example
    }

    // 3. Duty Calculations
    const cdAmount = assessableValue * rates.cd;
    const acdAmount = assessableValue * rates.acd;
    const rdAmount = assessableValue * rates.rd;
    const fedAmount = assessableValue * rates.fed;

    // Duty Paid Value for Sales Tax = AV + CD + ACD + RD + FED
    const valForSalesTax = assessableValue + cdAmount + acdAmount + rdAmount + fedAmount;

    // Sales Tax
    const stAmount = valForSalesTax * rates.st;

    // Additional Sales Tax (3% for commercial importers or specific items)
    // Often 3% under Twelfth Schedule for un-registered persons, or value addition tax.
    // For simplicity: If commercial importer, add 3% Value Addition Tax (VAT) equivalent
    const astRate = 0.03;
    const astAmount = valForSalesTax * astRate;

    // Income Tax (WHT)
    // Base: AV + CD + ACD + RD + FED + ST + AST
    // Rate: 5.5% (Filer/Indu.), 11% (Non-Filer) - Simplified
    const valForIncomeTax = valForSalesTax + stAmount + astAmount;
    const itRate = isFiler ? 0.055 : 0.11;
    const itAmount = valForIncomeTax * itRate;

    const totalDutyBase = cdAmount + acdAmount + rdAmount + fedAmount + stAmount + astAmount + itAmount;

    return {
        currency: 'PKR',
        exchange_rate: exchangeRate,
        value_pkr: Math.round(valuePKR),
        assessable_value: Math.round(assessableValue),
        breakdown: {
            customs_duty: Math.round(cdAmount),
            additional_customs_duty: Math.round(acdAmount),
            regulatory_duty: Math.round(rdAmount),
            fed: Math.round(fedAmount),
            sales_tax: Math.round(stAmount),
            additional_sales_tax: Math.round(astAmount),
            income_tax: Math.round(itAmount),
        },
        total_payable: Math.round(totalDutyBase),
        rates: {
            cd_percent: (rates.cd * 100).toFixed(2),
            st_percent: (rates.st * 100).toFixed(2),
            it_percent: (itRate * 100).toFixed(2)
        }
    };
};

const validateDeclaration = (decl) => {
    const errors = [];
    if (!decl.type) errors.push("Declaration Type (GD/TD) is required");
    // WeBOC requirement: NTN (National Tax Number) or FTN
    if (!decl.importer_ntn) errors.push("Importer NTN is required");
    if (!decl.bl_number) errors.push("BL/AWB Number is required");
    if (!decl.items || decl.items.length === 0) errors.push("At least one item line is required");

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Mock PSW/WeBOC Interaction
const generatePSID = (amount) => {
    // 17-digit PSID typically
    const prefix = '9999'; // Customs prefix
    const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return prefix + random;
};

const calculateBondRequirement = (items) => {
    // For Transit (ATT), bond covers total duties + 25% penalty usually
    let totalValue = 0;
    // This is rough mock logic
    items.forEach(i => totalValue += (Number(i.value) || 0));
    const estimatedDuty = totalValue * 0.50;
    return Math.round(estimatedDuty * 1.25);
};

module.exports = {
    calculateDuty,
    validateDeclaration,
    generatePSID,
    calculateBondRequirement,
    EXCHANGE_RATES
};
