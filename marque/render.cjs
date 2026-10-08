const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1024}});
for (const [src,out,w,h] of [['logo.svg','logo.png',1024,1062],['logo-carre.svg','logo-carre.png',1024,1024]]) { if(!fs.existsSync(src)) continue;
 await p.setViewportSize({width:w,height:h}); await p.setContent(`<html><body style="margin:0">${fs.readFileSync(src,'utf8')}</body></html>`); await p.locator('svg').screenshot({path:out}); }
await b.close()})();
