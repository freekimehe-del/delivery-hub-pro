// Simple HS code validator stub

/**
 * HS Code Validator (Pakistan Customs Tariff - PCT)
 * Supports 8-digit codes and Import Policy Order restrictions.
 */

const pctRegistry = {
  // Cars
  '8703': { description: 'Motor Cars (General)', restricted: false },
  '8703.2113': { description: 'Motor Cars - Up to 850cc', restricted: false, duty_rate: 0.50 },
  '8703.2193': { description: 'Motor Cars - 851cc to 1000cc', restricted: false, duty_rate: 0.55 },

  // Tech
  '8471.3010': { description: 'Laptops / Portable Computers', restricted: false, duty_rate: 0.0 },

  // Food (Mock Banned/Restricted)
  '1905.9000': { description: 'Imported Biscuits/Bakery', restricted: true, reason: "SRO 598(I)/2022 - Luxury Ban" },
  '2202.1010': { description: 'Aerated Waters', restricted: true, reason: "Import Policy Order" }
};

function extractHSCodesFromText(text) {
  if (!text) return [];
  const codes = new Set();
  // Match 8-digit PCT formats: 1234.5678 or 12345678
  const m = text.match(/\b(\d{4}\.\d{4}|\d{8})\b/g);
  if (m) {
    for (const c of m) {
      // Normalize to XXXX.XXXX format if needed, or just keep raw
      codes.add(c);
    }
  }
  return Array.from(codes);
}

function validateHSCode(code) {
  // 1. Exact Match (8-digit)
  if (pctRegistry[code]) return { code, valid: true, ...pctRegistry[code] };

  // 2. Heading Match (First 4 digits)
  const heading = code.substring(0, 4);
  if (code.length > 4 && pctRegistry[heading]) {
    return { code, valid: true, ...pctRegistry[heading], note: "Heading match only" };
  }

  return { code, valid: false, error: "Invalid or Unknown PCT Code" };
}

function validateHSCodes(codes) {
  return codes.map(c => validateHSCode(c));
}

module.exports = { extractHSCodesFromText, validateHSCodes, validateHSCode };
