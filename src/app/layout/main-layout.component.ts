import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: [],
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = true;
  userEmail: string = '';
  currentRoute: string = '';

  navigationItems = [
    {
      label: 'Expense tracker',
      icon: 'dashboard',
      route: '/dashboard',
      active: false,
    },

    {
      label: 'Tax Calculator',
      icon: 'calculator',
      route: '/tax-calculator',
      active: false,
    },
    {
      label: 'Budgets',
      icon: 'budget',
      route: '/budgets',
      active: false,
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
    this.updateActiveRoute();

    // Listen to route changes
    this.router.events.subscribe(() => {
      this.updateActiveRoute();
    });
  }

  loadUserData(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userEmail = payload.email || 'user@example.com';
    }
  }

  updateActiveRoute(): void {
    this.currentRoute = this.router.url;
    this.navigationItems.forEach((item) => {
      item.active = this.currentRoute === item.route;
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getCurrentPageTitle(): string {
    const activeItem = this.navigationItems.find((item) => item.active);
    return activeItem ? activeItem.label : 'Expense Tracker';
  }
}
