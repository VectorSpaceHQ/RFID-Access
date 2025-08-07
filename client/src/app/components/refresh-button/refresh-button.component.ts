import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-refresh-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="btn btn-secondary" (click)="onRefresh()">↻ Refresh</button>
  `,
  styles: [],
})
export class RefreshButtonComponent {
  @Output() refresh = new EventEmitter<void>();

  onRefresh() {
    this.refresh.emit();
  }
}
