const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to projects page');
    await page.goto('http://localhost:3002/projets', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/01-projects-list.png', fullPage: true });
    console.log('✓ Screenshot saved: 01-projects-list.png');

    console.log('\nStep 2: Click on first project');
    const firstProject = page.locator('a[href^="/projets/"]').first();
    await firstProject.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/02-project-detail.png', fullPage: true });
    console.log('✓ Screenshot saved: 02-project-detail.png');

    console.log('\nStep 3: Check for gallery section');
    const galleryHeading = page.locator('text=Galerie');
    const galleryExists = await galleryHeading.count() > 0;
    console.log('Gallery section found:', galleryExists);

    if (galleryExists) {
      console.log('\nStep 4: Find and hover over first gallery image');
      const firstGalleryImage = page.locator('section').filter({ hasText: 'Galerie' }).locator('img').first();
      
      await firstGalleryImage.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      const cursor = await firstGalleryImage.evaluate(el => window.getComputedStyle(el.parentElement).cursor);
      console.log('Cursor style on gallery image parent:', cursor);
      
      await firstGalleryImage.hover();
      await page.screenshot({ path: '/tmp/03-gallery-hover.png' });
      console.log('✓ Screenshot saved: 03-gallery-hover.png');

      console.log('\nStep 5: Click gallery image to open lightbox');
      await firstGalleryImage.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/04-lightbox-open.png', fullPage: true });
      console.log('✓ Screenshot saved: 04-lightbox-open.png');

      console.log('\nStep 6: Check lightbox elements');
      const backdrop = page.locator('div[class*="fixed"]').filter({ has: page.locator('img') });
      const backdropCount = await backdrop.count();
      console.log('Lightbox modal found:', backdropCount > 0);
      
      const largeImage = page.locator('img[class*="max-"]');
      const largeImageCount = await largeImage.count();
      console.log('Large image in lightbox found:', largeImageCount > 0);

      console.log('\nStep 7: Click backdrop to close lightbox');
      await page.click('body', { position: { x: 50, y: 50 } });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/05-lightbox-closed.png', fullPage: true });
      console.log('✓ Screenshot saved: 05-lightbox-closed.png');

      console.log('\nStep 8: Verify lightbox is closed');
      const lightboxStillVisible = await backdrop.count();
      console.log('Lightbox closed successfully:', lightboxStillVisible === 0);
      
      if (lightboxStillVisible === 0) {
        console.log('\n✅ ALL TESTS PASSED');
      } else {
        console.log('\n❌ TEST FAILED - Lightbox did not close');
      }
    } else {
      console.log('\n⚠️ No gallery found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
