import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AddExpenseComponent } from './features/add-expense/add-expense.component';
import { LandingComponent } from './features/landing/landing.component';
import { TaxCalculatorComponent } from './features/tax-calculator/tax-calculator.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { BudgetManagementComponent } from './features/budget-management/budget-management.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'add-expense',
        component: AddExpenseComponent,
      },
      {
        path: 'budgets',
        component: BudgetManagementComponent,
      },
      {
        path: 'tax-calculator',
        component: TaxCalculatorComponent,
      },
    ],
  },
  {
    path: 'demo',
    component: DashboardComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
