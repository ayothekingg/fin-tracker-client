import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ConfirmationService } from '../../shared/components/confirmation-modal/confirmation.service';
import { ToastService } from '../../shared/components/toast-container/toast.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import {
  Budget,
  BudgetResponse,
  BudgetStatus,
} from '../../shared/models/budget.model';

@Component({
  selector: 'app-budget-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmationModalComponent,
    ToastContainerComponent,
  ],
  templateUrl: './budget-management.component.html',
  styleUrls: [],
})
export class BudgetManagementComponent implements OnInit {
  budgetForm!: FormGroup;
  totalBudgetForm!: FormGroup;
  budgetStatus: BudgetResponse | null = null;
  isLoading = false;
  showForm = false;
  showTotalBudgetForm = false;
  editingBudget: Budget | null = null;

  categories = [
    'Food',
    'Transport',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Health',
    'Other',
  ];

  currentPeriod: string = '';
  selectedMonth: number;
  selectedYear: number;

  private apiUrl = 'http://localhost:3000/budgets';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
  ) {
    const now = new Date();
    this.selectedMonth = now.getMonth();
    this.selectedYear = now.getFullYear();
    this.currentPeriod = this.formatPeriod(
      this.selectedYear,
      this.selectedMonth,
    );
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeTotalBudgetForm();
    this.loadBudgetStatus();
  }

  initializeForm(): void {
    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      alertEnabled: [true],
      alertThreshold: [
        80,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
    });
  }

  initializeTotalBudgetForm(): void {
    this.totalBudgetForm = this.fb.group({
      totalAmount: ['', [Validators.required, Validators.min(1)]],
    });
  }

  formatPeriod(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }

  loadBudgetStatus(): void {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const period = this.formatPeriod(this.selectedYear, this.selectedMonth);

    this.http
      .get<BudgetResponse>(`${this.apiUrl}/status/${period}`, { headers })
      .subscribe({
        next: (response) => {
          this.budgetStatus = response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading budget status:', error);
          this.isLoading = false;
          if (error.status === 401) {
            this.router.navigate(['/login']);
          } else {
            this.toastService.errorToast('Failed to load budgets');
          }
        },
      });
  }

  openCreateForm(): void {
    this.editingBudget = null;
    this.budgetForm.reset({
      category: '',
      amount: '',
      alertEnabled: true,
      alertThreshold: 80,
    });
    this.showForm = true;
  }

  openEditForm(budgetStatus: BudgetStatus): void {
    this.editingBudget = budgetStatus.budget;
    this.budgetForm.patchValue({
      category: budgetStatus.budget.category,
      amount: budgetStatus.budget.amount,
      alertEnabled: budgetStatus.budget.alertEnabled,
      alertThreshold: budgetStatus.budget.alertThreshold,
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingBudget = null;
    this.budgetForm.reset();
  }

  openTotalBudgetForm(): void {
    if (this.budgetStatus) {
      this.totalBudgetForm.patchValue({
        totalAmount: this.budgetStatus.totalBudget,
      });
    }
    this.showTotalBudgetForm = true;
  }

  closeTotalBudgetForm(): void {
    this.showTotalBudgetForm = false;
    this.totalBudgetForm.reset();
  }

  saveTotalBudget(): void {
    if (this.totalBudgetForm.invalid) {
      Object.keys(this.totalBudgetForm.controls).forEach((key) => {
        this.totalBudgetForm.get(key)?.markAsTouched();
      });
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const totalBudgetData = {
      totalBudget: this.totalBudgetForm.get('totalAmount')?.value,
      period: this.formatPeriod(this.selectedYear, this.selectedMonth),
    };

    this.http
      .post(`${this.apiUrl}/set-total`, totalBudgetData, { headers })
      .subscribe({
        next: () => {
          this.closeTotalBudgetForm();
          this.toastService.successToast('Total budget updated successfully');
          this.loadBudgetStatus();
        },
        error: (error) => {
          console.error('Error setting total budget:', error);
          this.toastService.errorToast('Failed to set total budget');
        },
      });
  }

  saveBudget(): void {
    if (this.budgetForm.invalid) {
      Object.keys(this.budgetForm.controls).forEach((key) => {
        this.budgetForm.get(key)?.markAsTouched();
      });
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const budgetData = {
      ...this.budgetForm.value,
      period: this.formatPeriod(this.selectedYear, this.selectedMonth),
    };

    if (this.editingBudget?._id) {
      // Update existing budget
      this.http
        .patch(`${this.apiUrl}/${this.editingBudget._id}`, budgetData, {
          headers,
        })
        .subscribe({
          next: () => {
            this.closeForm();
            this.toastService.successToast('Budget updated successfully');
            this.loadBudgetStatus();
          },
          error: (error) => {
            console.error('Error updating budget:', error);
            this.toastService.errorToast('Failed to update budget');
          },
        });
    } else {
      // Create new budget
      this.http.post(this.apiUrl, budgetData, { headers }).subscribe({
        next: () => {
          this.closeForm();
          this.toastService.successToast('Budget created successfully');
          this.loadBudgetStatus();
        },
        error: (error) => {
          console.error('Error creating budget:', error);
          this.toastService.errorToast('Failed to create budget');
        },
      });
    }
  }

  async deleteBudget(budgetId: string): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Budget',
      message:
        'Are you sure you want to delete this budget? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
    });

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.delete(`${this.apiUrl}/${budgetId}`, { headers }).subscribe({
      next: () => {
        this.toastService.successToast('Budget deleted successfully');
        this.loadBudgetStatus();
      },
      error: (error) => {
        console.error('Error deleting budget:', error);
        this.toastService.errorToast('Failed to delete budget');
      },
    });
  }

  changeMonth(direction: number): void {
    this.selectedMonth += direction;
    if (this.selectedMonth > 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else if (this.selectedMonth < 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    }
    this.currentPeriod = this.formatPeriod(
      this.selectedYear,
      this.selectedMonth,
    );
    this.loadBudgetStatus();
  }

  getMonthName(month: number): string {
    const date = new Date(2000, month, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  }

  formatCurrency(amount: number): string {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getProgressBarColor(percentUsed: number, isOverBudget: boolean): string {
    if (isOverBudget) return 'bg-red-500';
    if (percentUsed >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getStatusBadgeColor(budgetStatus: BudgetStatus): string {
    if (budgetStatus.isOverBudget) return 'bg-red-100 text-red-700';
    if (budgetStatus.isNearLimit) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  getStatusText(budgetStatus: BudgetStatus): string {
    if (budgetStatus.isOverBudget) return 'Over Budget';
    if (budgetStatus.isNearLimit) return 'Near Limit';
    return 'On Track';
  }

  hasBudget(category: string): boolean {
    return (
      this.budgetStatus?.budgets.some((b) => b.budget.category === category) ||
      false
    );
  }
}
