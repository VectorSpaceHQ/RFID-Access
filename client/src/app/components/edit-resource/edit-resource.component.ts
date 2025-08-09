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
import { ResourceService } from '../../services/resource.service';

@Component({
  selector: 'app-edit-resource',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, RouterLink],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li><a routerLink="/resources">Resources</a></li>
      <li>Edit Resource</li>
    </ul>

    <h3>Edit Resource</h3>

    <h4 *ngIf="loading">Loading...</h4>
    <h4 *ngIf="saving">Saving...</h4>

    <form
      [formGroup]="editForm"
      (ngSubmit)="saveResource()"
      *ngIf="!loading && !saving"
    >
      <div class="form-group">
        <label for="name">Name</label>
        <input
          name="name"
          id="name"
          formControlName="name"
          class="form-control"
          [class.is-invalid]="
            editForm.get('name')?.touched && editForm.get('name')?.invalid
          "
          required
        />
        <div
          class="invalid-feedback"
          *ngIf="
            editForm.get('name')?.touched &&
            editForm.get('name')?.hasError('required')
          "
        >
          Name is required.
        </div>
        <div
          class="invalid-feedback"
          *ngIf="
            editForm.get('name')?.touched &&
            editForm.get('name')?.hasError('pattern')
          "
        >
          Only letters, numbers, underscores, and spaces are allowed.
        </div>
      </div>

      <div class="form-group">
        <label>Type</label>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            id="type-reader"
            value="Reader"
            formControlName="type"
          />
          <label class="form-check-label" for="type-reader">Reader</label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            id="type-keypad"
            value="Keypad"
            formControlName="type"
          />
          <label class="form-check-label" for="type-keypad">Keypad</label>
        </div>
      </div>
      <button
        type="submit"
        class="btn btn-outline me-3"
        [disabled]="editForm.invalid || saving"
      >
        Save
      </button>
      <a routerLink="/resources">Cancel</a>
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
export class EditResourceComponent implements OnInit {
  editForm: FormGroup;
  loading = false;
  saving = false;
  resourceId = '';
  resourceEtag = '';

  constructor(
    private fb: FormBuilder,
    private resourceService: ResourceService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[\w ]+$/)]],
      type: ['Reader', Validators.required],
    });
  }

  ngOnInit() {
    this.resourceId = this.route.snapshot.paramMap.get('resourceId') || '';
    this.loadResource();
  }

  loadResource() {
    this.loading = true;
    this.resourceService.getResource(this.resourceId).subscribe({
      next: (resource) => {
        this.loading = false;
        this.resourceEtag = (resource as any)._etag || '';
        this.editForm.patchValue({
          name: resource.name,
          type: (resource as any).type || 'Reader',
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Unable to load resource.', 'Error', {
          duration: 3000,
        });
        this.router.navigate(['/resources']);
      },
    });
  }

  saveResource() {
    if (this.editForm.valid) {
      this.saving = true;
      const updates = this.editForm.value;

      this.resourceService
        .saveResource(this.resourceId, this.resourceEtag, updates)
        .subscribe({
          next: (updated) => {
            this.resourceEtag = (updated as any)?._etag || this.resourceEtag;
            this.saving = false;
            this.snackBar.open('Resource successfully updated!', '', {
              duration: 2000,
            });
            this.router.navigate(['/resources']);
          },
          error: (error) => {
            this.saving = false;
            let message = 'Unable to update resource at this time.';

            if (error.status === 404) {
              message = 'Resource not found.';
            } else if (error.status === 409) {
              message = 'Resource name already exists.';
            }

            this.snackBar.open(message, 'Error Updating Resource', {
              duration: 3000,
            });
          },
        });
    }
  }
}
