export function estimateTransitTimeKm(km: number, avgSpeedKph = 40) {
  const hours = km / avgSpeedKph;
  return Math.round(hours);
}

export default estimateTransitTimeKm;
