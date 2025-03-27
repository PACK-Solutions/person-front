import { Injectable, signal } from '@angular/core';
import { Person } from './person.types';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  // Mock data with more realistic information
  private mockPeople: Person[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      cityOfBirth: 'New York',
      countryOfBirth: 'USA',
      nationality: 'American'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1985-05-15',
      cityOfBirth: 'London',
      countryOfBirth: 'UK',
      nationality: 'British'
    }
  ];

  // State
  private peopleSignal = signal<Person[]>(this.mockPeople);
  people = this.peopleSignal.asReadonly();

  async getPerson(id: string | number): Promise<Person> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const person = this.mockPeople.find(p => p.id === id.toString());
    if (!person) {
      throw new Error('Person not found');
    }
    return person;
  }

  async createPerson(data: Omit<Person, 'id'>): Promise<Person> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPerson: Person = {
      ...data,
      id: Math.random().toString(36).substring(7)
    };

    this.mockPeople.push(newPerson);
    this.peopleSignal.set([...this.mockPeople]);

    return newPerson;
  }

  async updatePerson(person: Person): Promise<Person> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const index = this.mockPeople.findIndex(p => p.id === person.id);
    if (index === -1) {
      throw new Error('Person not found');
    }

    this.mockPeople[index] = person;
    this.peopleSignal.set([...this.mockPeople]);

    return person;
  }

  async deletePerson(id: string | number): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const index = this.mockPeople.findIndex(p => p.id === id.toString());
    if (index === -1) {
      throw new Error('Person not found');
    }

    this.mockPeople.splice(index, 1);
    this.peopleSignal.set([...this.mockPeople]);
  }
}