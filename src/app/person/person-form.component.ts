import { Component, computed, inject, input, signal, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PshInputComponent, PshButtonComponent } from '@ps/helix';
import { ToastService } from '@ps/helix';
import { PersonService } from './person.service';
import { Person } from './person.types';
import { format, parse } from 'date-fns';

@Component({
  selector: 'ds-person-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PshInputComponent,
    PshButtonComponent
  ],
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private personService = inject(PersonService);
  private destroyed = signal(false);

  // State
  protected form!: FormGroup;
  protected isSubmitting = false;
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  private personData = signal<Person | null>(null);

  // Computed values
  isEdit = computed(() => !!this.personData());

  // Regex patterns
  private readonly NAME_REGEX = /^[a-zA-ZÀ-ÿ\s-']+$/;

  constructor() {
    this.initForm();
  }

  async ngOnInit() {
    // Check if we're in edit mode by looking for an ID in the route
    const id = this.route.snapshot.params['id'];
    if (id) {
      await this.loadPerson(id);
    }
  }

  private async loadPerson(id: string | number) {
    if (this.destroyed()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const person = await this.personService.getPerson(id);
      if (!this.destroyed()) {
        this.personData.set(person);
        this.updateFormWithPerson(person);
      }
    } catch (error) {
      if (!this.destroyed()) {
        const message = error instanceof Error ? error.message : 'Erreur lors du chargement des données';
        this.error.set(message);
        this.toastService.show({
          message,
          type: 'danger',
          duration: 5000
        });
      }
    } finally {
      if (!this.destroyed()) {
        this.loading.set(false);
      }
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.pattern(this.NAME_REGEX)
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.pattern(this.NAME_REGEX)
      ]],
      dateOfBirth: ['', [
        Validators.required,
        this.dateValidator.bind(this)
      ]],
      cityOfBirth: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(this.NAME_REGEX)
      ]],
      countryOfBirth: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(this.NAME_REGEX)
      ]],
      nationality: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(this.NAME_REGEX)
      ]]
    });
  }

  private updateFormWithPerson(person: Person): void {
    if (this.destroyed()) return;

    this.form.patchValue({
      firstName: person.firstName,
      lastName: person.lastName,
      dateOfBirth: format(new Date(person.dateOfBirth), 'yyyy-MM-dd'),
      cityOfBirth: person.cityOfBirth,
      countryOfBirth: person.countryOfBirth,
      nationality: person.nationality
    });
  }

  private dateValidator(control: { value: string }): { [key: string]: any } | null {
    if (!control.value) return null;

    const date = parse(control.value, 'yyyy-MM-dd', new Date());
    const today = new Date();
    
    if (isNaN(date.getTime())) {
      return { invalidDate: true };
    }
    
    if (date > today) {
      return { futureDate: true };
    }

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (date < minDate) {
      return { tooOld: true };
    }

    return null;
  }

  protected getError(field: string): string | undefined {
    const control = this.form.get(field);
    if (!control?.errors || (!control.touched && !control.dirty)) {
      return undefined;
    }

    const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
    
    if (control.errors['required']) {
      return `${fieldName} est requis`;
    }
    if (control.errors['minlength']) {
      return `${fieldName} doit contenir au moins ${control.errors['minlength'].requiredLength} caractères`;
    }
    if (control.errors['pattern']) {
      return `${fieldName} ne doit contenir que des lettres, espaces, tirets et apostrophes`;
    }
    if (control.errors['invalidDate']) {
      return 'Format de date invalide';
    }
    if (control.errors['futureDate']) {
      return 'La date ne peut pas être dans le futur';
    }
    if (control.errors['tooOld']) {
      return 'La date est trop ancienne';
    }
    return undefined;
  }

  protected isFieldValid(field: string): boolean {
    const control = this.form.get(field);
    return control ? control.valid && control.value : false;
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.valid && !this.isSubmitting && !this.destroyed()) {
      this.isSubmitting = true;

      try {
        const formData = {
          ...this.form.value,
          dateOfBirth: format(new Date(this.form.value.dateOfBirth), 'yyyy-MM-dd')
        };
        
        const currentPerson = this.personData();

        if (currentPerson && !this.destroyed()) {
          // Update existing person
          const updatedPerson = await this.personService.updatePerson({
            ...currentPerson,
            ...formData
          });

          if (!this.destroyed()) {
            this.toastService.show({
              message: 'Personne mise à jour avec succès !',
              type: 'success',
              duration: 3000
            });

            this.router.navigate(['/person', updatedPerson.id]);
          }
        } else if (!this.destroyed()) {
          // Create new person
          const newPerson = await this.personService.createPerson(formData);
          
          if (!this.destroyed()) {
            this.toastService.show({
              message: 'Personne créée avec succès !',
              type: 'success',
              duration: 3000
            });

            this.router.navigate(['/person', newPerson.id]);
          }
        }
      } catch (error) {
        if (!this.destroyed()) {
          console.error('Form submission error:', error);
          
          this.toastService.show({
            message: 'Une erreur est survenue. Veuillez réessayer.',
            type: 'danger',
            duration: 5000
          });
        }
      } finally {
        if (!this.destroyed()) {
          this.isSubmitting = false;
        }
      }
    } else {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
    }
  }

  protected handleCancel(): void {
    if (this.destroyed()) return;
    
    const currentPerson = this.personData();
    if (currentPerson) {
      this.router.navigate(['/person', currentPerson.id]);
    } else {
      this.router.navigate(['/person']);
    }
  }

  protected handleReturnToList(): void {
    if (!this.destroyed()) {
      this.router.navigate(['/person']);
    }
  }

  ngOnDestroy(): void {
    this.destroyed.set(true);
  }
}