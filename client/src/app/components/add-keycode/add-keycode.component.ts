import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { KeycodeService } from '../../services/keycode.service';
import { ResourceService, Resource } from '../../services/resource.service';

@Component({
  selector: 'app-save-keycode',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, RouterLink],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li><a routerLink="/keycodes">Keycodes</a></li>
      <li>{{ isEditMode ? 'Edit Keycode' : 'Add Keycode' }}</li>
    </ul>

    <h3>{{ isEditMode ? 'Edit Keycode' : 'Add Keycode' }}</h3>

    <h4 *ngIf="adding">Saving...</h4>

    <form [formGroup]="addForm" (ngSubmit)="save()" *ngIf="!adding">
      <div class="form-group">
        <label for="name">Name</label>
        <input
          #nameInput
          name="name"
          id="name"
          formControlName="name"
          class="form-control"
          placeholder="Event"
          [class.is-invalid]="controlInvalid('name')"
          required
        />
        <div class="invalid-feedback" *ngIf="controlInvalid('name')">
          Name is required.
        </div>
      </div>

      <div class="form-group code-input-wrapper" #codeWrapper>
        <label for="code">Code</label>
        <input
          #codeInput
          type="text"
          inputmode="numeric"
          pattern="\\d*"
          maxlength="4"
          autocomplete="one-time-code"
          placeholder="1234"
          name="code"
          id="code"
          formControlName="code"
          class="form-control"
          [class.is-invalid]="controlInvalid('code')"
          required
          (focus)="showKeypad = true"
          (click)="showKeypad = true"
          (input)="enforceCodeMask($event)"
        />
        <div class="invalid-feedback" *ngIf="controlInvalid('code')">
          Code must be exactly 4 digits.
        </div>

        <div
          *ngIf="showKeypad"
          #keypad
          class="keypad-container shadow"
          role="dialog"
          aria-label="Number keypad"
        >
          <div class="keypad-row">
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('1')"
            >
              1
            </button>
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('2')"
            >
              2
            </button>
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('3')"
            >
              3
            </button>
          </div>
          <div class="keypad-row">
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('4')"
            >
              4
            </button>
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('5')"
            >
              5
            </button>
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('6')"
            >
              6
            </button>
          </div>
          <div class="keypad-row">
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('7')"
            >
              7
            </button>
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('8')"
            >
              8
            </button>
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('9')"
            >
              9
            </button>
          </div>
          <div class="keypad-row">
            <button
              type="button"
              class="btn btn-outline-secondary"
              (click)="onClear()"
            >
              Clear
            </button>
            <button
              type="button"
              class="btn btn-light"
              (click)="onDigitPress('0')"
            >
              0
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary"
              (click)="onBackspace()"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="start_date">Start Date</label>
        <input
          type="date"
          name="start_date"
          id="start_date"
          formControlName="start_date"
          class="form-control"
          [class.is-invalid]="controlInvalid('start_date')"
          (click)="openPicker($event)"
          (focus)="openPicker($event)"
        />
        <div class="invalid-feedback" *ngIf="controlInvalid('start_date')">
          Start date is required.
        </div>
      </div>

      <div class="form-group">
        <label for="end_date">End Date</label>
        <input
          type="date"
          name="end_date"
          id="end_date"
          formControlName="end_date"
          class="form-control"
          [class.is-invalid]="controlInvalid('end_date')"
          (click)="openPicker($event)"
          (focus)="openPicker($event)"
        />
        <div class="invalid-feedback" *ngIf="controlInvalid('end_date')">
          End date is required.
        </div>
      </div>

      <div class="form-group">
        <label for="daily_start_time">Daily Start Time</label>
        <input
          type="time"
          name="daily_start_time"
          id="daily_start_time"
          formControlName="daily_start_time"
          class="form-control"
          [class.is-invalid]="controlInvalid('daily_start_time')"
          (click)="openPicker($event)"
          (focus)="openPicker($event)"
        />
        <div
          class="invalid-feedback"
          *ngIf="controlInvalid('daily_start_time')"
        >
          Daily start time is required.
        </div>
      </div>

      <div class="form-group">
        <label for="daily_end_time">Daily End Time</label>
        <input
          type="time"
          name="daily_end_time"
          id="daily_end_time"
          formControlName="daily_end_time"
          class="form-control"
          [class.is-invalid]="controlInvalid('daily_end_time')"
          (click)="openPicker($event)"
          (focus)="openPicker($event)"
        />
        <div class="invalid-feedback" *ngIf="controlInvalid('daily_end_time')">
          Daily end time is required.
        </div>
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
        <div class="invalid-feedback d-block" *ngIf="showResourceError()">
          Please select at least one resource.
        </div>
      </div>

      <button
        type="submit"
        class="btn btn-outline me-3"
        [disabled]="!canSubmit()"
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
      .form-control::placeholder {
        color: #9aa0a6; /* faint gray */
        opacity: 0.5; /* keep color as-is */
      }
      .code-input-wrapper {
        position: relative;
        display: inline-block;
      }
      .keypad-container {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 0.25rem;
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-radius: 0.5rem;
        padding: 0.5rem;
        z-index: 1055;
      }
      .keypad-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .keypad-row:last-child {
        margin-bottom: 0;
      }
      .keypad-container .btn {
        min-width: 3rem;
      }
    `,
  ],
})
export class AddKeycodeComponent implements OnInit {
  addForm: FormGroup;
  adding = false;
  resources: Resource[] = [];
  selectedResourceIds: Set<number> = new Set<number>();
  showKeypad = false;
  isEditMode = false;
  editingId: number | null = null;
  editingEtag: string | null = null;
  attemptedSubmit = false;

  @ViewChild('keypad') keypadRef?: ElementRef<HTMLDivElement>;
  @ViewChild('codeWrapper') wrapperRef?: ElementRef<HTMLDivElement>;
  @ViewChild('codeInput') codeInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('nameInput') nameInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('startInput') startInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('endInput') endInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('startTimeInput') startTimeInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('endTimeInput') endTimeInputRef?: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private keycodeService: KeycodeService,
    private resourceService: ResourceService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
    const midnight = '00:00';

    this.addForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      start_date: [todayStr, Validators.required],
      end_date: ['', Validators.required],
      daily_start_time: [midnight, Validators.required],
      daily_end_time: [midnight, Validators.required],
    });
  }

  ngOnInit() {
    this.loadResources();
    const idParam = this.route.snapshot.paramMap.get('keycodeId');
    if (idParam) {
      this.isEditMode = true;
      this.editingId = Number(idParam);
      this.loadKeycode(this.editingId);
    }
  }

  loadKeycode(id: number) {
    this.adding = true;
    this.keycodeService.getKeycode(id).subscribe({
      next: (kc) => {
        this.adding = false;
        this.editingEtag = (kc as any)._etag || null;
        // Parse resources into selected set
        const resourceIds = (kc.resource || '')
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r.length > 0)
          .map((r) => Number(r))
          .filter((n) => !Number.isNaN(n));
        this.selectedResourceIds = new Set<number>(resourceIds);

        this.addForm.patchValue({
          name: kc.name || '',
          code: kc.code || '',
          start_date: kc.start_date || '',
          end_date: kc.end_date || '',
          daily_start_time: kc.daily_start_time?.slice(0, 5) || '00:00',
          daily_end_time: kc.daily_end_time?.slice(0, 5) || '00:00',
        });
      },
      error: () => {
        this.adding = false;
        this.snackBar.open('Unable to load keycode.', 'Error', {
          duration: 3000,
        });
        this.router.navigate(['/keycodes']);
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

  onResourceToggle(resourceId: number, checked: boolean) {
    if (checked) {
      this.selectedResourceIds.add(resourceId);
    } else {
      this.selectedResourceIds.delete(resourceId);
    }
  }

  save() {
    this.attemptedSubmit = true;
    // mark all controls as touched to trigger validation UI
    Object.values(this.addForm.controls).forEach((c) => c.markAsTouched());

    if (!this.canSubmit()) {
      // focus first invalid control for better UX
      if (this.addForm.get('name')?.invalid) {
        this.nameInputRef?.nativeElement.focus();
      } else if (this.addForm.get('code')?.invalid) {
        this.codeInputRef?.nativeElement.focus();
      } else if (this.addForm.get('start_date')?.invalid) {
        (document.getElementById('start_date') as HTMLInputElement)?.focus();
      } else if (this.addForm.get('end_date')?.invalid) {
        (document.getElementById('end_date') as HTMLInputElement)?.focus();
      }
      return;
    }
    this.adding = true;

    const payload = {
      ...this.addForm.value,
      // Backend KeyCodes has only a single 'resource' string currently.
      // To align with Cards editing UX, store comma-separated resource ids.
      resource: Array.from(this.selectedResourceIds)
        .sort((a, b) => a - b)
        .join(','),
    } as any;

    const request$ =
      this.isEditMode && this.editingId && this.editingEtag
        ? this.keycodeService.saveKeycode(
            this.editingId,
            this.editingEtag,
            payload
          )
        : this.keycodeService.addKeycode(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode
            ? 'Keycode successfully updated!'
            : 'Keycode successfully added!',
          '',
          {
            duration: 2000,
          }
        );
        this.router.navigate(['/keycodes']);
      },
      error: () => {
        this.adding = false;
        this.snackBar.open('Unable to save keycode at this time.', 'Error', {
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

  enforceCodeMask(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const digitsOnly = (input.value || '').replace(/\D+/g, '').slice(0, 4);
    if (digitsOnly !== input.value) {
      input.value = digitsOnly;
    }
    this.addForm.get('code')?.setValue(digitsOnly, { emitEvent: false });
  }

  controlInvalid(controlName: string): boolean {
    const control = this.addForm.get(controlName);
    if (!control) return false;
    const interacted = control.dirty || control.touched || this.attemptedSubmit;
    return control.invalid && interacted;
  }

  showResourceError(): boolean {
    const interacted =
      this.addForm.dirty || this.addForm.touched || this.attemptedSubmit;
    return this.selectedResourceIds.size === 0 && interacted;
  }

  canSubmit(): boolean {
    const hasResource = this.selectedResourceIds.size > 0;
    return hasResource && !this.addForm.invalid && !this.adding;
  }

  onDigitPress(d: string) {
    const current = (this.addForm.get('code')?.value as string) || '';
    if (current.length >= 4) return;
    const next = (current + d).replace(/\D+/g, '').slice(0, 4);
    this.addForm.get('code')?.setValue(next, { emitEvent: false });
    // Keep focus on input for accessibility
    this.codeInputRef?.nativeElement.focus();
  }

  onBackspace() {
    const current = (this.addForm.get('code')?.value as string) || '';
    const next = current.slice(0, -1);
    this.addForm.get('code')?.setValue(next, { emitEvent: false });
    this.codeInputRef?.nativeElement.focus();
  }

  onClear() {
    this.addForm.get('code')?.setValue('', { emitEvent: false });
    this.codeInputRef?.nativeElement.focus();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(ev: MouseEvent) {
    if (!this.showKeypad) return;
    const target = ev.target as Node;
    const wrapperEl = this.wrapperRef?.nativeElement;
    const keypadEl = this.keypadRef?.nativeElement;
    if (wrapperEl && keypadEl) {
      if (!wrapperEl.contains(target)) {
        this.showKeypad = false;
      }
    } else {
      this.showKeypad = false;
    }
  }
}
