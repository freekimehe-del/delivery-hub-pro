export * from './TIR_Carnet_Manager';
export * from './Non_TIR_Manager';
export * from './Bonded_Truck_Registry';

import { ShipmentBase } from '../index';

export type RoadShipment = ShipmentBase & {
  vehicleId?: string;
  isBonded?: boolean;
};

export class RoadFreightHandler {
  async createRoadShipment(payload: RoadShipment) {
    // TODO: schedule truck, assign TIR if required
    return { ok: true, payload };
  }
}

export default RoadFreightHandler;
