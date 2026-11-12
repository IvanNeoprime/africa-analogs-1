import assert from 'node:assert/strict';
import worker from './dist/server/index.js';
import {readFileSync} from 'node:fs';

const routes=['/estudo','/dados','/preparacao','/analise','/exportacao'];
for(const route of routes){
  const response=await worker.fetch(new Request('https://africa-analogs.local'+route),{});
  assert.equal(response.status,200,route+' must resolve');
  assert.ok((response.headers.get('content-type')||'').includes('text/html'));
  assert.match(await response.text(),/id="page-content"|<main/);
}
const script=await (await worker.fetch(new Request('https://africa-analogs.local/app.js'),{})).text();
const styles=await (await worker.fetch(new Request('https://africa-analogs.local/showcase.css'),{})).text();
assert.match(script,/NASA CMR/);
assert.match(readFileSync('dist/server/index.js','utf8'),/collection_concept_id/);
assert.match(script,/\/estudo/);
assert.doesNotMatch(script,/launchCases|data-launch-case|help-mozambique/);
assert.match(styles,/--accent: #3b6fd8/);
assert.match(styles,/\.export-grid/);
console.log('PASS: cinco rotas, NASA CMR, navegação por página, exportações e remoção dos cartões de exemplo.');
