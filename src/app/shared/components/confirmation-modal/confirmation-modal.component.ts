import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../confirmation-modal/confirmation.service';
import { ConfirmationDialogState } from '../../models/confirmation.model';
@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="dialogState.isOpen"
      class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
      [@fadeInOut]
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 animate-in"
        [@slideIn]
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ dialogState.title }}
          </h2>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <p class="text-gray-600">{{ dialogState.message }}</p>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            (click)="cancel()"
            class="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            {{ dialogState.cancelText }}
          </button>
          <button
            (click)="confirm()"
            [class]="
              'px-4 py-2 text-white font-medium rounded-lg transition ' +
              (dialogState.isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-black hover:bg-gray-900')
            "
          >
            {{ dialogState.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmationModalComponent implements OnInit {
  dialogState: ConfirmationDialogState = {
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDangerous: false,
    isOpen: false,
  };

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.confirmationService.getDialogState().subscribe((state) => {
      this.dialogState = state;
    });
  }

  confirm(): void {
    this.confirmationService.confirm_action();
  }

  cancel(): void {
    this.confirmationService.cancel_action();
  }
}
