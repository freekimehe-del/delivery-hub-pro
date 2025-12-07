export * from './Border_Crossing_Selector';
export * from './Transit_Time_Calculator';
export * from './Afghan_Leg_Tracker';

import { RoutePlan } from '../index';

export function planAfghanTranshipment(origin: string, dest: string): RoutePlan {
  // stub: choose border crossing and produce legs
  return {
    legs: [
      { from: origin, to: 'Torkham', mode: 'road', etaHours: 36 },
      { from: 'Torkham', to: 'Chaman', mode: 'road', etaHours: 48 },
      { from: 'Chaman', to: dest, mode: 'road', etaHours: 24 },
    ],
  };
}

export default planAfghanTranshipment;
