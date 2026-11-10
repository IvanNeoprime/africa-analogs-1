import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {Readable} from 'node:stream';
import handler from './api/chat.js';
const key=process.env.NVIDIA_API_KEY;delete process.env.NVIDIA_API_KEY;
const results=[];
async function invoke(req){const response={headers:{},statusCode:200,setHeader(name,value){this.headers[name.toLowerCase()]=value},end(body){this.body=Buffer.from(body||'').toString()}};await handler(req,response);return response}
try{
for(const [name,req,status]of [
 ['method',{method:'GET'},405],['invalid JSON',{method:'POST',body:'{'},400],['null body',{method:'POST',body:null},400],['unknown site',{method:'POST',body:{site_id:'missing',target:'Mars',question:'teste'}},400],['size limit',{method:'POST',body:'x'.repeat(10001)},413]
]){assert.equal((await invoke(req)).statusCode,status);results.push(name)}
const body={site_id:'namib',target:'Mars',question:'Explica as medidas reais.'};
for(const request of [{method:'POST',body},{method:'POST',body:Buffer.from(JSON.stringify(body))},Object.assign(Readable.from([JSON.stringify(body)]),{method:'POST'})]){const r=await invoke(request);assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).mode,'demo');assert.match(JSON.parse(r.body).answer,/SÍNTESE LOCAL/);assert.equal(r.headers['cache-control'],'no-store')}results.push('parsed JSON, buffer and Node stream');
const config=JSON.parse(readFileSync('vercel.json','utf8'));assert.equal(config.functions['api/chat.js'].maxDuration,60);assert.ok(config.headers[0].headers.some(header=>header.value.includes('https://gibs.earthdata.nasa.gov')));
for(const asset of ['index.html','app.js','showcase.css','science-analysis.json','vendor/leaflet.js','vendor/leaflet.css'])assert.ok(readFileSync('dist/public/'+asset).length>0);assert.ok(readdirSync('dist/public/assets',{recursive:true}).filter(name=>/\.(jpg|png)$/.test(name)).length>=19);assert.match(readFileSync('dist/public/app.js','utf8'),/NASA_GIBS/);assert.doesNotMatch(readFileSync('dist/public/app.js','utf8'),/nvapi-[A-Za-z0-9_-]{24,}/);results.push('CDN assets, NASA CSP, server-only key');console.log('PASS: Vercel adapter — '+results.join('; '));
}finally{if(key)process.env.NVIDIA_API_KEY=key}
