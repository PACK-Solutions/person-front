import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  PshButtonComponent,
  PshAvatarComponent,
  PshTagComponent,
  PshSpinLoaderComponent,
  ToastService
} from '@ps/helix';
import { PersonService } from './person.service';
import { Person } from './person.types';

@Component({
  selector: 'ds-person-detail',
  standalone: true,
  imports: [
    CommonModule,
    PshButtonComponent,
    PshAvatarComponent,
    PshTagComponent,
    PshSpinLoaderComponent
  ],
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.css']
})
export class PersonDetailComponent implements OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private personService = inject(PersonService);
  private toastService = inject(ToastService);
  private destroyed = signal(false);

  protected person = signal<Person | null>(null);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  protected avatarSrc = computed(() => {
    const p = this.person();
    return p ? this.getAvatarSrc(p.avatar) : '';
  });

  constructor() {
    // Get person ID from route and load data
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadPerson(id);
    }
  }

  private async loadPerson(id: string | number): Promise<void> {
    if (this.destroyed()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const person = await this.personService.getPerson(id);
      if (!this.destroyed()) {
        this.person.set(person);
      }
    } catch (error) {
      if (!this.destroyed()) {
        const message = error instanceof Error ? error.message : 'Error loading person details';
        this.error.set(message);
        this.toastService.show({
          message,
          type: 'danger',
          duration: 5000
        });
        await this.router.navigate(['/person']);
      }
    } finally {
      if (!this.destroyed()) {
        this.loading.set(false);
      }
    }
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  protected async handleDelete(id: string | number): Promise<void> {
    if (this.destroyed()) return;

    if (confirm('Are you sure you want to delete this person?')) {
      try {
        await this.personService.deletePerson(id);
        if (!this.destroyed()) {
          // Reload the people list to ensure it's up-to-date
          await this.personService.loadPeople();

          this.toastService.show({
            message: 'Person deleted successfully',
            type: 'success',
            duration: 3000
          });
          await this.router.navigate(['/person']);
        }
      } catch (error) {
        if (!this.destroyed()) {
          const message = error instanceof Error ? error.message : 'Error deleting person';
          this.toastService.show({
            message,
            type: 'danger',
            duration: 5000
          });
        }
      }
    }
  }

  protected handleEdit(id: string | number): void {
    if (!this.destroyed()) {
      this.router.navigate(['/person', id, 'edit']);
    }
  }

  protected handleClose(): void {
    if (!this.destroyed()) {
      this.router.navigate(['/person']);
    }
  }

  protected getAvatarSrc(avatar?: string): string {
    console.log(avatar);

    if (!avatar) return '';

    // Check if the avatar already has a data URL prefix
    if (avatar.startsWith('data:')) {
      return avatar;
    }

    // Add the base64 PNG prefix
    return `data:image/png;base64,${avatar}`;
  }

  ngOnDestroy(): void {
    this.destroyed.set(true);
  }
}
