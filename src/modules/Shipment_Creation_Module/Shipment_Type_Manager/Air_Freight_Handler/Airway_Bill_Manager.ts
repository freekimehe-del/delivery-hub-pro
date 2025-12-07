export function generateAWB(shipmentId: string, issuer?: string) {
  const awb = `AWB-${shipmentId}-${Date.now().toString().slice(-6)}`;
  return { shipmentId, awb, issuer };
}

export default generateAWB;
