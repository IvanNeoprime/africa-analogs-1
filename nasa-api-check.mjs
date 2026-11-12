import assert from 'node:assert/strict';
import worker from './dist/server/index.js';
import nasaDataHandler from './api/nasa-data.js';

const originalFetch=globalThis.fetch;
const requests=[];
globalThis.fetch=async input=>{
  const url=new URL(input);
  requests.push(url);
  if(!url.hostname.endsWith('earthdata.nasa.gov'))throw new Error('Unexpected upstream host');
  if(url.pathname.includes('/collections.'))return Response.json({items:[{meta:{'concept-id':'C1234-PROV'},umm:{ShortName:'LANDSAT',EntryTitle:'Landsat surface reflectance',Abstract:'Surface observations',Platforms:[{ShortName:'Landsat 9'}]}}]});
  if(url.pathname.includes('/granules.'))return Response.json({items:[{meta:{'concept-id':'G1234-PROV'},umm:{GranuleUR:'LC09_L2SP_001001_20260101',TemporalExtent:{RangeDateTime:{BeginningDateTime:'2026-01-01T00:00:00Z',EndingDateTime:'2026-01-01T00:00:00Z'}},RelatedUrls:[{URL:'https://data.example/nasa-product',Type:'GET DATA'}]}}]});
  throw new Error('Unexpected NASA endpoint');
};
async function get(query){return worker.fetch(new Request('https://africa-analogs.local/api/nasa-data?'+query),{})}
try{
  let response=await get('mode=collections&query=Landsat');
  assert.equal(response.status,200);
  let body=await response.json();
  assert.equal(body.collections[0].id,'C1234-PROV');
  assert.equal(body.collections[0].shortName,'LANDSAT');
  response=await get('mode=granules&site_id=ntwetwe&collection_id=C1234-PROV');
  assert.equal(response.status,200);
  body=await response.json();
  assert.equal(body.site.id,'ntwetwe');
  assert.equal(body.spatial_match.radius_m,30000);
  assert.equal(body.granules[0].id,'G1234-PROV');
  assert.equal(body.granules[0].start,'2026-01-01T00:00:00Z');
  assert.equal(requests.at(-1).searchParams.get('circle[]'),'25.2,-20.5,30000');
  assert.equal((await get('mode=granules&site_id=missing&collection_id=C1234-PROV')).status,400);
  assert.equal((await get('mode=collections&query=x')).status,400);
  const sink={headers:{},setHeader(name,value){this.headers[name]=value},end(body){this.body=Buffer.from(body)}};
  await nasaDataHandler({method:'GET',url:'/api/nasa-data?mode=collections&query=Landsat',headers:{}},sink);
  assert.equal(sink.statusCode,200);
  assert.equal(JSON.parse(sink.body.toString()).collections[0].id,'C1234-PROV');
  const method=await worker.fetch(new Request('https://africa-analogs.local/api/nasa-data',{method:'POST'}),{});
  assert.equal(method.status,405);
  console.log('PASS: NASA CMR search, spatial join, Vercel adapter, validation and method guard.');
}finally{globalThis.fetch=originalFetch}
