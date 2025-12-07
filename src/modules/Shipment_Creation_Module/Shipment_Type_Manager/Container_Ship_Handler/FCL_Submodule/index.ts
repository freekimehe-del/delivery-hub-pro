import { ContainerShipment } from '../index';

export function prepareFCLManifest(shipment: ContainerShipment) {
  // stub: collect container contents, weights, HS codes
  return {
    manifestId: `FCL-${shipment.id}`,
    items: [],
  };
}

export default prepareFCLManifest;
