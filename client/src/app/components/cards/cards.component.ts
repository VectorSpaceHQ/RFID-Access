import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CardService, Card } from '../../services/card.service';
import { ResourceService } from '../../services/resource.service';
import { AuthService } from '../../services/auth.service';
import { RefreshButtonComponent } from '../refresh-button/refresh-button.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-cards',
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
      <li>Cards</li>
    </ul>

    <h3>Cards</h3>

    <p>
      <app-refresh-button (refresh)="refresh()"></app-refresh-button>
    </p>

    <h4 *ngIf="loading">Loading...</h4>
    <h4 *ngIf="errorLoading" class="alert alert-danger">
      Unable to load cards at this time.
    </h4>
    <h4
      *ngIf="!cards.length && !loading && !errorLoading"
      class="alert alert-info"
    >
      There are no cards at this time.
    </h4>

    <div *ngIf="cards.length && !loading && !errorLoading">
      <table class="table">
        <thead>
          <tr>
            <th>Created</th>
            <th>UUID</th>
            <th>Member</th>
            <th>Resources</th>
            <th *ngIf="isAdmin()"></th>
            <th *ngIf="isAdmin()"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let card of cards"
            [ngClass]="{ 'removing danger': card.removing }"
          >
            <td>{{ card._created | date : 'short' }}</td>
            <td>{{ card.uuid }}</td>
            <td>{{ card.member }}</td>
            <td>
              <div *ngFor="let resource of getResourceArray(card.resources)">
                {{ resourceNames[resource] }}
              </div>
            </td>
            <td *ngIf="isAdmin()">
              <a [routerLink]="['/editcard', card.id]"> ✏️ Edit </a>
            </td>
            <td *ngIf="isAdmin()">
              <a
                href=""
                (click)="showRemoveConfirmation(card); $event.preventDefault()"
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
      modalId="removeCardModal"
      title="Remove Card"
      message="Are you sure you want to remove this card? This action cannot be undone."
      (confirmed)="removeCard()"
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
export class CardsComponent implements OnInit {
  cards: any[] = [];
  selectedCard: any = null;
  resourceNames: { [key: string]: string } = {};
  page = 1;
  lastPage = false;
  loading = false;
  errorLoading = false;

  constructor(
    private cardService: CardService,
    private resourceService: ResourceService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCards();
    this.loadResourceNames();
  }

  loadCards() {
    this.loading = true;
    this.errorLoading = false;

    this.cardService.getCards(this.page).subscribe({
      next: (response) => {
        this.loading = false;
        this.errorLoading = false;
        this.cards = response._items;
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
          this.resourceNames[resource.id] = resource.name;
        });
      },
    });
  }

  refresh() {
    this.page = 1;
    this.loadCards();
  }

  next() {
    if (!this.lastPage) {
      this.page++;
      this.loadCards();
    }
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.loadCards();
    }
  }

  showRemoveConfirmation(card: any) {
    this.selectedCard = card;
    const modalElement = document.getElementById('removeCardModal');
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

  removeCard() {
    if (!this.selectedCard || this.selectedCard.removing) {
      return;
    }

    this.selectedCard.removing = true;

    this.cardService
      .removeCard(this.selectedCard.id, this.selectedCard._etag)
      .subscribe({
        next: () => {
          this.snackBar.open('Card successfully removed!', '', {
            duration: 2000,
          });
          if (this.cards.length === 1 && this.page > 1) {
            this.page--;
          }
          this.loadCards();
        },
        error: (error) => {
          if (this.selectedCard) {
            this.selectedCard.removing = false;
          }
          let message = 'Unable to remove card at this time.';

          if (error.status === 404) {
            message = 'This card no longer exists.';
          } else if (error.status === 412) {
            message = 'This card has changed since it was loaded.';
          }

          this.snackBar.open(message, 'Error Removing Card', {
            duration: 3000,
          });
          this.loadCards();
        },
      });
  }

  getResourceArray(resources: string): string[] {
    if (!resources) return [];
    return resources.split(',').filter((r) => r.trim());
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
