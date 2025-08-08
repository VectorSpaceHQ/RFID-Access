import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RefreshButtonComponent } from '../refresh-button/refresh-button.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatSnackBarModule,
    RefreshButtonComponent,
    ConfirmationModalComponent,
  ],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li>Users</li>
    </ul>

    <h3>Users</h3>

    <p>
      <span *ngIf="isAdmin()">
        <a routerLink="/adduser">+ Add new user</a>
        &nbsp;&nbsp;&nbsp;
      </span>
      <app-refresh-button (refresh)="refresh()"></app-refresh-button>
    </p>

    <h4 *ngIf="loading">Loading...</h4>
    <h4 *ngIf="errorLoading" class="alert alert-danger">
      Unable to load users at this time.
    </h4>
    <h4
      *ngIf="!users.length && !loading && !errorLoading"
      class="alert alert-info"
    >
      There are no users at this time.
    </h4>

    <div *ngIf="users.length && !loading && !errorLoading">
      <table class="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Admin</th>
            <th *ngIf="isAdmin()"></th>
            <th *ngIf="isAdmin()"></th>
            <th *ngIf="isAdmin()"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let user of users"
            [ngClass]="{ 'removing danger': user.removing }"
          >
            <td>{{ user.username }}</td>
            <td>{{ user.admin ? 'Yes' : 'No' }}</td>
            <td *ngIf="isAdmin()">
              <a [routerLink]="['/changeuserpassword', user.id]">
                🔒 Change Password
              </a>
            </td>
            <td *ngIf="isAdmin()">
              <a [routerLink]="['/edituser', user.id]"> ✏️ Edit </a>
            </td>
            <td *ngIf="isAdmin()">
              <a
                href=""
                (click)="showRemoveConfirmation(user); $event.preventDefault()"
              >
                ❌ Remove
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <nav *ngIf="!(page == 1 && lastPage)">
        <ul class="pagination">
          <li class="page-item" [ngClass]="{ disabled: page == 1 }">
            <a class="page-link" href="" (click)="prev()"
              ><span aria-hidden="true">&larr;</span>Prev</a
            >
          </li>
          <li class="page-item" [ngClass]="{ disabled: lastPage }">
            <a class="page-link" href="" (click)="next()"
              >Next<span aria-hidden="true">&rarr;</span></a
            >
          </li>
        </ul>
      </nav>
    </div>

    <app-confirmation-modal
      modalId="removeUserModal"
      title="Remove User"
      message="Are you sure you want to remove this user? This action cannot be undone."
      (confirmed)="removeUser()"
    ></app-confirmation-modal>
  `,
  styles: [
    `
      .removing {
        text-decoration: line-through;
      }
    `,
  ],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  page = 1;
  lastPage = false;
  loading = false;
  errorLoading = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.errorLoading = false;

    this.userService.getUsers(this.page).subscribe({
      next: (response) => {
        this.loading = false;
        this.errorLoading = false;
        this.users = response._items;
        this.lastPage =
          response._meta.max_results * this.page >= response._meta.total;
      },
      error: () => {
        this.loading = false;
        this.errorLoading = true;
      },
    });
  }

  refresh() {
    this.page = 1;
    this.loadUsers();
  }

  next() {
    if (!this.lastPage) {
      this.page++;
      this.loadUsers();
    }
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }

  showRemoveConfirmation(user: User) {
    this.selectedUser = user;
    const modalElement = document.getElementById('removeUserModal');
    if (modalElement) {
      // Show the modal manually
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      // Add modal-open class to body
      document.body.classList.add('modal-open');
    }
  }

  removeUser() {
    if (!this.selectedUser || this.selectedUser.removing) {
      return;
    }

    this.selectedUser.removing = true;

    this.userService
      .removeUser(this.selectedUser.id, this.selectedUser._etag)
      .subscribe({
        next: () => {
          this.snackBar.open('User successfully removed!', '', {
            duration: 2000,
          });
          if (this.users.length === 1 && this.page > 1) {
            this.page--;
          }
          this.loadUsers();
        },
        error: (error) => {
          if (this.selectedUser) {
            this.selectedUser.removing = false;
          }
          let message = 'Unable to remove user at this time.';

          if (error.status === 404) {
            message = 'This user no longer exists.';
          } else if (error.status === 412) {
            message = 'This user has changed since it was loaded.';
          }

          this.snackBar.open(message, 'Error Removing User', {
            duration: 3000,
          });
          this.loadUsers();
        },
      });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
