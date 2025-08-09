import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="modal fade"
      [id]="modalId"
      tabindex="-1"
      [attr.aria-labelledby]="modalId + '-label'"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" [id]="modalId + '-label'">{{ title }}</h5>
            <button
              type="button"
              class="btn-close"
              (click)="closeModal()"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            {{ message }}
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="closeModal()"
            >
              Cancel
            </button>
            <button type="button" class="btn btn-danger" (click)="confirm()">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ConfirmationModalComponent {
  @Input() modalId: string = 'confirmationModal';
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Output() confirmed = new EventEmitter<void>();

  confirm() {
    this.confirmed.emit();
    this.closeModal();
  }

  closeModal() {
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      // Remove the 'show' class and add 'fade' class to hide the modal
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      // Remove backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
    }
  }
}
