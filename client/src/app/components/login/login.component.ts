import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  template: `
    <ul class="breadcrumb">
      <li>Login</li>
    </ul>

    <h4 *ngIf="loading">Logging in...</h4>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" *ngIf="!loading">
      <div class="form-group">
        <label for="username">Username</label><br />
        <input
          id="username"
          formControlName="username"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label><br />
        <input
          id="password"
          type="password"
          formControlName="password"
          class="form-control"
          required
        />
      </div>
      <button
        class="btn btn-default"
        type="submit"
        [disabled]="loginForm.invalid || loading"
      >
        Login
      </button>
    </form>
  `,
  styles: [
    `
      .form-group {
        margin-bottom: 1rem;
      }
      .form-control {
        width: 100%;
        padding: 0.5rem;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          let message = 'Unable to login at this time.';

          if (error.status === 401) {
            message = 'Incorrect username or password';
          }

          this.snackBar.open(message, 'Login Failed', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }
}
