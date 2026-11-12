import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:chromium.executablePath(),headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('http://localhost:4173');
 assert.equal(await page.locator('.case-launch').count(),3);assert.equal(await page.locator('.journey a[href="#science-panel"]').count(),1);
 await page.locator('#design-help-open').click();assert.equal(await page.locator('#design-help').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#design-help').isVisible(),false);
 await page.locator('#design-help-open').click();await page.locator('#help-mozambique').click();assert.match(await page.locator('#detail h2').innerText(),/Chimanimani/);assert.equal(await page.locator('#planet-photo').inputValue(),'mars-delta');assert.match(await page.locator('#research-brief').innerText(),/Eberswalde/);assert.match(await page.locator('#research-brief').innerText(),/Relevo regional/);assert.equal(await page.locator('#design-help').isVisible(),false);
 await page.locator('[data-launch-case="2"]').click();assert.equal(await page.locator('#planet-photo').inputValue(),'moon-tycho');assert.match(await page.locator('#research-brief').innerText(),/Karoo/);assert.match(await page.locator('#science-panel').innerText(),/Tycho/);
 await page.locator('[data-launch-case="0"]').click();assert.equal(await page.locator('#planet-photo').inputValue(),'mars-bagnold');await page.locator('#search').fill('not-a-real-place');assert.equal(await page.locator('#research-brief').isVisible(),false);await page.locator('#search').fill('');
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'outputs/design-desktop.png',fullPage:false});await page.locator('#science-panel').screenshot({path:'outputs/design-science.png'});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'outputs/design-mobile.png',fullPage:false});
 await page.locator('#design-help-open').click();assert.equal(await page.locator('#design-help').isVisible(),true);assert.ok(await page.locator('#design-help').evaluate(dialog=>dialog.getBoundingClientRect().width<=innerWidth));await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);console.log('PASS: navegação, três casos, guia/Escape, estado sincronizado, vazio, mobile e JavaScript.');
}finally{await browser.close()}
