import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ResourceService } from '../../services/resource.service';

@Component({
  selector: 'app-add-resource',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
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
          required
        />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <input
          name="description"
          id="description"
          formControlName="description"
          class="form-control"
          required
        />
      </div>
      <button
        type="submit"
        class="btn btn-default"
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
      name: ['', Validators.required],
      description: ['', Validators.required],
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
