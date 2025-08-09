import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, RouterLink],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li><a routerLink="/users">Users</a></li>
      <li>Edit User</li>
    </ul>

    <h3>Edit User</h3>

    <h4 *ngIf="loading">Loading...</h4>
    <h4 *ngIf="saving">Saving...</h4>

    <form
      [formGroup]="editForm"
      (ngSubmit)="saveUser()"
      *ngIf="!loading && !saving"
    >
      <div class="form-group">
        <label for="username">Username</label>
        <input
          name="username"
          id="username"
          formControlName="username"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            id="admin"
            formControlName="admin"
          />
          <label class="form-check-label" for="admin">Administrator</label>
        </div>
      </div>
      <button
        type="submit"
        class="btn btn-outline me-3"
        [disabled]="editForm.invalid || saving"
      >
        Save
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
    `,
  ],
})
export class EditUserComponent implements OnInit {
  editForm: FormGroup;
  loading = false;
  saving = false;
  userId = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      username: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z0-9_.\- ]+$/)],
      ],
      admin: [false],
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this.loadUser();
  }

  loadUser() {
    this.loading = true;
    this.userService.getUser(Number(this.userId)).subscribe({
      next: (user) => {
        this.loading = false;
        this.editForm.patchValue({
          username: user.username,
          admin: user.admin,
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Unable to load user.', 'Error', { duration: 3000 });
        this.router.navigate(['/users']);
      },
    });
  }

  saveUser() {
    if (this.editForm.valid) {
      this.saving = true;
      const updates = this.editForm.value;

      this.userService.saveUser(Number(this.userId), '', updates).subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('User successfully updated!', '', {
            duration: 2000,
          });
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.saving = false;
          let message = 'Unable to update user at this time.';

          if (error.status === 404) {
            message = 'User not found.';
          } else if (error.status === 409) {
            message = 'Username already exists.';
          }

          this.snackBar.open(message, 'Error Updating User', {
            duration: 3000,
          });
        },
      });
    }
  }
}
