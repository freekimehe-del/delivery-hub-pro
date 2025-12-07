import { ContainerShipment } from '../index';

export function prepareLCLConsolidation(shipment: ContainerShipment) {
  // stub: group cartons, compute prorated charges
  return {
    consolidationId: `LCL-${shipment.id}`,
    groups: [],
  };
}

export default prepareLCLConsolidation;
