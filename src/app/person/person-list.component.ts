import { Component, ViewChild, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PshTableComponent, PshButtonComponent, PshSpinLoaderComponent } from '@ps/helix';
import { TableColumn, TableRowClickEvent } from '@ps/helix';
import { PersonService } from './person.service';

@Component({
  selector: 'ds-person-list',
  standalone: true,
  imports: [
    CommonModule,
    PshTableComponent,
    PshButtonComponent,
    PshSpinLoaderComponent
  ],
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.css']
})
export class PersonListComponent {
  private router = inject(Router);
  protected personService = inject(PersonService);

  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
  @ViewChild('dateTemplate', { static: true }) dateTemplate!: TemplateRef<any>;

  // Initialize columns without templates first
  protected columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      width: '10%',
      sortable: true
    },
    {
      key: 'firstName',
      label: 'Prénom',
      width: '25%',
      sortable: true
    },
    {
      key: 'lastName',
      label: 'Nom',
      width: '25%',
      sortable: true
    },
    {
      key: 'dateOfBirth',
      label: 'Date de naissance',
      width: '40%',
      sortable: true,
      sortFn: (a, b) => {
        const dateA = new Date(a.dateOfBirth);
        const dateB = new Date(b.dateOfBirth);
        return dateA.getTime() - dateB.getTime();
      }
    }
  ];

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  protected handleCreate(): void {
    this.router.navigate(['/person/create']);
  }

  protected handleView(id: string | number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/person', id]);
  }

  protected handleEdit(id: string | number, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['person', id, 'edit']);
  }

  protected handleRowClick(event: TableRowClickEvent): void {
    this.handleView(event.id);
  }
}
