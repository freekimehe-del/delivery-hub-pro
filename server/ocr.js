// OCR helper: tries to use tesseract.js if available, otherwise falls back to a simple mock
let hasTesseract = false;
let createWorker = null;

try {

  const tesseract = require('tesseract.js');
  createWorker = tesseract.createWorker;
  hasTesseract = true;
} catch (e) {
  hasTesseract = false;
}

async function recognizeBuffer(buffer) {
  if (!buffer) return '';
  if (hasTesseract && createWorker) {
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    return data && data.text ? data.text : '';
  }

  // Fallback: try to infer simple text from buffer filename or basic content
  try {
    const s = buffer.toString('utf8').slice(0, 1000);
    return s || '';
  } catch (e) {
    return '';
  }
}

function extractDetails(text) {
  const details = {};

  // 1. BL Number (Format: OSLU12345678 or similar 4 letters + numbers)
  const blMatch = text.match(/\b([A-Z]{4}[0-9]{7,10})\b/);
  if (blMatch) details.bl_number = blMatch[1];

  // 2. Invoice Value (Format: USD 123.45 or $123.45)
  // Looking for "Total" or "Invoice Value" followed by digits
  const valMatch = text.match(/(?:Total|Value|Amount)[\s:]+(?:USD|\$)?\s*([0-9,]+\.?[0-9]*)/i);
  if (valMatch) details.total_value = parseFloat(valMatch[1].replace(/,/g, ''));

  // 3. HS Code (Format: 8703.2113)
  const hsMatch = text.match(/\b(\d{4}\.\d{4})\b/);
  if (hsMatch) details.hs_code = hsMatch[1];

  // 4. Vessel (Look for "Vessel:")
  const vesselMatch = text.match(/Vessel[\s:]+([A-Z0-9\s]+)(?:\n|$)/i);
  if (vesselMatch) details.vessel_name = vesselMatch[1].trim();

  return details;
}

module.exports = { recognizeBuffer, extractDetails };
