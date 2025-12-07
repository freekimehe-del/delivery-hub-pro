export * from './Port_to_ICD_Routes';
export * from './ICD_to_Consignee_Routes';
export * from './Multi_Stop_Planner';

import { RoutePlan } from '../index';

export function planDomesticRoute(origin: string, dest: string): RoutePlan {
  return { legs: [{ from: origin, to: dest, mode: 'road', etaHours: 6 }] };
}

export default planDomesticRoute;
