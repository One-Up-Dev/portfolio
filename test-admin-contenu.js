const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to admin login page...');
  await page.goto('http://localhost:3001/admin/login', { waitUntil: 'networkidle' });
  
  // Fill in login form
  console.log('Filling login credentials...');
  await page.fill('input[type="email"]', 'admin@oneup.dev');
  await page.fill('input[type="password"]', 'Admin123!');
  
  // Take screenshot before login
  await page.screenshot({ path: '/tmp/before-login.png', fullPage: true });
  console.log('Screenshot: Before login saved');
  
  // Click login button
  console.log('Clicking login button...');
  await page.click('button:has-text("Se connecter")');
  
  // Wait for navigation
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  console.log('Current URL:', page.url());
  await page.screenshot({ path: '/tmp/after-login.png', fullPage: true });
  console.log('Screenshot: After login saved');
  
  // Navigate to contenu page
  console.log('Navigating to contenu page...');
  await page.goto('http://localhost:3001/admin/contenu', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/admin-contenu-page.png', fullPage: true });
  console.log('Screenshot: Admin contenu page saved');
  
  // Get all text content to debug
  const allText = await page.locator('body').textContent();
  console.log('\n=== PAGE TEXT (first 500 chars) ===');
  console.log(allText.substring(0, 500));
  
  // Look for tabs more carefully
  console.log('\n=== Looking for tabs ===');
  const tabSelectors = [
    '[role="tab"]',
    'button[role="tab"]',
    '.tab',
    'button:has-text("Accueil")',
    'button:has-text("Page")'
  ];
  
  for (const selector of tabSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      const texts = await page.locator(selector).allTextContents();
      console.log(`Found ${count} elements for ${selector}:`, texts);
    }
  }
  
  // Try to click on Page Accueil tab using different selectors
  let clicked = false;
  const possibleSelectors = [
    'button:has-text("Page Accueil")',
    '[role="tab"]:has-text("Page Accueil")',
    'button:has-text("Accueil")',
    '.tab:has-text("Accueil")'
  ];
  
  for (const selector of possibleSelectors) {
    const element = page.locator(selector).first();
    const count = await element.count();
    if (count > 0) {
      console.log(`\nFound tab with selector: ${selector}`);
      await element.click();
      clicked = true;
      break;
    }
  }
  
  if (clicked) {
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/admin-page-accueil-tab.png', fullPage: true });
    console.log('Screenshot: Page Accueil tab saved');
    
    // Check for specific fields
    const pageContent = await page.content();
    console.log('\n=== VERIFICATION RESULTS ===');
    console.log('Hero phrase field:', pageContent.includes('Phrase') && pageContent.includes('Hero') ? 'PRESENT' : 'NOT FOUND');
    console.log('Description field:', pageContent.includes('Description de la page') ? 'PRESENT' : 'NOT FOUND');
    console.log('Specialties section:', pageContent.includes('Cadres des spécialités') ? 'STILL VISIBLE (SHOULD BE REMOVED)' : 'REMOVED (CORRECT)');
    
    const specialtiesTabCount = await page.locator('text=Spécialités').count();
    console.log('Specialties tab exists:', specialtiesTabCount > 0 ? 'YES' : 'NO');
  } else {
    console.log('\nERROR: Could not find Page Accueil tab with any selector');
  }
  
  await browser.close();
})();
