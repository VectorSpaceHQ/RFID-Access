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
import { CardService } from '../../services/card.service';
import { ResourceService } from '../../services/resource.service';

@Component({
  selector: 'app-edit-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li><a routerLink="/cards">Cards</a></li>
      <li>Edit Card</li>
    </ul>

    <h3>Edit Card</h3>

    <h4 *ngIf="loading">Loading...</h4>
    <h4 *ngIf="saving">Saving...</h4>

    <form
      [formGroup]="editForm"
      (ngSubmit)="saveCard()"
      *ngIf="!loading && !saving"
    >
      <div class="form-group">
        <label for="member">Member</label>
        <input
          name="member"
          id="member"
          formControlName="member"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="resources">Resources</label>
        <select
          name="resources"
          id="resources"
          formControlName="resources"
          class="form-control"
          multiple
        >
          <option *ngFor="let resource of resources" [value]="resource._id">
            {{ resource.name }}
          </option>
        </select>
      </div>
      <button
        type="submit"
        class="btn btn-default"
        [disabled]="editForm.invalid || saving"
      >
        Save
      </button>
      <a routerLink="/cards">Cancel</a>
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
export class EditCardComponent implements OnInit {
  editForm: FormGroup;
  loading = false;
  saving = false;
  cardId = '';
  resources: any[] = [];

  constructor(
    private fb: FormBuilder,
    private cardService: CardService,
    private resourceService: ResourceService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      member: ['', Validators.required],
      resources: [[]],
    });
  }

  ngOnInit() {
    this.cardId = this.route.snapshot.paramMap.get('cardId') || '';
    this.loadCard();
    this.loadResources();
  }

  loadCard() {
    this.loading = true;
    this.cardService.getCard(this.cardId).subscribe({
      next: (card) => {
        this.loading = false;
        this.editForm.patchValue({
          member: card.member,
          resources: card.resources || [],
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Unable to load card.', 'Error', { duration: 3000 });
        this.router.navigate(['/cards']);
      },
    });
  }

  loadResources() {
    this.resourceService.getResources(1).subscribe({
      next: (response) => {
        this.resources = response._items;
      },
    });
  }

  saveCard() {
    if (this.editForm.valid) {
      this.saving = true;
      const updates = this.editForm.value;

      this.cardService.saveCard(this.cardId, '', updates).subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('Card successfully updated!', '', {
            duration: 2000,
          });
          this.router.navigate(['/cards']);
        },
        error: (error) => {
          this.saving = false;
          let message = 'Unable to update card at this time.';

          if (error.status === 404) {
            message = 'Card not found.';
          }

          this.snackBar.open(message, 'Error Updating Card', {
            duration: 3000,
          });
        },
      });
    }
  }
}
