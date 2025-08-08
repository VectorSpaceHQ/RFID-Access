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
import { CardService } from '../../services/card.service';
import { ResourceService } from '../../services/resource.service';

@Component({
  selector: 'app-edit-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, RouterLink],
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
        <label>Resources</label>
        <div class="form-check" *ngFor="let resource of resources">
          <input
            class="form-check-input"
            type="checkbox"
            [id]="'res-' + resource.id"
            [checked]="selectedResourceIds.has(resource.id)"
            (change)="onResourceToggle(resource.id, $event.target.checked)"
          />
          <label class="form-check-label" [for]="'res-' + resource.id">
            {{ resource.name }}
          </label>
        </div>
      </div>
      <button
        type="submit"
        class="btn btn-outline me-3"
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
  cardEtag = '';
  resources: any[] = [];
  selectedResourceIds: Set<number> = new Set<number>();

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
    this.cardService.getCard(Number(this.cardId)).subscribe({
      next: (card) => {
        this.loading = false;
        this.cardEtag = (card as any)._etag || '';
        const resourceIds = (card.resources || '')
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r.length > 0)
          .map((r) => Number(r))
          .filter((n) => !Number.isNaN(n));
        this.selectedResourceIds = new Set<number>(resourceIds);
        this.editForm.patchValue({
          member: card.member,
          resources: resourceIds,
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
      const selectedIds = Array.from(this.selectedResourceIds).sort(
        (a, b) => a - b
      );
      const updatesToSend = {
        member: updates.member,
        resources: selectedIds.join(','),
      } as any;

      this.cardService
        .saveCard(Number(this.cardId), this.cardEtag, updatesToSend)
        .subscribe({
          next: (updated) => {
            this.cardEtag = (updated as any)?._etag || this.cardEtag;
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

  onResourceToggle(resourceId: number, checked: boolean) {
    if (checked) {
      this.selectedResourceIds.add(resourceId);
    } else {
      this.selectedResourceIds.delete(resourceId);
    }
  }
}
