// Preserve the Worker build and produce CDN assets for Vercel.
import './build.mjs';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const {default:worker}=await import('./dist/server/index.js?vercel-build='+Date.now());
const gallery=JSON.parse(readFileSync('gallery.json','utf8'));
const pages=['/estudo','/dados','/preparacao','/analise','/exportacao'];
const routes=['/','/app.js','/showcase.css','/science-analysis.json','/vendor/leaflet.js','/vendor/leaflet.css',...pages,...['namib','mars','moon'].map(name=>'/assets/'+name+'.jpg'),...gallery.map(image=>image.image),...['layers.png','layers-2x.png','marker-icon.png','marker-icon-2x.png','marker-shadow.png'].map(name=>'/vendor/images/'+name)];
for(const route of new Set(routes)){const response=await worker.fetch(new Request('https://build.local'+route),{});if(!response.ok)throw Error('Failed to build '+route);const filename=pages.includes(route)?path.join('dist/public',route.slice(1),'index.html'):path.join('dist/public',route==='/'?'index.html':route.slice(1));mkdirSync(path.dirname(filename),{recursive:true});writeFileSync(filename,Buffer.from(await response.arrayBuffer()))}
console.log('Vercel: assets estáticos em dist/public; APIs em api/chat.js e api/nasa-data.js.');
