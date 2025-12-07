export type DutyInput = {
  hsCode: string;
  value: number;
  countryOfOrigin?: string;
  quantity?: number;
};

export type DutyResult = {
  customsDuty: number;
  additionalCustomsDuty?: number;
  salesTax?: number;
  withholdingTax?: number;
  totalPayable: number;
  breakdown: Record<string, number>;
};

export class DutyCalculator {
  // TODO: wire up rate tables and HS lookup
  calculate(input: DutyInput): DutyResult {
    const customsDuty = Number((input.value * 0.1).toFixed(2)); // stub 10%
    const salesTax = Number((input.value * 0.17).toFixed(2)); // stub 17%
    const total = customsDuty + salesTax;
    return {
      customsDuty,
      salesTax,
      totalPayable: total,
      breakdown: { customsDuty, salesTax },
    };
  }
}

export default DutyCalculator;
