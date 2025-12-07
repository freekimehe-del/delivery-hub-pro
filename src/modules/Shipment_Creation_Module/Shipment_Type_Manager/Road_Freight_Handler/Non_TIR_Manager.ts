export function registerNonTIR(shipmentId: string, vehicleId: string) {
  // record non-TIR cross-border movement
  return { shipmentId, vehicleId, registered: true };
}

export default registerNonTIR;
