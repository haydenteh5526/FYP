import { test, expect } from '@playwright/test';

test.describe('DocVault E2E', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('DocVault')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  });

  test('can register and see dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Sign up').click();
    await page.getByPlaceholder('Email').fill(`e2e-${Date.now()}@test.com`);
    await page.getByPlaceholder('Password').fill('testpass123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Documents')).toBeVisible({ timeout: 5000 });
  });

  test('shows empty state on dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Sign up').click();
    await page.getByPlaceholder('Email').fill(`e2e-empty-${Date.now()}@test.com`);
    await page.getByPlaceholder('Password').fill('testpass123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('No documents yet')).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to upload page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Sign up').click();
    await page.getByPlaceholder('Email').fill(`e2e-nav-${Date.now()}@test.com`);
    await page.getByPlaceholder('Password').fill('testpass123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.getByText('Upload').click();
    await expect(page.getByText('Upload Document')).toBeVisible();
  });
});
