import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  activeTab: 'login' | 'register' = 'login';
  email = '';
  password = '';
  submitted = false;
  fieldErrors: { email?: string; password?: string; general?: string } = {};

  setActiveTab(tab: 'login' | 'register') {
    this.activeTab = tab;

    if (tab === 'login') {
      this.router.navigate(['/login']);
    }

    if (tab === 'register') {
      this.router.navigate(['/register']);
    }
  }

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  navigateToLandingPage() {
    this.router.navigate(['/']);
  }

  submit() {
    this.submitted = true;
    this.fieldErrors = {};
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.submitted = false;
        const payload = err?.error ?? null;
        if (payload?.field) {
          this.fieldErrors = payload.message ?? payload.error ?? 'Invalid';
        } else if (payload?.message) {
          this.fieldErrors.general = payload.message;
        } else {
          this.fieldErrors.general = 'Login failed.';
        }
      },
    });
  }
}
