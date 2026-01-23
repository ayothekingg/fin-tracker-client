import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddExpenseComponent } from './pages/add-expense/add-expense.component';
import { LandingComponent } from './pages/landing/landing.component';
import { TaxCalculatorComponent } from './pages/tax-calculator/tax-calculator.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { AuthGuard } from './auth/auth.guard';

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
