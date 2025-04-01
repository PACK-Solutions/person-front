import { test, expect } from '@playwright/test';

test('test create a valid person', async ({ page }) => {
  await page.goto('/person');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).click();
  await page.getByRole('textbox', { name: 'Prénom' }).fill('Jean');
  await page.getByRole('textbox', { name: 'Nom de famille' }).click();
  await page.getByRole('textbox', { name: 'Nom de famille' }).fill('Dupont');
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