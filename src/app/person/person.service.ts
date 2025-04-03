import {Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
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

  async loadPeople(): Promise<void> {
    this.loadingPeopleSignal.set(true);

    try {
      const people = await firstValueFrom(this.http.get<Person[]>(this.apiUrl));
      this.peopleSignal.set(people);
    } catch (error) {
      console.error('Error loading people:', error);
      // Initialize with empty array if API call fails
      this.peopleSignal.set([]);
    } finally {
      this.loadingPeopleSignal.set(false);
    }
  }

  async getPerson(id: string | number): Promise<Person> {
    try {
      return await firstValueFrom(this.http.get<Person>(`${this.apiUrl}/${id}`));
    } catch (error) {
      console.error(`Error getting person with id ${id}:`, error);
      throw new Error('Person not found');
    }
  }

  async createPerson(data: Omit<Person, 'id'>): Promise<Person> {
    try {
      const newPerson = await firstValueFrom(this.http.post<Person>(this.apiUrl, data));
      // Update the local state
      const currentPeople = this.peopleSignal();
      this.peopleSignal.set([...currentPeople, newPerson]);
      return newPerson;
    } catch (error) {
      console.error('Error creating person:', error);
      // Preserve the original error status for conflict errors
      if (isHttpError(error, 409)) {
        throw error; // Rethrow the original error with status
      } else {
        throw new Error('Failed to create person');
      }
    }
  }

  async updatePerson(person: Person): Promise<Person> {
    try {
      const updatedPerson = await firstValueFrom(
        this.http.put<Person>(`${this.apiUrl}/${person.id}`, person)
      );

      // Update the local state
      const currentPeople = this.peopleSignal();
      const index = currentPeople.findIndex(p => p.id === person.id);

      if (index !== -1) {
        const updatedPeople = [...currentPeople];
        updatedPeople[index] = updatedPerson;
        this.peopleSignal.set(updatedPeople);
      }

      return updatedPerson;
    } catch (error) {
      console.error(`Error updating person with id ${person.id}:`, error);
      throw new Error('Failed to update person');
    }
  }

  async deletePerson(id: string | number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));

      // Update the local state
      const currentPeople = this.peopleSignal();
      const filteredPeople = currentPeople.filter(p => p.id !== id.toString());
      this.peopleSignal.set(filteredPeople);
    } catch (error) {
      console.error(`Error deleting person with id ${id}:`, error);
      throw new Error('Failed to delete person');
    }
  }
}
