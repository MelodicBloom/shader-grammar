import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const server=createServer(async(req,res)=>{
  try{const pathname=new URL(req.url,'http://localhost').pathname;const file=pathname==='/'?'index.html':pathname.slice(1);if(file.includes('..'))throw Error();
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await readFile(new URL('../dist/'+file,import.meta.url)));
  }catch{res.writeHead(404).end();}
}).listen(4173,'127.0.0.1');
await mkdir('reports',{recursive:true});
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1100},deviceScaleFactor:1,permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4173/';await page.goto(base);await page.waitForFunction(()=>window.aether);
await page.evaluate(()=>window.aether.setState(window.aether.defaults));
const results=await page.evaluate(()=>window.aether.qa());
const check=(question,pass,measurement)=>results.push({question,pass:!!pass,measurement});
await page.locator('#results').evaluate(e=>e.hidden=true);
await page.evaluate(()=>window.aether.setState(window.aether.defaults));
const original=await page.evaluate(()=>window.aether.state),shape=s=>Object.fromEntries(['energy','harmonics','twist','hue','phase'].map(k=>[k,s[k]]));
await page.screenshot({path:'reports/desktop.png',fullPage:true});
await page.locator('[data-view="side"]').click();let current=await page.evaluate(()=>window.aether.state);
check('Side view changes only pose?',current.ry===90&&current.rx===0&&current.rz===0&&JSON.stringify(shape(current))===JSON.stringify(shape(original)));
await page.screenshot({path:'reports/side.png',fullPage:true});await page.locator('#undo').click();
check('Undo restores exact camera and shape?',JSON.stringify(await page.evaluate(()=>window.aether.state))===JSON.stringify(original));
await page.getByRole('button',{name:/Solar bloom/}).click();await page.locator('#undo').click();
check('Preset undo restores state and label?',JSON.stringify(await page.evaluate(()=>window.aether.state))===JSON.stringify(original)&&(await page.locator('#scene').textContent())==='01 — RESONANCE');
for(const axis of ['rx','ry','rz']){
  await page.locator('#'+axis).focus();await page.keyboard.press('ArrowRight');const current=await page.evaluate(()=>window.aether.state);
  check(axis+' slider responds to keyboard?',current[axis]===original[axis]+1);
  await page.locator('#undo').click();
}
const rect=await page.locator('#canvas').boundingBox(),x=rect.x+rect.width*.5,y=rect.y+rect.height*.5;
await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+80,y+50,{steps:5});await page.mouse.up();
current=await page.evaluate(()=>window.aether.state);
check('Drag rotates X/Y, holding shape fixed?',current.rx!==original.rx&&current.ry!==original.ry&&JSON.stringify(shape(current))===JSON.stringify(shape(original)));
await page.locator('#undo').click();
check('One undo reverses an entire drag?',JSON.stringify(await page.evaluate(()=>window.aether.state))===JSON.stringify(original));
await page.keyboard.down('Shift');await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+60,y,{steps:4});await page.mouse.up();await page.keyboard.up('Shift');
current=await page.evaluate(()=>window.aether.state);
check('Shift-drag rolls Z only?',current.rz!==original.rz&&current.rx===original.rx&&current.ry===original.ry);
await page.locator('#reset').click();
await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight');current=await page.evaluate(()=>window.aether.state);
check('Canvas keyboard orbit works?',current.ry===original.ry+5);
await page.locator('#reset').click();await page.locator('#energy').focus();await page.keyboard.press('ArrowRight');
check('Shape control responds to keyboard?',(await page.evaluate(()=>window.aether.state)).energy>original.energy);
await page.locator('#reset').click();check('Reset restores full fixture?',JSON.stringify(await page.evaluate(()=>window.aether.state))===JSON.stringify(original));
await page.locator('#experiment').click();check('Socratic experiment reports a measured invariant?',(await page.locator('#experiment-result').textContent()).includes('PASS · 512'));
// A paused instrument must not keep rendering identical frames.
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const count=await page.evaluate(()=>window.aether.stats.draws);await page.waitForTimeout(200);
check('Paused GPU stops redrawing?',count===await page.evaluate(()=>window.aether.stats.draws),count+' draws before pause check');
await page.getByRole('button',{name:'Play animation',exact:true}).click();
await page.waitForFunction(()=>window.aether.state.phase>1);await page.getByRole('button',{name:'Pause animation',exact:true}).click();current=await page.evaluate(()=>window.aether.state);
check('Animation advances phase without rotating camera?',current.phase>0&&current.rx===original.rx&&current.ry===original.ry&&current.rz===original.rz);
for(const width of [390,844]){
  await page.setViewportSize({width,height:width===390?844:390});await page.evaluate(()=>window.aether.setState(window.aether.defaults));
  await page.screenshot({path:`reports/mobile-${width}.png`,fullPage:true});
  check(`No overflow at ${width}px?`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
}
await page.evaluate(()=>window.aether.setState({...window.aether.defaults,rx:37,ry:-64,rz:125,zoom:5.1,phase:123.456}));
const shared=await page.evaluate(()=>window.aether.share()),expected=await page.evaluate(()=>window.aether.state);
const replay=await context.newPage();replay.on('pageerror',e=>errors.push(e.message));await replay.goto(shared);await replay.waitForFunction(()=>window.aether);
check('Fresh URL restores every shape/phase/camera field?',JSON.stringify(await replay.evaluate(()=>window.aether.state))===JSON.stringify(expected));
check('Shared view opens paused?',(await replay.locator('#fps').textContent())==='PAUSED');
const changed={...expected,rx:-82,phase:278};await page.goto(base+'#'+encodeURIComponent(JSON.stringify(changed)));await page.waitForFunction(()=>window.aether?.state.phase===278);
check('Open-tab hash replay restores camera?',(await page.evaluate(()=>window.aether.state)).rx===-82);
await replay.goto(base+'#'+encodeURIComponent(JSON.stringify({version:99,energy:.1})));await replay.reload();await replay.waitForFunction(()=>window.aether);
check('Unknown state versions are rejected visibly?',(await replay.locator('#notice').textContent()).includes('Unsupported state version'));
const download=page.waitForEvent('download');await page.locator('#capture').click();const file=await download;check('PNG export downloads?',file.suggestedFilename().endsWith('.png'));await file.saveAs('reports/export.png');
await page.goto(base+'applications.html');check('Applications distinguish art from physical evidence?',(await page.locator('article').textContent()).includes('not joules'));
const reduced=await browser.newContext({reducedMotion:'reduce'});const reducedPage=await reduced.newPage();await reducedPage.goto(base);await reducedPage.waitForFunction(()=>window.aether);check('Reduced motion starts paused?',(await reducedPage.locator('#fps').textContent())==='PAUSED');
check('No browser exceptions?',errors.length===0,errors);
await writeFile('reports/qa.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
await browser.close();server.close();
// A separate performance result remains visible; physical-GPU claims require physical-GPU evidence.
if(results.some(r=>!r.pass&&!r.question.includes('33.34')))process.exitCode=1;
