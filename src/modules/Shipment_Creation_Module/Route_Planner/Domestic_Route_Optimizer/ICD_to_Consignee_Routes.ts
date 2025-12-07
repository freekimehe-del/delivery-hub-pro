export function planICDToConsignee(icd: string, consignee: string) {
  return { legId: `ITC-${icd}-${consignee}`, from: icd, to: consignee, mode: 'road', etaHours: 8 };
}

export default planICDToConsignee;
