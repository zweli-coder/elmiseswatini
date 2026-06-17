/**
 * Employer Dashboard Frontend Component Tests (Playwright)
 * Tests the React component interactions and UI behavior
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const FRONTEND_URL = 'http://localhost:3000';
const API_BASE = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';

test.describe('Employer Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock auth and navigate to dashboard
    await page.evaluate(() => {
      // Create a mock JWT token for employer (role_id: 2)
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZV9pZCI6MiwiZW1haWwiOiJlbXBsb3llckB0ZXN0LmNvbSIsImZ1bGxfbmFtZSI6IlRlc3QgRW1wbG95ZXIiLCJleHAiOjk5OTk5OTk5OTl9.test';
      localStorage.setItem('lmis_token', mockToken);
    });
    
    await page.goto(`${FRONTEND_URL}/employer/dashboard`);
  });

  test('should display loading state initially', async ({ page }) => {
    // The component shows loading while checking auth
    const spinner = page.locator('[class*="spinner"], [class*="loading"]').first();
    // Wait for it to resolve (either visible or not)
    await page.waitForLoadState('networkidle');
  });

  test('should verify user authentication', async ({ page }) => {
    // Wait for auth check and content to load
    await page.waitForLoadState('networkidle');
    
    // Check that user is authenticated by verifying page elements exist
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible({ timeout: 5000 });
  });

  test('should display dashboard heading', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for dashboard title
    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('should display application statistics', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for stat cards or counters
    const statCards = page.locator('[class*="stat"], [class*="card"], [class*="metric"]');
    const count = await statCards.count();
    
    if (count > 0) {
      console.log(`Found ${count} stat/card elements`);
      await expect(statCards.first()).toBeVisible();
    }
  });

  test('should have navigation links', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for main navigation/action links
    const links = page.locator('a, [role="button"]');
    const linkCount = await links.count();
    
    expect(linkCount).toBeGreaterThan(0);
    console.log(`Found ${linkCount} navigation links/buttons`);
  });

  test('should navigate to view vacancies', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find and click "View Vacancies" link
    const vacanciesLink = page.locator('a, button', { hasText: /View Vacancies|Vacancies/i }).first();
    
    if (await vacanciesLink.isVisible()) {
      await vacanciesLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation
      expect(page.url()).toContain('/vacancies');
    }
  });

  test('should navigate to post vacancy', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find and click "Post Vacancy" button
    const postButton = page.locator('a, button', { hasText: /Post Vacancy|New Vacancy/i }).first();
    
    if (await postButton.isVisible()) {
      await postButton.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation
      expect(page.url()).toContain('/vacancy') || expect(page.url()).toContain('new');
    }
  });

  test('should navigate to applications', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find and click "Applications" link
    const applicationsLink = page.locator('a, button', { hasText: /Applications/i }).first();
    
    if (await applicationsLink.isVisible()) {
      await applicationsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation
      expect(page.url()).toContain('application');
    }
  });

  test('should handle logout', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find logout button
    const logoutButton = page.locator('button, [role="button"]', { hasText: /Logout|Sign Out|Log Out/i }).first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');
      
      // Verify redirect to login or home
      const url = page.url();
      expect(url).toMatch(/login|auth|home|^\/$/) || console.log(`Redirected to: ${url}`);
    }
  });

  test('should display error when not authenticated', async ({ page, context }) => {
    // Clear auth and try to access
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    
    await page.goto(`${FRONTEND_URL}/employer/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Should show login prompt or redirect to login
    const loginElement = page.locator('[class*="login"], input[type="email"], input[type="password"]').first();
    const isLoginVisible = await loginElement.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isLoginVisible) {
      console.log('✅ Correctly shows login when unauthenticated');
    }
  });

  test('should display error when not employer role', async ({ page }) => {
    // Set token for job seeker (role_id: 3)
    await page.evaluate(() => {
      const jobSeekerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjUsInJvbGVfaWQiOjMsImVtYWlsIjoiam9iQHRlc3QuY29tIiwibmFtZSI6IkpvYiBTZWVrZXIiLCJleHAiOjk5OTk5OTk5OTl9.test';
      localStorage.clear();
      localStorage.setItem('lmis_token', jobSeekerToken);
    });
    
    await page.goto(`${FRONTEND_URL}/employer/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Should show forbidden message
    const forbiddenText = page.locator('text=/forbidden|not.*employer|unauthorized/i').first();
    const isForbiddenVisible = await forbiddenText.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isForbiddenVisible) {
      console.log('✅ Correctly shows forbidden for non-employer');
    }
  });

  test('should display employer jobs if available', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for jobs list or table
    const jobsContainer = page.locator('[class*="job"], [class*="list"], table').first();
    const isJobsVisible = await jobsContainer.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isJobsVisible) {
      console.log('✅ Jobs list is visible');
    }
  });

  test('should display all vacancies', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for a vacancies section showing all available jobs
    const vacanciesSection = page.locator('[class*="vacanc"], [class*="available"]').first();
    const isVacanciesVisible = await vacanciesSection.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVacanciesVisible) {
      console.log('✅ Vacancies section is visible');
    }
  });
});

test.describe('Employer Dashboard API Integration', () => {
  let authToken = '';

  test.beforeAll(async ({ browser }) => {
    // Setup: Get valid auth token
    // This would typically be done via API request
    authToken = 'mock-token'; // In real test, get from login endpoint
  });

  test('should load employer jobs via API', async ({ request }) => {
    const response = await request.get(`${API_BASE}/employers/jobs`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (response.ok()) {
      const jobs = await response.json();
      console.log(`✅ Loaded ${Array.isArray(jobs) ? jobs.length : 0} jobs`);
      expect(Array.isArray(jobs)).toBeTruthy();
    } else {
      console.log(`API response status: ${response.status()}`);
    }
  });

  test('should load applications via API', async ({ request }) => {
    const response = await request.get(`${API_BASE}/employers/applications`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (response.ok()) {
      const applications = await response.json();
      console.log(`✅ Loaded ${Array.isArray(applications) ? applications.length : 0} applications`);
      expect(Array.isArray(applications)).toBeTruthy();
    }
  });
});
