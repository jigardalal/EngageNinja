import { test, expect } from '@playwright/test';

test.describe('API Keys Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to API keys page
    await page.goto('/');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');
    await page.waitForNavigation();

    // Navigate to API keys
    await page.goto('/(tenant)/api-keys');
    await page.waitForLoadState('networkidle');
  });

  test('should display API keys page with header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('API Keys');
    await expect(page.locator('text=Manage API keys for integrations')).toBeVisible();
  });

  test('should display plan information card', async ({ page }) => {
    await expect(page.locator('text=Plan Information')).toBeVisible();
    await expect(page.locator('text=API keys')).toBeVisible();
  });

  test('should create an API key with copy-once secret', async ({ page }) => {
    // Fill form
    await page.fill('input[placeholder="e.g., Production API Key"]', 'Test Integration Key');
    await page.fill('input[placeholder="e.g., Used by our webhook service"]', 'For testing');

    // Create key
    await page.click('button:has-text("Generate API Key")');
    await page.waitForSelector('text=API Key Created');

    // Verify secret modal
    await expect(page.locator('text=Save your secret now')).toBeVisible();
    const secretInput = page.locator('code.font-mono');
    const secretValue = await secretInput.textContent();
    expect(secretValue).toBeTruthy();
    expect(secretValue!.length).toBeGreaterThan(30);
  });

  test('should copy secret to clipboard', async ({ page }) => {
    // Create key first
    await page.fill('input[placeholder="e.g., Production API Key"]', 'Copy Test Key');
    await page.click('button:has-text("Generate API Key")');
    await page.waitForSelector('text=API Key Created');

    // Click copy button
    await page.click('button:has-text("Copy")');

    // Verify copy feedback
    await expect(page.locator('button:has-text("✓ Copied")')).toBeVisible();
  });

  test('should close secret modal after viewing', async ({ page }) => {
    // Create key
    await page.fill('input[placeholder="e.g., Production API Key"]', 'Modal Test Key');
    await page.click('button:has-text("Generate API Key")');
    await page.waitForSelector('text=API Key Created');

    // Close modal
    await page.click('button:has-text("Done")');

    // Verify modal is gone
    await expect(page.locator('text=API Key Created')).not.toBeVisible();
  });

  test('should list created API keys', async ({ page }) => {
    // Create a key
    await page.fill('input[placeholder="e.g., Production API Key"]', 'List Test Key');
    await page.click('button:has-text("Generate API Key")');
    await page.waitForSelector('text=API Key Created');
    await page.click('button:has-text("Done")');

    // Verify key appears in list
    await expect(page.locator('text=List Test Key')).toBeVisible();
    await expect(page.locator('text=● Active')).toBeVisible();
  });

  test('should display plan limit guardrails on unsupported tiers', async ({ page }) => {
    // This test assumes a starter tier tenant
    const guardrailText = page.locator('text=API Keys Not Available');
    const isVisible = await guardrailText.isVisible().catch(() => false);

    if (isVisible) {
      await expect(page.locator('text=does not support API keys')).toBeVisible();
      await expect(page.locator('button:has-text("Generate API Key")')).toBeDisabled();
    }
  });

  test('should revoke an API key with confirmation', async ({ page }) => {
    // Create a key first
    await page.fill('input[placeholder="e.g., Production API Key"]', 'Revoke Test Key');
    await page.click('button:has-text("Generate API Key")');
    await page.waitForSelector('text=API Key Created');
    await page.click('button:has-text("Done")');

    // Find and click revoke button
    const revokeButton = page.locator('button:has-text("Revoke")').first();
    await revokeButton.click();

    // Handle confirmation dialog
    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('sure you want to revoke');
      dialog.accept();
    });

    await page.waitForTimeout(500);

    // Verify key is marked as revoked
    await expect(page.locator('text=✓ Revoked')).toBeVisible();
  });

  test('should show "Never" for last used when key has not been used', async ({ page }) => {
    // Create a key
    await page.fill('input[placeholder="e.g., Production API Key"]', 'New Key');
    await page.click('button:has-text("Generate API Key")');
    await page.waitForSelector('text=API Key Created');
    await page.click('button:has-text("Done")');

    // Check last used column
    await expect(page.locator('text=Never')).toBeVisible();
  });

  test('should disable create button when name is empty', async ({ page }) => {
    const createButton = page.locator('button:has-text("Generate API Key")');

    // Initially should be disabled (empty input)
    await expect(createButton).toBeDisabled();

    // Should enable when name is filled
    await page.fill('input[placeholder="e.g., Production API Key"]', 'Test Key');
    await expect(createButton).not.toBeDisabled();

    // Should disable when cleared
    await page.fill('input[placeholder="e.g., Production API Key"]', '');
    await expect(createButton).toBeDisabled();
  });

  test('should display empty state when no API keys exist', async ({ page }) => {
    // On initial load with no keys
    await expect(page.locator('text=No API keys yet')).toBeVisible();
  });

  test('should display key details in list', async ({ page }) => {
    // Create a key with description
    await page.fill('input[placeholder="e.g., Production API Key"]', 'Detailed Key');
    await page.fill('input[placeholder="e.g., Used by our webhook service"]', 'This is a test key');
    await page.click('button:has-text("Generate API Key")');
    await page.waitForSelector('text=API Key Created');
    await page.click('button:has-text("Done")');

    // Verify details are shown
    await expect(page.locator('text=Detailed Key')).toBeVisible();
    await expect(page.locator('text=This is a test key')).toBeVisible();
  });
});
