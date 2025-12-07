export function issueTIRCarnet(shipmentId: string, vehicleId: string) {
  // stub: integrate with TIR issuance / record keeping
  return { shipmentId, vehicleId, tirId: `TIR-${shipmentId}` };
}

export default issueTIRCarnet;
