export interface Budget {
  _id?: string;
  category: string;
  amount: number;
  period: string;
  alertEnabled: boolean;
  alertThreshold: number;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  alerts: string[];
}

export interface BudgetResponse {
  period: string;
  budgets: BudgetStatus[];
  totalBudget: number;
  totalSpent: number;
  summary: {
    totalCategories: number;
    overBudgetCount: number;
    nearLimitCount: number;
  };
}
