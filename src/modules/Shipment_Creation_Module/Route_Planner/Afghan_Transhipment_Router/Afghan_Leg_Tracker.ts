export function trackAfghanLeg(shipmentId: string, legId: string, position: { lat: number; lon: number }) {
  // stub: persist tracking event to DB or MQ
  return { shipmentId, legId, position, recordedAt: new Date().toISOString() };
}

export default trackAfghanLeg;
