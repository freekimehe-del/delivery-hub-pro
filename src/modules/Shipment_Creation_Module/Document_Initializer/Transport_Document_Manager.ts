export function generateTransportDocuments(shipmentId: string, options?: any) {
  // stub: produce bill of lading, airway bill, road consignment note
  return { shipmentId, docs: ['BOL', 'CNTR-RECEIPT'] };
}

export default generateTransportDocuments;
