import { Component, OnInit, ViewChild } from '@angular/core';
import { Expense } from '../../shared/models/expense.model';
import { CategoryCount } from '../../shared/models/category.model';
import { DashboardStats } from '../../shared/models/dashboardStats.model';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NairaFormatPipe } from '../../shared/pipes/naira-format.pipe';
import { DashboardChartsComponent } from '../../shared/components/dashboard-charts.component';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { ConfirmationService } from '../../shared/components/confirmation-modal/confirmation.service';
import { ToastService } from '../../shared/components/toast-container/toast.service';

interface CategoryChartData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface MonthlyChartData {
  month: string;
  amount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardChartsComponent,
    NairaFormatPipe,
    ConfirmationModalComponent,
    ToastContainerComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  @ViewChild(DashboardChartsComponent)
  chartsComponent!: DashboardChartsComponent;
  stats: DashboardStats = {
    totalSpent: 0,
    thisMonth: 0,
    thisWeek: 0,
    averageExpense: 0,
  };

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  selectedCategory: string = 'All';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  paginatedExpenses: Expense[] = [];

  categories = [
    { name: 'All', count: 0 },
    { name: 'Food', count: 0 },
    { name: 'Transport', count: 0 },
    { name: 'Entertainment', count: 0 },
    { name: 'Utilities', count: 0 },
    { name: 'Shopping', count: 0 },
    { name: 'Health', count: 0 },
    { name: 'Other', count: 0 },
  ];

  userEmail: string = '';
  private apiUrl = 'http://localhost:3000';

  categoryChartData: CategoryChartData[] = [];
  monthlyChartData: MonthlyChartData[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadExpenses();
  }

  loadUserData(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userEmail = payload.email;
    }
  }

  loadExpenses(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http
      .get<Expense[]>(`${this.apiUrl}/api/expenses`, { headers })
      .subscribe({
        next: (expenses) => {
          this.expenses = expenses;
          this.filteredExpenses = expenses;
          this.calculateStats();
          this.updateCategoryCount();
          this.prepareCategoryChartData();
          this.prepareMonthlyChartData();
          this.currentPage = 1;
          this.updatePaginatedExpenses();
        },
        error: (error) => {
          console.error('Error loading expenses:', error);
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        },
      });
  }

  deleteExpense(expenseId: string): void {
    this.confirmationService
      .confirm({
        title: 'Delete Expense',
        message: 'Are you sure you want to delete this expense?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isDangerous: true,
      })
      .then((confirmed) => {
        if (!confirmed) {
          return;
        }

        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        this.http
          .delete(`${this.apiUrl}/api/expenses/${expenseId}`, { headers })
          .subscribe({
            next: () => {
              console.log('Expense deleted successfully');
              // Remove from local arrays
              this.expenses = this.expenses.filter(
                (exp) => exp._id !== expenseId,
              );
              this.filteredExpenses = this.filteredExpenses.filter(
                (exp) => exp._id !== expenseId,
              );

              // Recalculate everything
              this.calculateStats();
              this.updateCategoryCount();
              this.prepareCategoryChartData();
              this.prepareMonthlyChartData();
              this.updatePaginatedExpenses();

              // Update charts
              if (this.chartsComponent && this.expenses.length > 0) {
                setTimeout(() => {
                  this.chartsComponent.updateCharts(
                    this.categoryChartData,
                    this.monthlyChartData,
                  );
                }, 100);
              }

              // Show success toast
              this.toastService.success('Expense deleted successfully');
            },
            error: (error) => {
              this.toastService.error(
                'Failed to delete expense. Please try again.',
              );
              if (error.status === 401) {
                this.router.navigate(['/login']);
              }
            },
          });
      });
  }

  calculateStats(): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    this.stats.totalSpent = this.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    this.stats.thisMonth = this.expenses
      .filter((exp) => new Date(exp.date) >= startOfMonth)
      .reduce((sum, exp) => sum + exp.amount, 0);

    this.stats.thisWeek = this.expenses
      .filter((exp) => new Date(exp.date) >= startOfWeek)
      .reduce((sum, exp) => sum + exp.amount, 0);

    this.stats.averageExpense =
      this.expenses.length > 0
        ? this.stats.totalSpent / this.expenses.length
        : 0;
  }

  updateCategoryCount(): void {
    const counts: { [key: string]: number } = {};

    this.expenses.forEach((expense) => {
      counts[expense.category] = (counts[expense.category] || 0) + 1;

      this.categories.forEach((cat) => {
        if (cat.name === 'All') {
          cat.count = this.expenses.length;
        } else {
          cat.count = counts[cat.name] || 0;
        }
      });
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1; // Reset to first page when filtering

    if (category === 'All') {
      this.filteredExpenses = this.expenses;
    } else {
      this.filteredExpenses = this.expenses.filter(
        (exp) => exp.category === category,
      );
    }

    this.updatePaginatedExpenses();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  prepareCategoryChartData(): void {
    const categoryTotals: { [key: string]: number } = {};
    const categoryColors: { [key: string]: string } = {
      Food: '#8B5CF6',
      Transport: '#3B82F6',
      Entertainment: '#EC4899',
      Utilities: '#10B981',
      Shopping: '#F59E0B',
      Health: '#F59E0B',
      Other: '#6B7280',
    };

    this.expenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const total = Object.values(categoryTotals).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    this.categoryChartData = Object.entries(categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: categoryColors[category] || '#6B7280',
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  prepareMonthlyChartData(): void {
    const now = new Date();
    const monthlyTotals: { [key: string]: number } = {};
    const monthOrder: string[] = [];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyTotals[monthKey] = 0;
      monthOrder.push(monthKey);
    }

    // Calculate totals for each month from actual expenses
    this.expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const monthsDiff =
        (now.getFullYear() - expenseDate.getFullYear()) * 12 +
        (now.getMonth() - expenseDate.getMonth());

      // Only include expenses from last 6 months
      if (monthsDiff >= 0 && monthsDiff < 6) {
        const monthKey = expenseDate.toLocaleDateString('en-US', {
          month: 'short',
        });
        if (monthKey in monthlyTotals) {
          monthlyTotals[monthKey] += expense.amount;
        }
      }
    });

    this.monthlyChartData = monthOrder.map((month) => ({
      month,
      amount: Math.round(monthlyTotals[month]),
    }));
  }

  updatePaginatedExpenses(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedExpenses = this.filteredExpenses.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    const totalPages = Math.ceil(
      this.filteredExpenses.length / this.itemsPerPage,
    );
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.updatePaginatedExpenses();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredExpenses.length / this.itemsPerPage);
  }

  navigateToAddExpense(): void {
    this.router.navigate(['/add-expense']);
  }

  navigateToTaxCalculator(): void {
    this.router.navigate(['/tax-calculator']);
  }

  navigateToLandingPage(): void {
    this.router.navigate(['/']);
  }
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
