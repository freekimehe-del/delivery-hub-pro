export * from './Airport_Processor';
export * from './Cargo_Type_Classifier';
export * from './Airway_Bill_Manager';

import { ShipmentBase } from '../index';

export type AirShipment = ShipmentBase & {
  airwayBill?: string;
  flightNumber?: string;
};

export class AirFreightHandler {
  async createAirShipment(payload: AirShipment) {
    // TODO: airport slots, AWB generation
    return { ok: true, payload };
  }
}

export default AirFreightHandler;
