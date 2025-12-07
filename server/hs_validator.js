// Simple HS code validator stub

const hsRegistry = {
  '0101': { description: 'Live horses', allowedForAfghanTranshipment: false },
  '1604': { description: 'Prepared or preserved fish', allowedForAfghanTranshipment: true },
  '8471': { description: 'Automatic data-processing machines', allowedForAfghanTranshipment: true },
  '8703': { description: 'Motor cars', allowedForAfghanTranshipment: true },
};

function extractHSCodesFromText(text) {
  if (!text) return [];
  const codes = new Set();
  // look for 4-6 digit numbers that could be HS
  const m = text.match(/\b(\d{4,6})\b/g);
  if (m) {
    for (const c of m) codes.add(c.slice(0, 4));
  }
  return Array.from(codes);
}

function validateHSCodes(codes) {
  return codes.map((c) => ({ code: c, found: !!hsRegistry[c], info: hsRegistry[c] || null }));
}

module.exports = { extractHSCodesFromText, validateHSCodes };
