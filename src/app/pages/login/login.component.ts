import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  activeTab: 'login' | 'signup' = 'login';

  setActiveTab(tab: 'login' | 'signup') {
    this.activeTab = tab;

    if (tab === 'login') {
      this.router.navigate(['/login']);
    }

    if (tab === 'signup') {
      this.router.navigate(['/register']);
    }
  }

  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => alert(err.error.message),
    });
  }
}
