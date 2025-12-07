export * from './FCL_Submodule';
export * from './LCL_Submodule';
export * from './Transhipment_Flag';

import { ShipmentBase } from '../index';

export type ContainerShipment = ShipmentBase & {
  containerNumbers?: string[];
  isTranshipment?: boolean;
};

export class ContainerShipHandler {
  async createFCL(payload: ContainerShipment) {
    // TODO: implement booking, container assignment
    return { ok: true, payload };
  }

  async createLCL(payload: ContainerShipment) {
    // TODO: implement consolidation flows
    return { ok: true, payload };
  }
}

export default ContainerShipHandler;
