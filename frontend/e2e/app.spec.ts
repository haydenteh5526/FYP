import { test, expect } from '@playwright/test';

// These tests run against the real frontend dev server (which proxies /api to
// the backend). Tests 1–2 are pure UI; tests 3–4 exercise the real backend
// (register + login) so they require the API to be running.

test.describe('DocVault auth flow', () => {
  test('login page renders the email step', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with Email/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('advances from email to the password step', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('name@example.com').fill('someone@example.com');
    await page.getByRole('button', { name: /Continue with Email/i }).click();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('registration shows the "check your email" screen', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder('name@example.com').fill(`e2e-${Date.now()}@example.com`);
    await page.getByRole('button', { name: /Continue with Email/i }).click();
    await page.getByPlaceholder('Full name').fill('E2E Tester');
    await page.getByPlaceholder('Password').fill('TestPass123!');
    await page.getByRole('button', { name: 'Create account' }).click();
    // The current flow requires email verification before sign-in.
    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible({ timeout: 10000 });
  });

  test('invalid login surfaces an error', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('name@example.com').fill(`nobody-${Date.now()}@example.com`);
    await page.getByRole('button', { name: /Continue with Email/i }).click();
    await page.getByPlaceholder('Password').fill('wrongpassword123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 10000 });
  });
});
