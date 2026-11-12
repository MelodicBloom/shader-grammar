import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../dist/',import.meta.url);
const server=createServer(async(req,res)=>{try{const file=req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0].slice(1);if(file.includes('..'))throw Error();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await readFile(new URL(file,root)));}catch{res.writeHead(404).end();}}).listen(4174,'127.0.0.1');
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
const check=(question,pass,detail='')=>results.push({question,pass,detail});
try{
 await mkdir('reports',{recursive:true});
 await page.goto('http://127.0.0.1:4174');await page.waitForFunction(()=>window.aether);
 await page.evaluate(()=>aether.setState(aether.fixtures[0]));
 results.push(...await page.evaluate(()=>aether.challenge()));
 await page.screenshot({path:'reports/desktop.png',fullPage:true});
 const original=await page.evaluate(()=>aether.getState());
 await page.locator('[data-preset="1"]').click();
 check('Does Bloom set the complete fixture?',await page.evaluate(()=>JSON.stringify(aether.getState())===JSON.stringify(Object.fromEntries(Object.entries(aether.fixtures[1]).filter(([k])=>k!=='name')))));
 await page.locator('#undo').click();
 check('Does undo restore exact state?',JSON.stringify(original)===JSON.stringify(await page.evaluate(()=>aether.getState())));
 await page.locator('#energy').focus();await page.keyboard.press('ArrowRight');
 check('Does keyboard input change energy by 0.01?',Math.abs((await page.evaluate(()=>aether.getState().energy))-original.energy-.01)<1e-8);
 await page.locator('[data-palette="2"]').click();check('Does a palette button set the matching lens?',await page.evaluate(()=>aether.getState().palette===2));
 await page.locator('#time').fill('24');check('Does time scrubbing set the requested time?',await page.evaluate(()=>aether.getState().time===24));
 await page.locator('#reset').click();check('Does reset restore the canonical fixture?',JSON.stringify(original)===JSON.stringify(await page.evaluate(()=>aether.getState())));
 const bounds=await page.locator('#field').boundingBox();await page.mouse.move(bounds.x+bounds.width*.5,bounds.y+bounds.height*.6);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.6,bounds.y+bounds.height*.65);await page.mouse.up();
 check('Does direct manipulation change orientation?',await page.evaluate(()=>aether.getState().yaw!==aether.fixtures[0].yaw));
 await page.locator('#undo').click();
 await page.locator('#share').click();const sharedURL=page.url(),sharedState=await page.evaluate(()=>aether.getState());
 await page.goto(sharedURL);await page.waitForFunction(()=>window.aether);check('Does a state URL restore the exact paused state?',JSON.stringify(sharedState)===JSON.stringify(await page.evaluate(()=>aether.getState())));
 const downloadPromise=page.waitForEvent('download');await page.locator('#capture').click();const download=await downloadPromise;check('Does capture deliver a PNG?',download.suggestedFilename().endsWith('.png'));await download.saveAs('reports/capture.png');
 for(const [width,height] of [[390,844],[844,390]]){await page.setViewportSize({width,height});await page.screenshot({path:`reports/mobile-${width}.png`,fullPage:true});check(`Does ${width}×${height} avoid horizontal overflow?`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4174');await page.waitForFunction(()=>window.aether);const t=await page.evaluate(()=>aether.getState().time);await page.waitForTimeout(200);check('Does reduced motion start paused?',t===await page.evaluate(()=>aether.getState().time));
 check('Are there zero browser runtime errors?',errors.length===0,errors);
}finally{await writeFile('reports/browser-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();server.close();}
assert(results.length>=18,'Expected at least 18 challenges');assert(results.every(r=>r.pass),'Challenge failure');
