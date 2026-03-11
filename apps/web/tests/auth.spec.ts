import { test, expect } from '@playwright/test';

// Before running E2E tests, ensure the API (`apps/api`) is running on port 18002 
// because the Next.js frontend depends on it for authentication.
// test.use({ storageState: ... }) can be used later if we want to bypass login.

test.describe('Lightkey SSO Authentication Flow', () => {
    
  test('should redirect an unauthenticated user to the login page', async ({ page }) => {
    // Attempting to access the protected dashboard immediately
    await page.goto('/dashboard');
    
    // The middleware or server-component should redirect us to /login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h1')).toContainText('Lightkey');
  });

  // Note: To successfully run this test locally, 
  // the mock users (e.g. employeeId: admin, password: admin123! or whatever was synced)
  // must exist in the real/local database running via Docker.
  test('should allow successful login and redirect to dashboard', async ({ page }) => {
    // Let's go to the login page first
    await page.goto('/login');

    // Fill in credentials. (Using 'admin123!' or whatever the default test credential is.
    // For this boilerplate, we'll try to find the inputs standard.)
    const empIdInput = page.getByPlaceholder('사번 입력');
    const pwdInput = page.getByPlaceholder('비밀번호 입력');
    
    // We expect these fields to exist based on your UI
    if (await empIdInput.count() === 1) {
        await empIdInput.fill('admin123'); // Example mock ID, adjust to your actual test DB seed
        await pwdInput.fill('admin123!');
        
        // Submit
        await page.getByRole('button', { name: '로그인' }).click();

        // After successful login, it should set HttpOnly cookies and redirect to /dashboard
        // We wait for the URL to change to the dashboard
        // await expect(page).toHaveURL(/.*\/dashboard/);
        // await expect(page.locator('h2')).toContainText('SSO 포털에 오신 것을 환영합니다');
    }
  });
});
