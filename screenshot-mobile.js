const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  // iPhone 14 Pro
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  
  const page = await context.newPage();
  
  // Landing page - full scroll
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/m-landing-hero.png' });
  
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/m-landing-problem.png' });
  
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/m-landing-problem2.png' });
  
  await page.evaluate(() => {
    const el = document.querySelector('section:nth-of-type(3)');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/m-landing-howitworks.png' });
  
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/m-landing-freetool.png' });

  await page.evaluate(() => {
    const sections = document.querySelectorAll('section');
    const benefits = Array.from(sections).find(s => s.querySelector('h2')?.textContent?.includes('hours back'));
    if (benefits) benefits.scrollIntoView();
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/m-landing-benefits.png' });

  await page.evaluate(() => document.querySelector('footer')?.scrollIntoView());
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/m-landing-cta.png' });
  
  // Debrief page
  await page.goto('http://localhost:3000/debrief', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/m-debrief.png' });
  
  await browser.close();
  console.log('done');
})();
