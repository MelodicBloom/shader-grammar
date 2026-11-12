import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const server=createServer(async(req,res)=>{try{const path=req.url.split('?')[0];const file=path==='/'?'index.html':path.slice(1);if(file.includes('..'))throw Error();const data=await readFile(new URL('../dist/'+file,import.meta.url));res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data)}catch{res.writeHead(404).end()}}).listen(4173,'127.0.0.1');
await mkdir('reports',{recursive:true});
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.aether);await page.evaluate(()=>window.aether.setState(window.aether.fixtures[0]));
const results=await page.evaluate(()=>window.aether.qa());
await page.locator('#results').evaluate(e=>e.hidden=true);
await page.screenshot({path:'reports/desktop.png',fullPage:true});
const original=await page.evaluate(()=>window.aether.state);
await page.getByRole('button',{name:/Solar bloom/}).click();await page.locator('#undo').click();
results.push({question:'Preset undo restores exact state?',pass:JSON.stringify(original)===JSON.stringify(await page.evaluate(()=>window.aether.state))});
await page.locator('#energy').focus();await page.keyboard.press('ArrowRight');const changed=await page.evaluate(()=>window.aether.state.energy);results.push({question:'Keyboard control changes energy?',pass:changed>original.energy});
await page.locator('#reset').click();results.push({question:'Reset restores fixture zero?',pass:JSON.stringify(await page.evaluate(()=>window.aether.state))===JSON.stringify(original)});
for(const width of [390,844]){await page.setViewportSize({width,height:width===390?844:390});await page.screenshot({path:`reports/mobile-${width}.png`,fullPage:true});results.push({question:`No horizontal overflow at ${width}px?`,pass:await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)})}
const hash=encodeURIComponent(JSON.stringify({...original,phase:123}));await page.goto('http://127.0.0.1:4173/#'+hash);await page.waitForFunction(()=>window.aether?.state.phase===123);results.push({question:'Shared URL restores exact paused phase?',pass:(await page.evaluate(()=>window.aether.state.phase))===123});
results.push({question:'No browser runtime errors?',pass:errors.length===0,measurement:errors});
await writeFile('reports/qa.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();server.close();
// GPU performance is reported separately: software CI is not representative of a physical GPU.
if(results.some(r=>!r.pass&&!r.question.includes('30 FPS')))process.exitCode=1;
