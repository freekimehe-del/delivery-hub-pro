// Lightweight rules engine for Chapter XIV & XXV
const rules = new Map();

function registerRule(id, meta, fn) {
  rules.set(id, { id, meta, fn });
}

async function evaluate(ruleId, context) {
  const r = rules.get(ruleId);
  if (!r) throw new Error(`rule_not_found:${ruleId}`);
  return await r.fn(context);
}

// Register a few core rules (stubs)
registerRule('CH14_RULE_100', { desc: 'GD mandatory fields' }, async (ctx) => {
  const required = ['hs_codes', 'declared_value', 'consignee'];
  const missing = required.filter((k) => !(k in ctx));
  return { ok: missing.length === 0, missing };
});

registerRule('CH14_RULE_104', { desc: 'Valuation hierarchy' }, async (ctx) => {
  // stub: always accept transaction value
  return { method: 'transaction_value', valid: true };
});

registerRule('CH25_RULE_350', { desc: 'Transit eligibility' }, async (ctx) => {
  // stub: disallow restricted HS codes
  const forbidden = ['0101'];
  const intersects = (ctx.hs_codes || []).filter((c) => forbidden.includes(c));
  return { eligible: intersects.length === 0, blocked_codes: intersects };
});

module.exports = { registerRule, evaluate };
