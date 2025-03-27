/**
 * Interface for person data
 */
export interface Person {
  /** Unique identifier - can be string or number */
  id: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Date of birth in YYYY-MM-DD format */
  dateOfBirth: string;
  /** City of birth */
  cityOfBirth: string;
  /** Country of birth */
  countryOfBirth: string;
  /** Nationality */
  nationality: string;
  /** Avatar URL */
  avatar?: string;
}
