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

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css',
})
export class AddExpenseComponent implements OnInit {
  expenseForm!: FormGroup;
  userEmail: string = '';
  selectedCategory: string = '';
  isSubmitting: boolean = false;

  categories = [
    'Food',
    'Transport',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Health',
    'Other',
  ];

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
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
    const today = new Date().toISOString().split('T')[0];

    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [today, Validators.required],
      category: ['', Validators.required],
      notes: [''],
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.expenseForm.patchValue({ category });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      Object.keys(this.expenseForm.controls).forEach((key) => {
        this.expenseForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const expenseData = {
      description: this.expenseForm.value.description,
      amount: parseFloat(this.expenseForm.value.amount),
      date: new Date(this.expenseForm.value.date),
      category: this.expenseForm.value.category,
      notes: this.expenseForm.value.notes || '',
    };

    this.http
      .post(`${this.apiUrl}/expenses`, expenseData, { headers })
      .subscribe({
        next: (response) => {
          console.log('Expense created successfully:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error creating expense:', error);
          this.isSubmitting = false;
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getFieldError(fieldName: string): string {
    const field = this.expenseForm.get(fieldName);

    if (field?.hasError('required') && field.touched) {
      return `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } is required`;
    }

    if (
      fieldName === 'description' &&
      field?.hasError('minlength') &&
      field.touched
    ) {
      return 'Description must be at least 3 characters';
    }

    if (fieldName === 'amount' && field?.hasError('min') && field.touched) {
      return 'Amount must be greater than 0';
    }

    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.expenseForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
