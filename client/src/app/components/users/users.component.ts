import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li>Users</li>
    </ul>

    <h3>Users</h3>

    <p>
      <span *ngIf="isAdmin()">
        <a routerLink="/adduser"
          ><span class="glyphicon glyphicon-plus"></span> Add new user</a
        >
        &nbsp;&nbsp;&nbsp;
      </span>
      <a href="" (click)="refresh()"
        ><span class="glyphicon glyphicon-refresh"></span> Refresh</a
      >
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
        <tr>
          <th>Username</th>
          <th>Admin</th>
          <th *ngIf="isAdmin()"></th>
          <th *ngIf="isAdmin()"></th>
          <th *ngIf="isAdmin()"></th>
        </tr>
        <tr
          *ngFor="let user of users"
          [ngClass]="{ 'removing danger': user.removing }"
        >
          <td>{{ user.username }}</td>
          <td>{{ user.admin ? 'Yes' : 'No' }}</td>
          <td *ngIf="isAdmin()">
            <a [routerLink]="['/changeuserpassword', user._id]">
              <span class="glyphicon glyphicon-lock"></span> Change Password
            </a>
          </td>
          <td *ngIf="isAdmin()">
            <a [routerLink]="['/edituser', user._id]">
              <span class="glyphicon glyphicon-pencil"></span> Edit
            </a>
          </td>
          <td *ngIf="isAdmin()">
            <a href="" (click)="removeUser(user)">
              <span class="glyphicon glyphicon-remove"></span> Remove
            </a>
          </td>
        </tr>
      </table>
      <nav *ngIf="!(page == 1 && lastPage)">
        <ul class="pager">
          <li class="previous" [ngClass]="{ disabled: page == 1 }">
            <a href="" (click)="prev()"
              ><span aria-hidden="true">&larr;</span>Prev</a
            >
          </li>
          <li class="next" [ngClass]="{ disabled: lastPage }">
            <a href="" (click)="next()"
              >Next<span aria-hidden="true">&rarr;</span></a
            >
          </li>
        </ul>
      </nav>
    </div>
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

  removeUser(user: User) {
    if (!user.removing) {
      user.removing = true;

      this.userService.removeUser(user._id, user._etag).subscribe({
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
          user.removing = false;
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
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
