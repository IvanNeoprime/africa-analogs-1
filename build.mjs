import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const html=readFileSync('index.html','utf8'),js=readFileSync('app.js','utf8');
const catalog=js.slice(js.indexOf('const sites='),js.indexOf('let selected='));
const worker=`${catalog}
const html=${JSON.stringify(html)},js=${JSON.stringify(js)};
export default {async fetch(request,env){
const url=new URL(request.url);
if(url.pathname==='/api/chat'){
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 if(Number(request.headers.get('content-length'))>10000)return new Response('Too large',{status:413});
 let body;try{const raw=await request.text();if(raw.length>10000)return new Response('Too large',{status:413});body=JSON.parse(raw)}catch{return new Response('Invalid JSON',{status:400})}
 const site=sites.find(s=>s.id===body.site_id);if(!site||!['Mars','Moon'].includes(body.target)||typeof body.question!=='string'||!body.question.trim()||body.question.length>1000)return new Response('Invalid request',{status:400});
 const context=JSON.stringify({site,target:body.target,data_status:'Synthetic demonstration, not measured',sources:{MOLA:'https://mars.asu.edu/data/',LOLA:'https://pds-geosciences.wustl.edu/missions/lro/lola.htm'}});
 if(env.NVIDIA_API_KEY&&env.NEMOTRON_MODEL){
 try{const result=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+env.NVIDIA_API_KEY,'Content-Type':'application/json'},signal:AbortSignal.timeout(25000),body:JSON.stringify({model:env.NEMOTRON_MODEL,messages:[{role:'system',content:'És o assistente Africa Analogs. Responde em português apenas com base no contexto. Distingue dados sintéticos, hipóteses e limitações. Não alegues ter analisado rasters, consultado fontes ou validado equivalência. As fontes são referências para trabalho futuro. Nunca inventes medições. Contexto: '+context},{role:'user',content:body.question}],max_tokens:650,temperature:0.2})});if(!result.ok)return Response.json({error:'Nemotron unavailable'},{status:502});const data=await result.json();const answer=data.choices?.[0]?.message?.content;if(!answer)return new Response('Empty model response',{status:502});return Response.json({mode:'live',answer})}catch{return Response.json({error:'Nemotron request failed'},{status:502})}
 }
 const answer='SÍNTESE DEMONSTRATIVA · SEM INFERÊNCIA NEMOTRON\\n\\n'+site.name+' → '+(body.target==='Mars'?'Marte':'Lua')+'\\n'+site.why+'\\n\\nPara esta pergunta, a evidência disponível limita-se ao catálogo conceptual. Os valores mostrados são sintéticos. A interpretação exige validação específica para o destino selecionado.\\n\\nDados em falta: '+site.missing+'\\n\\nPróximos passos: examinar a referência '+(body.target==='Mars'?'MOLA':'LOLA')+' no JMARS, caracterizar o local terrestre no QGIS e rever pontos de reconhecimento no UgCS. Não foi realizada análise de rasters nem planeamento operacional.\\n\\nReferência externa: '+(body.target==='Mars'?'https://mars.asu.edu/data/':'https://pds-geosciences.wustl.edu/missions/lro/lola.htm');
 return Response.json({mode:'demo',answer});
}
if(url.pathname!=='/'&&url.pathname!=='/app.js')return new Response('Not found',{status:404});
return new Response(url.pathname==='/app.js'?js:html,{headers:{'Content-Type':url.pathname==='/app.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"}})
}};`;
mkdirSync('dist/server',{recursive:true});writeFileSync('dist/server/index.js',worker);console.log('Worker construído: dist/server/index.js');
