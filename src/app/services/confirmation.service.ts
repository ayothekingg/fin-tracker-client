import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export interface ConfirmationDialogState extends ConfirmationDialogConfig {
  isOpen: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private dialogState$ = new BehaviorSubject<ConfirmationDialogState>({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDangerous: false,
    isOpen: false,
  });

  private resolveCallback: ((result: boolean) => void) | null = null;

  getDialogState(): Observable<ConfirmationDialogState> {
    return this.dialogState$.asObservable();
  }

  confirm(config: ConfirmationDialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
      this.dialogState$.next({
        ...config,
        confirmText: config.confirmText || 'Confirm',
        cancelText: config.cancelText || 'Cancel',
        isDangerous: config.isDangerous || false,
        isOpen: true,
      });
    });
  }

  confirm_action(): void {
    this.closeDialog(true);
  }

  cancel_action(): void {
    this.closeDialog(false);
  }

  private closeDialog(result: boolean): void {
    this.dialogState$.next({
      ...this.dialogState$.value,
      isOpen: false,
    });
    if (this.resolveCallback) {
      this.resolveCallback(result);
      this.resolveCallback = null;
    }
  }
}
