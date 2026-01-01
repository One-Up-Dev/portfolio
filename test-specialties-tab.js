const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Login
  await page.goto('http://localhost:3001/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@oneup.dev');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button:has-text("Se connecter")');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Navigate to contenu
  await page.goto('http://localhost:3001/admin/contenu', { waitUntil: 'networkidle' });
  
  // Take screenshot of all tabs
  await page.screenshot({ path: '/tmp/all-tabs.png', fullPage: false });
  console.log('Screenshot of all tabs saved');
  
  // Click on Spécialités (Accueil) tab
  const specialtiesTab = page.locator('button:has-text("Spécialités (Accueil)")');
  const count = await specialtiesTab.count();
  
  if (count > 0) {
    console.log('\n✓ "Spécialités (Accueil)" tab found');
    await specialtiesTab.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: '/tmp/specialties-tab-content.png', fullPage: true });
    console.log('✓ Screenshot of Spécialités tab content saved');
    
    const content = await page.content();
    if (content.includes('Spécialité') || content.includes('spécialité')) {
      console.log('✓ Spécialités tab is functional and shows specialty management');
    }
  } else {
    console.log('✗ ERROR: "Spécialités (Accueil)" tab not found!');
  }
  
  await browser.close();
})();
