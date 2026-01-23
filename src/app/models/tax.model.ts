export interface TaxBracket {
  sn: number;
  monthlyBand: string;
  annualBand: string;
  rate: number;
  monthlyMin: number;
  monthlyMax: number | null;
  annualMin: number;
  annualMax: number | null;
}

export interface TaxCalculationResult {
  grossIncome: number;
  taxableIncome: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  breakdown: {
    bracket: number;
    income: number;
    rate: number;
    tax: number;
  }[];
}

export const taxBrackets: TaxBracket[] = [
  {
    sn: 1,
    monthlyBand: 'First 66,666.67',
    annualBand: 'First 800,000',
    rate: 0,
    monthlyMin: 0,
    monthlyMax: 66666.67,
    annualMin: 0,
    annualMax: 800000,
  },
  {
    sn: 2,
    monthlyBand: 'Next 183,333.33',
    annualBand: 'Next 2,200,000',
    rate: 15,
    monthlyMin: 66666.67,
    monthlyMax: 250000,
    annualMin: 800000,
    annualMax: 3000000,
  },
  {
    sn: 3,
    monthlyBand: 'Next 750,000',
    annualBand: 'Next 9,000,000',
    rate: 18,
    monthlyMin: 250000,
    monthlyMax: 1000000,
    annualMin: 3000000,
    annualMax: 12000000,
  },
  {
    sn: 4,
    monthlyBand: 'Next 1,083,333.33',
    annualBand: 'Next 13,000,000',
    rate: 21,
    monthlyMin: 1000000,
    monthlyMax: 2083333.33,
    annualMin: 12000000,
    annualMax: 25000000,
  },
  {
    sn: 5,
    monthlyBand: 'Next 2,083,333.33',
    annualBand: 'Next 25,000,000',
    rate: 23,
    monthlyMin: 2083333.33,
    monthlyMax: 4166666.67,
    annualMin: 25000000,
    annualMax: 50000000,
  },
  {
    sn: 7,
    monthlyBand: 'Above 4,666,666.67',
    annualBand: 'Above 50,000,000',
    rate: 25,
    monthlyMin: 4166666.67,
    monthlyMax: null,
    annualMin: 50000000,
    annualMax: null,
  },
];
