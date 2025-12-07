export * from './Afghan_Transhipment_Router';
export * from './Domestic_Route_Optimizer';

export type RoutePlan = {
  legs: Array<{
    from: string;
    to: string;
    mode: 'road' | 'sea' | 'air';
    etaHours?: number;
  }>;
};
