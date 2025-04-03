import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('test create a valid person', async ({ page }) => {
  // Generate random first and last names using faker-js
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  await page.goto('/person');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Nom de famille' }).click();
  await page.getByRole('textbox', { name: 'Nom de famille' }).fill(lastName);
  await page.getByRole('textbox', { name: 'Date de naissance' }).fill('1980-10-10');
  await page.getByRole('textbox', { name: 'Ville de naissance' }).click();
  await page.getByRole('textbox', { name: 'Ville de naissance' }).fill('Paris');
  await page.getByRole('textbox', { name: 'Ex: France' }).click();
  await page.getByRole('textbox', { name: 'Ex: France' }).fill('France');
  await page.getByRole('textbox', { name: 'Nationalité' }).click();
  await page.getByRole('textbox', { name: 'Nationalité' }).fill('Française');
  await page.getByRole('button', { name: 'Créer' }).click();
  await expect(page.getByText('succès')).toBeVisible({ timeout: 30_000 });
});

test('test create an invalid person', async ({ page }) => {
  await page.goto('/person');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).fill('Jean');
  await page.getByRole('textbox', { name: 'Nom de famille' }).fill('Dupont');
  await expect(page.getByRole('button', { disabled: true })).toBeDisabled();
});

test('test create a duplicate person', async ({ page }) => {
  // Generate random names with faker-js but use the same values for both attempts
  // to ensure we can create a duplicate
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  // First, create the initial person
  await page.goto('/person');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Nom de famille' }).click();
  await page.getByRole('textbox', { name: 'Nom de famille' }).fill(lastName);
  await page.getByRole('textbox', { name: 'Date de naissance' }).fill('1980-10-10');
  await page.getByRole('textbox', { name: 'Ville de naissance' }).click();
  await page.getByRole('textbox', { name: 'Ville de naissance' }).fill('Paris');
  await page.getByRole('textbox', { name: 'Ex: France' }).click();
  await page.getByRole('textbox', { name: 'Ex: France' }).fill('France');
  await page.getByRole('textbox', { name: 'Nationalité' }).click();
  await page.getByRole('textbox', { name: 'Nationalité' }).fill('Française');
  await page.getByRole('button', { name: 'Créer' }).click();
  await expect(page.getByText('succès')).toBeVisible({ timeout: 30_000 });

  // Now try to create a duplicate person with the same name
  await page.goto('/person');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Nom de famille' }).click();
  await page.getByRole('textbox', { name: 'Nom de famille' }).fill(lastName);
  await page.getByRole('textbox', { name: 'Date de naissance' }).fill('1980-10-10');
  await page.getByRole('textbox', { name: 'Ville de naissance' }).click();
  await page.getByRole('textbox', { name: 'Ville de naissance' }).fill('Paris');
  await page.getByRole('textbox', { name: 'Ex: France' }).click();
  await page.getByRole('textbox', { name: 'Ex: France' }).fill('France');
  await page.getByRole('textbox', { name: 'Nationalité' }).click();
  await page.getByRole('textbox', { name: 'Nationalité' }).fill('Française');
  await page.getByRole('button', { name: 'Créer' }).click();

  // Verify the duplicate error message is displayed
  await expect(page.getByText('Une personne avec ce nom et prénom existe déjà.')).toBeVisible({ timeout: 30_000 });
});
