import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { CategoryChartData, MonthlyChartData } from '../models/chart.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Pie Chart Card -->
      <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          Expenses by Category
        </h2>
        <div class="flex items-center justify-center" style="height: 300px;">
          <canvas #pieChart></canvas>
        </div>
      </div>

      <!-- Bar Chart Card -->
      <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          Monthly Trend (Last 6 Months)
        </h2>
        <div class="flex items-center justify-center" style="height: 300px;">
          <canvas #barChart></canvas>
        </div>
      </div>
    </div>
  `,
})
export class DashboardChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  @Input() categoryData: CategoryChartData[] = [];
  @Input() monthlyData: MonthlyChartData[] = [];

  private pieChart: Chart | null = null;
  private barChart: Chart | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Only create charts if we have data
    if (this.categoryData.length > 0 || this.monthlyData.length > 0) {
      this.createPieChart();
      this.createBarChart();
    }
  }

  private createPieChart(): void {
    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    if (!ctx || this.categoryData.length === 0) return;

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const total = this.categoryData.reduce((sum, item) => sum + item.amount, 0);

    if (total === 0) return;

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.categoryData.map((item) => item.category),
        datasets: [
          {
            data: this.categoryData.map((item) => item.amount),
            backgroundColor: this.categoryData.map((item) => item.color),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                return `${label}: ₦s${value} (${percentage}%)`;
              },
            },
          },
        },
        layout: {
          padding: 20,
        },
      },
      plugins: [
        {
          id: 'customLabels',
          afterDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;
            const radius =
              Math.min(
                chartArea.right - chartArea.left,
                chartArea.bottom - chartArea.top,
              ) / 2;

            chart.data.datasets[0].data.forEach((value, index) => {
              const meta = chart.getDatasetMeta(0);
              const arc = meta.data[index] as any;
              const angle = (arc.startAngle + arc.endAngle) / 2;

              // Calculate position for label (outside the pie)
              const labelRadius = radius + 40;
              const x = centerX + Math.cos(angle) * labelRadius;
              const y = centerY + Math.sin(angle) * labelRadius;

              const label = chart.data.labels?.[index] || '';
              const percentage =
                total > 0 ? ((Number(value) / total) * 100).toFixed(0) : 0;

              ctx.save();
              ctx.font = 'bold 14px sans-serif';
              ctx.textAlign = x > centerX ? 'left' : 'right';
              ctx.textBaseline = 'middle';

              // Draw category name
              ctx.fillStyle = this.categoryData[index].color;
              ctx.fillText(`${label} ${percentage}%`, x, y);

              ctx.restore();
            });
          },
        },
      ],
    });
  }

  private createBarChart(): void {
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx || this.monthlyData.length === 0) return;

    // Destroy existing chart if it exists
    if (this.barChart) {
      this.barChart.destroy();
    }

    // Calculate max value for Y axis (round up to nearest 50)
    const maxAmount = Math.max(
      ...this.monthlyData.map((item) => item.amount),
      10,
    );
    const yAxisMax = Math.ceil(maxAmount / 50) * 50 + 50;

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.monthlyData.map((item) => item.month),
        datasets: [
          {
            data: this.monthlyData.map((item) => item.amount),
            backgroundColor: '#000000',
            borderRadius: 8,
            barThickness: 60,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: yAxisMax,
            ticks: {
              stepSize: Math.ceil(yAxisMax / 4),
              font: {
                size: 12,
              },
              color: '#6B7280',
            },
            grid: {
              color: '#E5E7EB',
              // drawBorder: false
            },
            border: {
              display: false,
            },
          },
          x: {
            ticks: {
              font: {
                size: 12,
              },
              color: '#6B7280',
            },
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `₦${context.parsed.y}`;
              },
            },
          },
        },
      },
    });
  }

  updateCharts(
    categoryData: CategoryChartData[],
    monthlyData: MonthlyChartData[],
  ): void {
    this.categoryData = categoryData;
    this.monthlyData = monthlyData;

    if (this.pieChart) {
      this.createPieChart();
    }
    if (this.barChart) {
      this.createBarChart();
    }
  }
}
