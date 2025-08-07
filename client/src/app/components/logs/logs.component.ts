import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LogService, Log } from '../../services/log.service';
import { AuthService } from '../../services/auth.service';
import { RefreshButtonComponent } from '../refresh-button/refresh-button.component';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatSnackBarModule,
    RefreshButtonComponent,
  ],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li>Logs</li>
    </ul>

    <h3>Logs</h3>

    <p>
      <span *ngIf="isAdmin()">
        <a href="" (click)="clearLogs()"> 🗑️ Clear </a>
        &nbsp;&nbsp;&nbsp;
      </span>
      <span>
        <a href="" (click)="saveLogs()"> 💾 Save </a>
        &nbsp;&nbsp;&nbsp;
      </span>
      <span>
        <app-refresh-button (refresh)="refresh()"></app-refresh-button>
        &nbsp;&nbsp;&nbsp;
      </span>
    </p>

    <h4 *ngIf="loading">Loading...</h4>
    <h4 *ngIf="clearing">Clearing...</h4>
    <h4 *ngIf="errorLoading" class="alert alert-danger">
      Unable to load logs at this time.
    </h4>
    <h4
      *ngIf="!logs.length && !loading && !clearing && !errorLoading"
      class="alert alert-info"
    >
      There are no logs at this time.
    </h4>

    <div *ngIf="logs.length && !loading && !clearing && !errorLoading">
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>UUID</th>
            <th>Member</th>
            <th>Resource</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let log of logs" [ngClass]="{ warning: !log.granted }">
            <td>{{ log._created | date : 'short' }}</td>
            <td>{{ log.uuid }}</td>
            <td>{{ log.member }}</td>
            <td>{{ log.resource }}</td>
            <td>{{ log.granted ? 'Success' : log.reason }}</td>
          </tr>
        </tbody>
      </table>
      <nav>
        <ul class="pagination">
          <li class="page-item" [ngClass]="{ disabled: page == 1 }">
            <a class="page-link" href="" (click)="newer()"
              ><span aria-hidden="true">&larr;</span>Newer</a
            >
          </li>
          <li class="page-item" [ngClass]="{ disabled: lastPage }">
            <a class="page-link" href="" (click)="older()"
              >Older<span aria-hidden="true">&rarr;</span></a
            >
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: [
    `
      .warning {
        background-color: #fcf8e3;
      }
    `,
  ],
})
export class LogsComponent implements OnInit {
  logs: Log[] = [];
  page = 1;
  lastPage = false;
  loading = false;
  clearing = false;
  errorLoading = false;

  constructor(
    private logService: LogService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.errorLoading = false;

    this.logService.getLogs(this.page).subscribe({
      next: (response) => {
        this.loading = false;
        this.errorLoading = false;
        this.logs = response._items;
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
    this.loadLogs();
  }

  newer() {
    if (this.page > 1) {
      this.page--;
      this.loadLogs();
    }
  }

  older() {
    if (!this.lastPage) {
      this.page++;
      this.loadLogs();
    }
  }

  clearLogs() {
    this.clearing = true;
    this.logService.clearLogs().subscribe({
      next: () => {
        this.clearing = false;
        this.snackBar.open('Logs successfully cleared!', '', {
          duration: 2000,
        });
        this.loadLogs();
      },
      error: () => {
        this.clearing = false;
        this.snackBar.open('Unable to clear logs at this time.', 'Error', {
          duration: 3000,
        });
      },
    });
  }

  saveLogs() {
    // Implementation for saving logs would go here
    this.snackBar.open('Save functionality not implemented yet.', 'Info', {
      duration: 2000,
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
