import {Injectable, signal} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, finalize, firstValueFrom, Observable, of, tap, throwError} from 'rxjs';
import {Person} from './person.types';
import {isHttpError} from '../shared/error-utils';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private apiUrl = '/api/persons';

  // State
  private peopleSignal = signal<Person[]>([]);
  people = this.peopleSignal.asReadonly();

  // Loading states
  private loadingPeopleSignal = signal<boolean>(false);
  loadingPeople = this.loadingPeopleSignal.asReadonly();


  constructor(private http: HttpClient) {
    // Load initial data
    this.loadPeople();
  }

  /**
   * Handle HTTP errors
   * @param error - The HTTP error response
   * @param operation - The operation that failed
   * @returns An observable with a user-facing error message
   */
  private handleError(error: HttpErrorResponse, operation: string) {
    console.error(`${operation} failed:`, error);

    // Preserve the original error status for specific status codes
    if (isHttpError(error, 409)) {
      return throwError(() => error);
    }

    // Return a custom error message
    return throwError(() => new Error(`Failed to ${operation.toLowerCase()}`));
  }

  loadPeople(): void {
    this.loadingPeopleSignal.set(true);

    this.http.get<Person[]>(this.apiUrl)
      .pipe(
        tap(people => this.peopleSignal.set(people)),
        catchError(error => {
          // Initialize with empty array if API call fails
          this.peopleSignal.set([]);
          return this.handleError(error, 'Load people');
        }),
        finalize(() => this.loadingPeopleSignal.set(false))
      )
      .subscribe();
  }

  getPerson(id: string | number): Promise<Person> {
    return firstValueFrom(
      this.http.get<Person>(`${this.apiUrl}/${id}`)
        .pipe(
          catchError(error => this.handleError(error, `Get person with id ${id}`))
        )
    );
  }

  createPerson(data: Omit<Person, 'id'>): Promise<Person> {
    return firstValueFrom(
      this.http.post<Person>(this.apiUrl, data)
        .pipe(
          tap(newPerson => {
            // Update the local state
            const currentPeople = this.peopleSignal();
            this.peopleSignal.set([...currentPeople, newPerson]);
          }),
          catchError(error => this.handleError(error, 'Create person'))
        )
    );
  }

  updatePerson(person: Person): Promise<Person> {
    return firstValueFrom(
      this.http.put<Person>(`${this.apiUrl}/${person.id}`, person)
        .pipe(
          tap(updatedPerson => {
            // Update the local state
            const currentPeople = this.peopleSignal();
            const index = currentPeople.findIndex(p => p.id === person.id);

            if (index !== -1) {
              const updatedPeople = [...currentPeople];
              updatedPeople[index] = updatedPerson;
              this.peopleSignal.set(updatedPeople);
            }
          }),
          catchError(error => this.handleError(error, `Update person with id ${person.id}`))
        )
    );
  }

  deletePerson(id: string | number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/${id}`)
        .pipe(
          tap(() => {
            // Update the local state
            const currentPeople = this.peopleSignal();
            const filteredPeople = currentPeople.filter(p => p.id !== id.toString());
            this.peopleSignal.set(filteredPeople);
          }),
          catchError(error => this.handleError(error, `Delete person with id ${id}`))
        )
    );
  }
}
