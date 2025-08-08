import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, RouterLink],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li><a routerLink="/users">Users</a></li>
      <li>Add User</li>
    </ul>

    <h3>Add User</h3>

    <h4 *ngIf="adding">Adding...</h4>

    <form [formGroup]="addForm" (ngSubmit)="addUser()" *ngIf="!adding">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          name="username"
          id="username"
          formControlName="username"
          class="form-control"
          required
        />
        <div
          class="alert-danger"
          *ngIf="
            addForm.get('username')?.dirty && addForm.get('username')?.invalid
          "
        >
          Invalid username!
        </div>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          name="password"
          id="password"
          type="password"
          class="form-control"
          formControlName="password"
          required
        />
        <div
          class="alert-danger"
          *ngIf="
            addForm.get('password')?.dirty && addForm.get('password')?.invalid
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
          *ngIf="addForm.get('confirmPassword')?.dirty && !passwordsMatch()"
        >
          Passwords don't match!
        </div>
      </div>
      <div class="form-group">
        <div class="checkbox">
          <label>
            <input
              id="admin"
              type="checkbox"
              formControlName="isAdmin"
            />Administrator
          </label>
        </div>
      </div>
      <button
        type="submit"
        class="btn btn-outline me-3"
        [disabled]="addForm.invalid || adding || !passwordsMatch()"
      >
        Add
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
export class AddUserComponent {
  addForm: FormGroup;
  adding = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.addForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[\w ]+$/)]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      isAdmin: [false],
    });
  }

  passwordsMatch(): boolean {
    const password = this.addForm.get('password')?.value;
    const confirmPassword = this.addForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  addUser(): void {
    if (this.addForm.valid && this.passwordsMatch()) {
      this.adding = true;
      const { username, password, isAdmin } = this.addForm.value;

      this.userService.addUser({ username, admin: isAdmin }).subscribe({
        next: () => {
          this.snackBar.open('User successfully added!', '', {
            duration: 2000,
          });
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.adding = false;
          let message = 'Unable to add user at this time.';

          if (error.status === 409) {
            message = 'Username already exists.';
          }

          this.snackBar.open(message, 'Error Adding User', {
            duration: 3000,
          });
        },
      });
    }
  }
}
