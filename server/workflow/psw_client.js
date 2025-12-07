// PSW client stubs for GD and Transit Declaration submission
const { v4: uuidv4 } = require('uuid');

async function submitGoodsDeclaration(gdPayload) {
  // emulate PSW returning a reference and status
  const reference = `PSW-GD-${Date.now()}`;
  return { ok: true, reference, status: 'SUBMITTED', submittedAt: new Date().toISOString() };
}

async function submitTransitDeclaration(tdPayload) {
  const reference = `PSW-TD-${Date.now()}`;
  return { ok: true, reference, status: 'TRANSIT_SUBMITTED', submittedAt: new Date().toISOString() };
}

async function getDeclarationStatus(reference) {
  // stub: return accepted after short time
  return { reference, status: 'ACCEPTED', lastUpdated: new Date().toISOString() };
}

module.exports = { submitGoodsDeclaration, submitTransitDeclaration, getDeclarationStatus };
