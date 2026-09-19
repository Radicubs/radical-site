import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.ROBOT_TEST_URL || 'http://localhost:3100';
const out = new URL('./lab/', import.meta.url).pathname;
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const findings = [];
try {
  for (const mode of ['desktop', 'mobile', 'reduced', 'no-js', 'small-phone', 'landscape']) {
    const viewport = mode === 'mobile' ? {width:390,height:844} : mode === 'small-phone' ? {width:320,height:568} : mode === 'landscape' ? {width:844,height:390} : {width:1440,height:900};
    const context = await browser.newContext({ viewport, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference', javaScriptEnabled: mode !== 'no-js' });
    await context.addInitScript(() => {
      Element.prototype.requestPointerLock = () => Promise.reject(new Error('Disabled in verification'));
      Element.prototype.setPointerCapture = () => {};
      Element.prototype.releasePointerCapture = () => {};
      Document.prototype.exitPointerLock = () => {};
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${base}/robot`, {waitUntil:'networkidle'});
    if(mode !== 'no-js') await page.waitForSelector('[data-motion]');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.title(), 'Our Robot | Radicubs FRC 7503');
    const geometry = await page.evaluate(() => {
      const root = document.querySelector('.robot-timeline');
      const stage = document.querySelector('.robot-stage');
      return { top:root.getBoundingClientRect().top+scrollY-90, travel:root.offsetHeight-stage.offsetHeight };
    });
    const samples = mode === 'desktop' || mode === 'mobile' ? [0,.16,.25,.37,.48,.59,.70,.81,.94,1] : [0];
    for (const p of samples) {
      await page.evaluate(y => window.scrollTo({top:Math.max(0,y),behavior:'instant'}), geometry.top + geometry.travel*p);
      await page.waitForTimeout(120);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${mode} overflow at ${p}`);
      await page.screenshot({path:`${out}${mode}-${Math.round(p*100)}.png`});
    }
    if (mode === 'desktop' || mode === 'mobile') {
      const buttons = page.locator('.robot-system-nav button');
      for (const [index, id] of ['intake','transfer','shooter','drivetrain','electronics'].entries()) {
        await buttons.nth(index).click();
        await page.waitForTimeout(80);
        assert.equal(await page.locator('.robot-stage').getAttribute('data-state'), id);
        assert.equal(await buttons.nth(index).getAttribute('aria-current'), 'step');
        assert.ok(Number(await page.locator(`[data-focus="${index}"]`).evaluate(el=>getComputedStyle(el).opacity)) > .99);
      }
      // Reversal must return exactly to the assembled opening.
      await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
      await page.waitForTimeout(100);
      assert.equal(await page.locator('.robot-stage').getAttribute('data-state'), 'assembled');
      await page.locator('.robot-system-nav button').first().focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'solid');
      // Test live preference changes, not only first-load reduced motion.
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await page.locator('.robot-stage').evaluate(el=>getComputedStyle(el).position), 'relative');
      await page.emulateMedia({reducedMotion:'no-preference'});
    } else {
      assert.equal(await page.locator('.robot-stage').evaluate(el=>getComputedStyle(el).position), 'relative');
      assert.ok(geometry.travel < 2, `${mode} retained pinned travel`);
    }
    assert.equal(await page.locator('.robot-notes-list article').count(),5);
    assert.equal(await page.locator('.robot-close a').getAttribute('href'),'/team');
    await page.locator('.robot-close').scrollIntoViewIfNeeded();
    await page.screenshot({path:`${out}${mode}-close.png`});
    if (mode === 'desktop') {
      for(const href of await page.locator('.robot-source').evaluateAll(links=>links.map(a=>a.getAttribute('href')))) {
        assert.equal((await page.request.get(`${base}${href}`)).status(),200,href);
      }
    }
    assert.deepEqual(errors,[], `${mode} runtime/network errors`);
    findings.push({ mode, frames:samples.length+1, overflow:false, errors });
    await context.close();
  }
  await fs.writeFile(`${out}results.json`, JSON.stringify(findings,null,2));
  const sheet = await browser.newPage({viewport:{width:1440,height:1300}});
  const frames = ['desktop-0','desktop-25','desktop-59','desktop-100','mobile-0','mobile-25','mobile-59','mobile-100'];
  let html = '<html><body style="margin:0;padding:24px;background:#111;color:#ddd;font:14px monospace"><h1>Robot page: opening / overview / focus / resolve</h1><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">';
  for (const frame of frames) html += `<figure style="margin:0"><img style="width:100%;height:auto" src="data:image/png;base64,${(await fs.readFile(`${out}${frame}.png`)).toString('base64')}"><figcaption>${frame}</figcaption></figure>`;
  await sheet.setContent(html+'</div></body></html>');
  await sheet.screenshot({path:`${out}sheet.png`,fullPage:true});
  await sheet.close();
  console.log(JSON.stringify(findings,null,2));
} finally { await browser.close(); }
