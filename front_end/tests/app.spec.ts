import { test, expect, Page } from '@playwright/test';

// Helper to capture and log all console messages
function setupConsoleLogging(page: Page) {
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log(`❌ [BROWSER ERROR] ${text}`);
    } else if (type === 'warning') {
      console.log(`⚠️  [BROWSER WARN] ${text}`);
    } else {
      console.log(`📝 [BROWSER ${type.toUpperCase()}] ${text}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`💥 [PAGE ERROR] ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  });

  page.on('requestfailed', request => {
    console.log(`🔴 [REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
  });
}

test.describe('CloudX App - Full Debug Test', () => {
  
  test('Check if app loads without errors', async ({ page }) => {
    setupConsoleLogging(page);
    
    console.log('\n========================================');
    console.log('🚀 Starting App Load Test');
    console.log('========================================\n');
    
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded');
    
    // Check for white screen (no content)
    const bodyContent = await page.locator('body').innerText();
    if (bodyContent.trim().length === 0) {
      console.log('❌ WHITE SCREEN DETECTED - Body is empty!');
    } else {
      console.log(`✅ Page has content (${bodyContent.length} chars)`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/01-initial-load.png' });
    console.log('📸 Screenshot saved: 01-initial-load.png');
    
    // Check if login form is visible
    const loginForm = page.locator('input[type="email"], input[placeholder*="email" i]');
    if (await loginForm.count() > 0) {
      console.log('✅ Login form detected');
    } else {
      console.log('⚠️  No login form found on initial load');
    }
  });

  test('Test Login Flow', async ({ page }) => {
    setupConsoleLogging(page);
    
    console.log('\n========================================');
    console.log('🔐 Starting Login Test');
    console.log('========================================\n');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and fill email
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('student@college.edu');
      console.log('✅ Email filled');
    } else {
      console.log('❌ Email input not found!');
      await page.screenshot({ path: 'tests/screenshots/error-no-email-input.png' });
      return;
    }
    
    // Find and fill password
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill('password123');
      console.log('✅ Password filled');
    } else {
      console.log('❌ Password input not found!');
      await page.screenshot({ path: 'tests/screenshots/error-no-password-input.png' });
      return;
    }
    
    // Take screenshot before login
    await page.screenshot({ path: 'tests/screenshots/02-before-login.png' });
    
    // Click login button
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    if (await loginButton.count() > 0) {
      await loginButton.click();
      console.log('✅ Login button clicked');
    } else {
      console.log('❌ Login button not found!');
      return;
    }
    
    // Wait for navigation or response
    console.log('⏳ Waiting for login response...');
    await page.waitForTimeout(3000);
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'tests/screenshots/03-after-login.png' });
    console.log('📸 Screenshot saved: 03-after-login.png');
    
    // Check current page content
    const pageContent = await page.content();
    const bodyText = await page.locator('body').innerText();
    
    console.log(`\n📄 Page content length: ${pageContent.length}`);
    console.log(`📄 Body text length: ${bodyText.length}`);
    
    // Check for error messages (safely)
    const errorElement = page.locator('[class*="error"], [class*="Error"], .text-red-500, .text-red-600');
    const errorCount = await errorElement.count();
    if (errorCount > 0) {
      try {
        const firstError = errorElement.first();
        if (await firstError.isVisible()) {
          const errorText = await firstError.innerText().catch(() => 'Unknown error');
          console.log(`❌ Error message found: ${errorText}`);
        }
      } catch {
        // Element may not be a proper text element - ignore
      }
    }
    
    // Check if dashboard loaded
    const dashboardIndicators = [
      page.locator('text=Dashboard'),
      page.locator('text=Welcome'),
      page.locator('[class*="sidebar"]'),
      page.locator('nav'),
    ];
    
    let dashboardFound = false;
    for (const indicator of dashboardIndicators) {
      if (await indicator.count() > 0) {
        dashboardFound = true;
        console.log('✅ Dashboard indicator found');
        break;
      }
    }
    
    if (!dashboardFound) {
      console.log('⚠️  No dashboard indicators found after login');
    }
    
    // Check for white screen
    if (bodyText.trim().length < 50) {
      console.log('❌ POSSIBLE WHITE SCREEN - Very little content on page!');
      console.log(`   Body text: "${bodyText.substring(0, 100)}..."`);
    }
  });

  test('Test Dashboard After Login', async ({ page }) => {
    setupConsoleLogging(page);
    
    console.log('\n========================================');
    console.log('📊 Testing Dashboard');
    console.log('========================================\n');
    
    // Login first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="email"], input[placeholder*="email" i]').first().fill('student@college.edu');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Check for Something went wrong error
    const errorBoundary = page.locator('text=Something went wrong');
    if (await errorBoundary.count() > 0) {
      console.log('❌ ERROR BOUNDARY TRIGGERED!');
      
      // Try to get error details
      const errorDetails = page.locator('text=Error Details').first();
      if (await errorDetails.count() > 0) {
        await errorDetails.click();
        await page.waitForTimeout(500);
      }
      
      const errorMessage = await page.locator('.bg-red-100, [class*="error"]').first().innerText().catch(() => 'Could not get error text');
      console.log(`   Error: ${errorMessage}`);
      
      await page.screenshot({ path: 'tests/screenshots/error-boundary.png', fullPage: true });
      console.log('📸 Error screenshot saved');
    }
    
    // Screenshot final state
    await page.screenshot({ path: 'tests/screenshots/04-dashboard.png', fullPage: true });
    console.log('📸 Dashboard screenshot saved');
    
    // List all visible text on page (for debugging)
    const allText = await page.locator('body').innerText();
    console.log('\n--- PAGE CONTENT ---');
    console.log(allText.substring(0, 1000));
    console.log('--- END PAGE CONTENT ---\n');
  });

  test('Check All Page Components', async ({ page }) => {
    setupConsoleLogging(page);
    
    console.log('\n========================================');
    console.log('🔍 Checking All Components');
    console.log('========================================\n');
    
    // Login first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="email"], input[placeholder*="email" i]').first().fill('teacher@college.edu');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    
    await page.waitForTimeout(3000);
    
    // Test each navigation item
    const navItems = ['Attendance', 'Agenda', 'Learning', 'Videos', 'Assignments', 'Announcements', 'Members'];
    
    for (const item of navItems) {
      console.log(`\n--- Testing: ${item} ---`);
      
      const navButton = page.locator(`button:has-text("${item}"), a:has-text("${item}")`).first();
      if (await navButton.count() > 0) {
        await navButton.click();
        await page.waitForTimeout(1500);
        
        // Check for errors
        const errorBoundary = page.locator('text=Something went wrong');
        if (await errorBoundary.count() > 0) {
          console.log(`❌ ERROR on ${item} page!`);
          await page.screenshot({ path: `tests/screenshots/error-${item.toLowerCase()}.png` });
        } else {
          console.log(`✅ ${item} page loaded`);
        }
      } else {
        console.log(`⚠️  Nav item "${item}" not found`);
      }
    }
    
    console.log('\n✅ Component check complete');
  });
});
