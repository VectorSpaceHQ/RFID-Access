import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { KeycodeService, Keycode } from '../../services/keycode.service';
import { AuthService } from '../../services/auth.service';
import { ResourceService } from '../../services/resource.service';
import { RefreshButtonComponent } from '../refresh-button/refresh-button.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-keycodes',
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
      <li>Keycodes</li>
    </ul>

    <h3>Keycodes</h3>

    <p>
      <span *ngIf="isAdmin()">
        <a routerLink="/addkeycode">+ Add new code</a>
        &nbsp;&nbsp;&nbsp;
      </span>
      <app-refresh-button (refresh)="refresh()"></app-refresh-button>
    </p>

    <h4 *ngIf="loading">Loading...</h4>
    <h4 *ngIf="errorLoading" class="alert alert-danger">
      Unable to load keycodes at this time.
    </h4>
    <h4
      *ngIf="!keycodes.length && !loading && !errorLoading"
      class="alert alert-info"
    >
      There are no keycodes at this time.
    </h4>

    <div *ngIf="keycodes.length && !loading && !errorLoading">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Daily Start Time</th>
            <th>Daily End Time</th>
            <th>Resources</th>
            <th *ngIf="isAdmin()"></th>
            <th *ngIf="isAdmin()"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let kc of keycodes"
            [ngClass]="{ 'removing danger': kc.removing }"
          >
            <td>{{ kc.name }}</td>
            <td>{{ kc.code }}</td>
            <td>{{ kc.start_date }}</td>
            <td>{{ kc.end_date }}</td>
            <td>{{ kc.daily_start_time }}</td>
            <td>{{ kc.daily_end_time }}</td>
            <td>
              <div *ngFor="let res of getResourceArray(kc.resource)">
                {{ resourceNames[res] || res }}
              </div>
            </td>
            <td *ngIf="isAdmin()">
              <a [routerLink]="['/editkeycode', kc.id]"> ✏️ Edit </a>
            </td>
            <td *ngIf="isAdmin()">
              <a
                href=""
                (click)="showRemoveConfirmation(kc); $event.preventDefault()"
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
      modalId="removeKeycodeModal"
      title="Remove Keycode"
      message="Are you sure you want to remove this keycode? This action cannot be undone."
      (confirmed)="removeKeycode()"
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
export class KeycodesComponent implements OnInit {
  keycodes: Keycode[] = [];
  selectedKeycode: Keycode | null = null;
  page = 1;
  lastPage = false;
  loading = false;
  errorLoading = false;
  resourceNames: { [key: string]: string } = {};

  constructor(
    private keycodeService: KeycodeService,
    private resourceService: ResourceService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadKeycodes();
    this.loadResourceNames();
  }

  loadKeycodes() {
    this.loading = true;
    this.errorLoading = false;

    this.keycodeService.getKeycodes(this.page).subscribe({
      next: (response) => {
        this.loading = false;
        this.errorLoading = false;
        this.keycodes = response._items;
        this.lastPage =
          response._meta.max_results * this.page >= response._meta.total;
      },
      error: () => {
        this.loading = false;
        this.errorLoading = true;
      },
    });
  }

  loadResourceNames() {
    this.resourceService.getResources(1).subscribe({
      next: (response) => {
        response._items.forEach((resource) => {
          this.resourceNames[String(resource.id)] = resource.name;
        });
      },
    });
  }

  refresh() {
    this.page = 1;
    this.loadKeycodes();
  }

  next() {
    if (!this.lastPage) {
      this.page++;
      this.loadKeycodes();
    }
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.loadKeycodes();
    }
  }

  showRemoveConfirmation(kc: Keycode) {
    this.selectedKeycode = kc;
    const modalElement = document.getElementById('removeKeycodeModal');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      document.body.classList.add('modal-open');
    }
  }

  removeKeycode() {
    if (!this.selectedKeycode || this.selectedKeycode.removing) {
      return;
    }

    this.selectedKeycode.removing = true;

    this.keycodeService
      .removeKeycode(this.selectedKeycode.id, this.selectedKeycode._etag)
      .subscribe({
        next: () => {
          this.snackBar.open('Keycode successfully removed!', '', {
            duration: 2000,
          });
          if (this.keycodes.length === 1 && this.page > 1) {
            this.page--;
          }
          this.loadKeycodes();
        },
        error: (error) => {
          if (this.selectedKeycode) {
            this.selectedKeycode.removing = false;
          }
          let message = 'Unable to remove keycode at this time.';

          if (error.status === 404) {
            message = 'This keycode no longer exists.';
          } else if (error.status === 412) {
            message = 'This keycode has changed since it was loaded.';
          }

          this.snackBar.open(message, 'Error Removing Keycode', {
            duration: 3000,
          });
          this.loadKeycodes();
        },
      });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getResourceArray(resources: string | null | undefined): string[] {
    if (!resources) return [];
    return resources
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  }
}
