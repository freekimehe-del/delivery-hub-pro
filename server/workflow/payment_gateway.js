// Payment gateway + PSID generator stubs
const { v4: uuidv4 } = require('uuid');

function generatePSID({ shipment_id, breakdown } = {}) {
  // Generate simple PSID per component
  const psid = `PSID-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const amount = breakdown ? breakdown.total || breakdown : 0;
  return { psid, amount, currency: 'PKR', expiry: new Date(Date.now() + 24*60*60*1000).toISOString() };
}

async function verifyPayment(psid, bankRef) {
  // stub: randomly accept
  const ok = Math.random() > 0.1;
  return { psid, ok, bankRef, verifiedAt: ok ? new Date().toISOString() : null };
}

module.exports = { generatePSID, verifyPayment };
