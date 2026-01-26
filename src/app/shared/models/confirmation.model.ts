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
