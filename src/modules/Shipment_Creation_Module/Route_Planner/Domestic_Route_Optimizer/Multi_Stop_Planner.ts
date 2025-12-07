export function planMultiStop(stops: string[]) {
  const legs = [] as any[];
  for (let i = 0; i < stops.length - 1; i++) {
    legs.push({ from: stops[i], to: stops[i + 1], mode: 'road', etaHours: 4 });
  }
  return { legs };
}

export default planMultiStop;
