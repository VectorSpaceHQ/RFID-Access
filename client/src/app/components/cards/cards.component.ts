import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CardService, Card } from '../../services/card.service';
import { ResourceService } from '../../services/resource.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li>Cards</li>
    </ul>

    <h3>Cards</h3>

    <p>
      <a href="" (click)="refresh()"
        ><span class="glyphicon glyphicon-refresh"></span> Refresh</a
      >
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
        <tr>
          <th>UUID</th>
          <th>Member</th>
          <th>Resources</th>
          <th *ngIf="isAdmin()"></th>
          <th *ngIf="isAdmin()"></th>
        </tr>
        <tr
          *ngFor="let card of cards"
          [ngClass]="{ 'removing danger': card.removing }"
        >
          <td>{{ card.uuid }}</td>
          <td>{{ card.member }}</td>
          <td>
            <div *ngFor="let resource of card.resources">
              {{ resourceNames[resource] }}
            </div>
          </td>
          <td *ngIf="isAdmin()">
            <a [routerLink]="['/editcard', card.id]">
              <span class="glyphicon glyphicon-pencil"></span> Edit
            </a>
          </td>
          <td *ngIf="isAdmin()">
            <a href="" (click)="removeCard(card)">
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
export class CardsComponent implements OnInit {
  cards: any[] = [];
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

  removeCard(card: any) {
    if (!card.removing) {
      card.removing = true;

      this.cardService.removeCard(card.id, card._etag).subscribe({
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
          card.removing = false;
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
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
