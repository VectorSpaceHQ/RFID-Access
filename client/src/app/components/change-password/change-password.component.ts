import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li><a routerLink="/users">Users</a></li>
      <li>Change Password</li>
    </ul>

    <h3>Change Password</h3>

    <h4 *ngIf="changing">Changing...</h4>

    <form
      [formGroup]="passwordForm"
      (ngSubmit)="changePassword()"
      *ngIf="!changing"
    >
      <div class="form-group">
        <label for="newPassword">New Password</label>
        <input
          name="newPassword"
          id="newPassword"
          type="password"
          class="form-control"
          formControlName="newPassword"
          required
        />
        <div
          class="alert-danger"
          *ngIf="
            passwordForm.get('newPassword')?.dirty &&
            passwordForm.get('newPassword')?.invalid
          "
        >
          Password is required!
        </div>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          name="confirmPassword"
          id="confirmPassword"
          type="password"
          class="form-control"
          formControlName="confirmPassword"
          required
        />
        <div
          class="alert-danger"
          *ngIf="
            passwordForm.get('confirmPassword')?.dirty && !passwordsMatch()
          "
        >
          Passwords don't match!
        </div>
      </div>
      <button
        type="submit"
        class="btn btn-default"
        [disabled]="passwordForm.invalid || changing || !passwordsMatch()"
      >
        Change Password
      </button>
      <a routerLink="/users">Cancel</a>
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
      .alert-danger {
        color: #a94442;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  changing = false;
  userId = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
  }

  passwordsMatch(): boolean {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;
    return newPassword === confirmPassword;
  }

  changePassword() {
    if (this.passwordForm.valid && this.passwordsMatch()) {
      this.changing = true;
      const { newPassword } = this.passwordForm.value;

      this.userService
        .saveUser(this.userId, '', { password: newPassword } as any)
        .subscribe({
          next: () => {
            this.snackBar.open('Password successfully changed!', '', {
              duration: 2000,
            });
            this.router.navigate(['/users']);
          },
          error: (error) => {
            this.changing = false;
            let message = 'Unable to change password at this time.';

            if (error.status === 404) {
              message = 'User not found.';
            }

            this.snackBar.open(message, 'Error Changing Password', {
              duration: 3000,
            });
          },
        });
    }
  }
}
