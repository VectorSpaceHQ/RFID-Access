import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="container">
      <h2>Vector Space RFID Access 5</h2>
      <p *ngIf="authService.isLoggedIn()">
        <button id="login-button" class="btn btn-default" (click)="logout()">
          Logout
        </button>
      </p>
      <p *ngIf="!authService.isLoggedIn()">Loading...</p>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .btn {
        float: right;
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
