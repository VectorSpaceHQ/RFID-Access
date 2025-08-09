import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ResourceService } from '../../services/resource.service';

@Component({
  selector: 'app-add-resource',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, RouterLink],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li><a routerLink="/resources">Resources</a></li>
      <li>Add Resource</li>
    </ul>

    <h3>Add Resource</h3>

    <h4 *ngIf="adding">Adding...</h4>

    <form [formGroup]="addForm" (ngSubmit)="addResource()" *ngIf="!adding">
      <div class="form-group">
        <label for="name">Name</label>
        <input
          name="name"
          id="name"
          formControlName="name"
          class="form-control"
          [class.is-invalid]="
            addForm.get('name')?.touched && addForm.get('name')?.invalid
          "
          required
        />
        <div
          class="invalid-feedback"
          *ngIf="
            addForm.get('name')?.touched &&
            addForm.get('name')?.hasError('required')
          "
        >
          Name is required.
        </div>
        <div
          class="invalid-feedback"
          *ngIf="
            addForm.get('name')?.touched &&
            addForm.get('name')?.hasError('pattern')
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
        [disabled]="addForm.invalid || adding"
      >
        Add
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
export class AddResourceComponent {
  addForm: FormGroup;
  adding = false;

  constructor(
    private fb: FormBuilder,
    private resourceService: ResourceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[\w ]+$/)]],
      type: ['Reader', Validators.required],
    });
  }

  addResource() {
    if (this.addForm.valid) {
      this.adding = true;
      const resource = this.addForm.value;

      this.resourceService.addResource(resource).subscribe({
        next: () => {
          this.snackBar.open('Resource successfully added!', '', {
            duration: 2000,
          });
          this.router.navigate(['/resources']);
        },
        error: (error) => {
          this.adding = false;
          let message = 'Unable to add resource at this time.';

          if (error.status === 409) {
            message = 'Resource name already exists.';
          }

          this.snackBar.open(message, 'Error Adding Resource', {
            duration: 3000,
          });
        },
      });
    }
  }
}
