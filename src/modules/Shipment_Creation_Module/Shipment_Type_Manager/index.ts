export * from './Container_Ship_Handler';
export * from './Road_Freight_Handler';
export * from './Air_Freight_Handler';

export type ShipmentBase = {
  id: string;
  type: 'container' | 'road' | 'air';
  origin: string;
  destination: string;
  value?: number;
};
