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
  
  // Click Page Accueil tab
  await page.click('button:has-text("Page Accueil")');
  await page.waitForTimeout(1000);
  
  // Take full page screenshot
  await page.screenshot({ path: '/tmp/page-accueil-full.png', fullPage: true });
  console.log('Full page screenshot saved');
  
  // Check all requirements
  const pageContent = await page.content();
  
  console.log('\n=== DETAILED VERIFICATION ===\n');
  
  // 1. Hero phrase input field
  const heroPhraseLabel = pageContent.includes("Phrase d'accroche du Hero");
  const heroPhraseInput = await page.locator('input[value*="Portfolio"], textarea:near(:text("Phrase"))').count();
  console.log('1. "Phrase d\'accroche du Hero" input field:');
  console.log('   Label present:', heroPhraseLabel ? 'YES ✓' : 'NO ✗');
  console.log('   Input field present:', heroPhraseInput > 0 ? 'YES ✓' : 'NO ✗');
  
  // 2. Description textarea field
  const descriptionLabel = pageContent.includes("Description de la page d'accueil");
  const descriptionTextarea = await page.locator('textarea:near(:text("Description"))').count();
  console.log('\n2. "Description de la page d\'accueil" textarea:');
  console.log('   Label present:', descriptionLabel ? 'YES ✓' : 'NO ✗');
  console.log('   Textarea present:', descriptionTextarea > 0 ? 'YES ✓' : 'NO ✗');
  console.log('   Position: BELOW hero phrase field');
  
  // 3. Specialties section (should be REMOVED)
  const specialtiesSection = pageContent.includes('Cadres des spécialités');
  const specialtyCards = pageContent.includes('Spécialité 1') || pageContent.includes('Spécialité 2');
  console.log('\n3. "Cadres des spécialités (3 cartes)" section:');
  console.log('   Section present:', specialtiesSection ? 'YES ✗ (SHOULD BE REMOVED!)' : 'NO ✓ (CORRECT)');
  console.log('   Specialty cards present:', specialtyCards ? 'YES ✗ (SHOULD BE REMOVED!)' : 'NO ✓ (CORRECT)');
  
  // 4. Specialties tab (should still exist)
  const specialtiesTab = await page.locator('button:has-text("Spécialités (Accueil)")').count();
  console.log('\n4. "Spécialités (Accueil)" tab:');
  console.log('   Tab exists:', specialtiesTab > 0 ? 'YES ✓ (CORRECT)' : 'NO ✗ (MISSING!)');
  
  // Visual verification - check order of elements
  console.log('\n=== VISUAL ORDER VERIFICATION ===\n');
  const heroSection = await page.locator(':text("Phrase d\'accroche du Hero")').boundingBox();
  const descSection = await page.locator(':text("Description de la page")').boundingBox();
  
  if (heroSection && descSection) {
    console.log('Hero phrase Y position:', Math.round(heroSection.y));
    console.log('Description Y position:', Math.round(descSection.y));
    console.log('Description is below hero:', descSection.y > heroSection.y ? 'YES ✓' : 'NO ✗');
  }
  
  // Final summary
  console.log('\n=== TEST SUMMARY ===\n');
  const allTestsPass = 
    heroPhraseLabel && 
    heroPhraseInput > 0 && 
    descriptionLabel && 
    descriptionTextarea > 0 &&
    !specialtiesSection &&
    !specialtyCards &&
    specialtiesTab > 0;
  
  if (allTestsPass) {
    console.log('✓ ALL TESTS PASSED - Implementation is correct!');
  } else {
    console.log('✗ SOME TESTS FAILED - See details above');
  }
  
  await browser.close();
})();
