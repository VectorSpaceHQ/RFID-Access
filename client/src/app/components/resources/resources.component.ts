import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ResourceService, Resource } from '../../services/resource.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li>Resources</li>
    </ul>

    <h3>Resources</h3>

    <p>
      <span *ngIf="isAdmin()">
        <a routerLink="/addresource">+ Add new resource</a>
        &nbsp;&nbsp;&nbsp;
      </span>
      <a href="" (click)="refresh()">↻ Refresh</a>
    </p>

    <h4 *ngIf="loading">Loading...</h4>
    <h4 *ngIf="errorLoading" class="alert alert-danger">
      Unable to load resources at this time.
    </h4>
    <h4
      *ngIf="!resources.length && !loading && !errorLoading"
      class="alert alert-info"
    >
      There are no resources at this time.
    </h4>

    <div *ngIf="resources.length && !loading && !errorLoading">
      <table class="table">
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th *ngIf="isAdmin()"></th>
          <th *ngIf="isAdmin()"></th>
        </tr>
        <tr
          *ngFor="let resource of resources"
          [ngClass]="{ 'removing danger': resource.removing }"
        >
          <td>{{ resource.name }}</td>
          <td>{{ resource.description }}</td>
          <td *ngIf="isAdmin()">
            <a [routerLink]="['/editresource', resource.id]"> ✏️ Edit </a>
          </td>
          <td *ngIf="isAdmin()">
            <a href="" (click)="removeResource(resource)"> ❌ Remove </a>
          </td>
        </tr>
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
  `,
  styles: [
    `
      .removing {
        text-decoration: line-through;
      }
    `,
  ],
})
export class ResourcesComponent implements OnInit {
  resources: Resource[] = [];
  page = 1;
  lastPage = false;
  loading = false;
  errorLoading = false;

  constructor(
    private resourceService: ResourceService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.loading = true;
    this.errorLoading = false;

    this.resourceService.getResources(this.page).subscribe({
      next: (response) => {
        this.loading = false;
        this.errorLoading = false;
        this.resources = response._items;
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
    this.loadResources();
  }

  next() {
    if (!this.lastPage) {
      this.page++;
      this.loadResources();
    }
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.loadResources();
    }
  }

  removeResource(resource: Resource) {
    if (!resource.removing) {
      resource.removing = true;

      this.resourceService
        .removeResource(resource.id, resource._etag)
        .subscribe({
          next: () => {
            this.snackBar.open('Resource successfully removed!', '', {
              duration: 2000,
            });
            if (this.resources.length === 1 && this.page > 1) {
              this.page--;
            }
            this.loadResources();
          },
          error: (error) => {
            resource.removing = false;
            let message = 'Unable to remove resource at this time.';

            if (error.status === 404) {
              message = 'This resource no longer exists.';
            } else if (error.status === 412) {
              message = 'This resource has changed since it was loaded.';
            }

            this.snackBar.open(message, 'Error Removing Resource', {
              duration: 3000,
            });
            this.loadResources();
          },
        });
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
