import { test, expect } from '@playwright/test';

test('guest checkout redirects to signup', async ({ page }) => {
  // The GDPR consent dialog only shows in some regions (e.g. EU) and can appear at any time.
  // Dismiss it whenever it blocks an action, instead of checking once with an if/else.
  await page.addLocatorHandler(page.getByRole('button', { name: 'Consent' }), async (consentButton) => {
    await consentButton.click();
  });
  await page.goto('https://www.automationexercise.com/', { waitUntil: 'domcontentloaded' });
  await page.locator('header').getByRole('link', { name: 'Products' }).click();
  const searchBar = page.getByPlaceholder('Search Product');
  await expect(searchBar).toBeVisible();
  const addBlueTopButton = page.locator('div.productinfo a[data-product-id="1"]')
  await addBlueTopButton.click()
  const modalHeading = page.getByRole("heading", { name: "Added!"});
  await expect(modalHeading).toBeVisible();
  await page.getByRole('button', { name: 'Continue Shopping' }).click();
  await page.locator('header').getByRole('link', { name: 'Cart' }).click();
  await page.getByText('Proceed To Checkout').click();
  await page.getByRole('link', { name: 'Register / Login' }).click();
  const signupHeading = page.getByRole('heading', { name: 'New User Signup!'});
  await expect(signupHeading).toBeVisible();
});
