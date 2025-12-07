export function planPortToICD(port: string, icd: string) {
  return { legId: `PTI-${port}-${icd}`, from: port, to: icd, mode: 'road', etaHours: 12 };
}

export default planPortToICD;
