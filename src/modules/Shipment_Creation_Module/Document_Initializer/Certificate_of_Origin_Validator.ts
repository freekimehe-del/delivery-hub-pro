export function validateCertificateOfOrigin(shipmentId: string, cert: any) {
  // stub: check signatures, issuer registry
  return { shipmentId, valid: true };
}

export default validateCertificateOfOrigin;
