export function uploadCommercialInvoice(shipmentId: string, fileBuffer: Buffer, filename?: string) {
  // stub: write to object storage and return URL
  const url = `https://storage.example/${shipmentId}/${filename || 'invoice.pdf'}`;
  return { shipmentId, url };
}

export default uploadCommercialInvoice;
