export function processAirportArrival(shipmentId: string, airportCode: string) {
  // stub: customs hold, quarantine checks
  return { shipmentId, airportCode, processedAt: new Date().toISOString() };
}

export default processAirportArrival;
