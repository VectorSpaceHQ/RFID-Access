import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { KeycodeService } from '../../services/keycode.service';
import { ResourceService, Resource } from '../../services/resource.service';

@Component({
  selector: 'app-add-keycode',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, RouterLink],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li><a routerLink="/keycodes">Keycodes</a></li>
      <li>Add Keycode</li>
    </ul>

    <h3>Add Keycode</h3>

    <h4 *ngIf="adding">Saving...</h4>

    <form [formGroup]="addForm" (ngSubmit)="save()" *ngIf="!adding">
      <div class="form-group">
        <label for="name">Name</label>
        <input
          name="name"
          id="name"
          formControlName="name"
          class="form-control"
          required
        />
      </div>

      <div class="form-group">
        <label for="code">Code</label>
        <input
          name="code"
          id="code"
          formControlName="code"
          class="form-control"
          required
        />
      </div>

      <div class="form-group">
        <label for="start_date">Start Date</label>
        <input
          type="date"
          name="start_date"
          id="start_date"
          formControlName="start_date"
          class="form-control"
          (click)="openPicker($event)"
          (focus)="openPicker($event)"
        />
      </div>

      <div class="form-group">
        <label for="end_date">End Date</label>
        <input
          type="date"
          name="end_date"
          id="end_date"
          formControlName="end_date"
          class="form-control"
          (click)="openPicker($event)"
          (focus)="openPicker($event)"
        />
      </div>

      <div class="form-group">
        <label for="daily_start_time">Daily Start Time</label>
        <input
          type="time"
          name="daily_start_time"
          id="daily_start_time"
          formControlName="daily_start_time"
          class="form-control"
          (click)="openPicker($event)"
          (focus)="openPicker($event)"
        />
      </div>

      <div class="form-group">
        <label for="daily_end_time">Daily End Time</label>
        <input
          type="time"
          name="daily_end_time"
          id="daily_end_time"
          formControlName="daily_end_time"
          class="form-control"
          (click)="openPicker($event)"
          (focus)="openPicker($event)"
        />
      </div>

      <div class="form-group">
        <label>Authorized Resources</label>
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
        [disabled]="addForm.invalid || adding"
      >
        Save
      </button>
      <a routerLink="/keycodes">Cancel</a>
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
export class AddKeycodeComponent implements OnInit {
  addForm: FormGroup;
  adding = false;
  resources: Resource[] = [];
  selectedResourceIds: Set<number> = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private keycodeService: KeycodeService,
    private resourceService: ResourceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      daily_start_time: [''],
      daily_end_time: [''],
    });
  }

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.resourceService.getResources(1).subscribe({
      next: (response) => {
        this.resources = response._items;
      },
    });
  }

  onResourceToggle(resourceId: number, checked: boolean) {
    if (checked) {
      this.selectedResourceIds.add(resourceId);
    } else {
      this.selectedResourceIds.delete(resourceId);
    }
  }

  save() {
    if (this.addForm.invalid) return;
    this.adding = true;

    const payload = {
      ...this.addForm.value,
      // Backend KeyCodes has only a single 'resource' string currently.
      // To align with Cards editing UX, store comma-separated resource ids.
      resource: Array.from(this.selectedResourceIds)
        .sort((a, b) => a - b)
        .join(','),
    } as any;

    this.keycodeService.addKeycode(payload).subscribe({
      next: () => {
        this.snackBar.open('Keycode successfully added!', '', {
          duration: 2000,
        });
        this.router.navigate(['/keycodes']);
      },
      error: () => {
        this.adding = false;
        this.snackBar.open('Unable to add keycode at this time.', 'Error', {
          duration: 3000,
        });
      },
    });
  }

  openPicker(event: Event) {
    const input = event.target as HTMLInputElement;
    const anyInput = input as any;
    if (anyInput && typeof anyInput.showPicker === 'function') {
      anyInput.showPicker();
    }
  }
}
