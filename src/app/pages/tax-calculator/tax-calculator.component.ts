import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

interface TaxBracket {
  sn: number;
  monthlyBand: string;
  annualBand: string;
  rate: number;
  monthlyMin: number;
  monthlyMax: number | null;
  annualMin: number;
  annualMax: number | null;
}

interface TaxCalculationResult {
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

@Component({
  selector: 'app-tax-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tax-calculator.component.html',
  styleUrls: [],
})
export class TaxCalculatorComponent implements OnInit {
  taxForm!: FormGroup;
  calculationResult: TaxCalculationResult | null = null;
  showResult = false;
  userEmail: string = '';

  // Nigerian Tax Brackets (2024)
  taxBrackets: TaxBracket[] = [
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.initializeForm();
  }

  loadUserData(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userEmail = payload.email || 'user@example.com';
    }
  }

  initializeForm(): void {
    this.taxForm = this.fb.group({
      incomeType: ['annual', Validators.required],
      grossIncome: ['', [Validators.required, Validators.min(0)]],
      pension: [
        '8',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      nhf: [
        '2.5',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      nhis: [
        '5',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      lifeAssurance: ['0', [Validators.min(0)]],
      otherReliefs: ['0', [Validators.min(0)]],
    });
  }

  calculateTax(): void {
    if (this.taxForm.invalid) {
      Object.keys(this.taxForm.controls).forEach((key) => {
        this.taxForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.taxForm.value;
    const incomeType = formValue.incomeType;
    let annualGrossIncome = parseFloat(formValue.grossIncome);

    // Convert monthly to annual if needed
    if (incomeType === 'monthly') {
      annualGrossIncome *= 12;
    }

    // Calculate reliefs
    const pensionRelief =
      annualGrossIncome * (parseFloat(formValue.pension) / 100);
    const nhfRelief = annualGrossIncome * (parseFloat(formValue.nhf) / 100);
    const nhisRelief = annualGrossIncome * (parseFloat(formValue.nhis) / 100);
    const lifeAssuranceRelief = parseFloat(formValue.lifeAssurance);
    const otherReliefs = parseFloat(formValue.otherReliefs);

    const totalReliefs =
      pensionRelief +
      nhfRelief +
      nhisRelief +
      lifeAssuranceRelief +
      otherReliefs;
    const taxableIncome = Math.max(0, annualGrossIncome - totalReliefs);

    // Calculate tax using brackets
    const { totalTax, breakdown } = this.calculateTaxByBrackets(taxableIncome);

    const netIncome = annualGrossIncome - totalTax;
    const effectiveRate =
      annualGrossIncome > 0 ? (totalTax / annualGrossIncome) * 100 : 0;

    this.calculationResult = {
      grossIncome: annualGrossIncome,
      taxableIncome,
      totalTax,
      netIncome,
      effectiveRate,
      breakdown,
    };

    this.showResult = true;
  }

  calculateTaxByBrackets(taxableIncome: number): {
    totalTax: number;
    breakdown: any[];
  } {
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    const breakdown: any[] = [];

    for (const bracket of this.taxBrackets) {
      if (remainingIncome <= 0) break;

      const bracketMin = bracket.annualMin;
      const bracketMax = bracket.annualMax || Infinity;
      const bracketSize = bracketMax - bracketMin;

      const incomeInBracket = Math.min(remainingIncome, bracketSize);
      const taxInBracket = incomeInBracket * (bracket.rate / 100);

      if (incomeInBracket > 0) {
        totalTax += taxInBracket;
        breakdown.push({
          bracket: bracket.sn,
          income: incomeInBracket,
          rate: bracket.rate,
          tax: taxInBracket,
        });
        remainingIncome -= incomeInBracket;
      }
    }

    return { totalTax, breakdown };
  }

  resetCalculator(): void {
    this.taxForm.reset({
      incomeType: 'annual',
      pension: '8',
      nhf: '2.5',
      nhis: '5',
      lifeAssurance: '0',
      otherReliefs: '0',
    });
    this.showResult = false;
    this.calculationResult = null;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  formatCurrency(amount: number): string {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatNumber(amount: number): string {
    return amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taxForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.taxForm.get(fieldName);

    if (field?.hasError('required') && field.touched) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    if (field?.hasError('min') && field.touched) {
      return 'Value must be 0 or greater';
    }

    if (field?.hasError('max') && field.touched) {
      return 'Value cannot exceed 100%';
    }

    return '';
  }
}
