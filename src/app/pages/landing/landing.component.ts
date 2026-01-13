import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {
  features = [
    {
      icon: 'chart',
      title: 'Visual Analytics',
      description:
        'Beautiful charts and graphs that make understanding your spending patterns effortless',
    },
    {
      icon: 'pie',
      title: 'Category Breakdown',
      description:
        'Automatically categorize expenses and see exactly where your money goes',
    },
    {
      icon: 'trending',
      title: 'Monthly Trends',
      description:
        'Track spending over time and identify trends to make better financial decisions',
    },
    {
      icon: 'zap',
      title: 'Quick Entry',
      description:
        'Add expenses in seconds with our streamlined, intuitive interface',
    },
    {
      icon: 'shield',
      title: 'Secure & Private',
      description:
        'Your financial data is stored securely and remains completely private',
    },
    {
      icon: 'target',
      title: 'Budget Insights',
      description:
        'Get actionable insights to help you stay within budget and save more',
    },
  ];

  stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '$2M+', label: 'Expenses Tracked' },
    { value: '25%', label: 'Average Savings Increase' },
  ];

  constructor(private router: Router) {}

  navigateToSignIn(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignUp(): void {
    this.router.navigate(['/register']);
  }

  viewDemo(): void {
    // You can create a demo account or show a demo dashboard
    this.router.navigate(['/demo']);
  }
}
