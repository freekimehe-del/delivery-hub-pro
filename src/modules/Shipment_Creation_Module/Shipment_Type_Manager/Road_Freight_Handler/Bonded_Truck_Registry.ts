export const bondedTrucks: Record<string, { vehicleId: string; owner?: string }> = {};

export function registerBondedTruck(vehicleId: string, owner?: string) {
  const id = `BTR-${vehicleId}`;
  bondedTrucks[id] = { vehicleId, owner };
  return { id, vehicleId, owner };
}

export default registerBondedTruck;
