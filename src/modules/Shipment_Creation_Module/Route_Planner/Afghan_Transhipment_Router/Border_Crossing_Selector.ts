export function chooseBorderCrossing(origin: string, dest: string) {
  // simple heuristic: prefer Torkham for eastern routes, Chaman for southern
  if (origin.includes('Kabul') || dest.includes('Peshawar')) return 'Torkham';
  return 'Chaman';
}

export default chooseBorderCrossing;
