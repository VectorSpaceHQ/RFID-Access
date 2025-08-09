import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="container">
      <div class="header-bar">
        <h2>Vector Space RFID Access 5</h2>
        <button
          *ngIf="authService.isLoggedIn()"
          id="login-button"
          class="btn btn-outline"
          (click)="logout()"
        >
          Logout
        </button>
      </div>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .header-bar {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
        padding: 1rem;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-bar h2 {
        margin: 0;
      }
    `,
  ],
})
export class AppComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
