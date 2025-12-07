export function classifyCargoType(items: any[]) {
  // simple heuristic stub: return categories per item
  return items.map((it, idx) => ({ idx, category: 'general', item: it }));
}

export default classifyCargoType;
