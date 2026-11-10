import worker from '../dist/server/index.js';

// Node.js Vercel Function: credentials are read only from the server environment.
export default async function handler(req,res){
 try{
  if(req.method!=='POST'){res.statusCode=405;res.setHeader('Allow','POST');res.end('Method not allowed');return}
  let body;
  if(req.body!==undefined)body=typeof req.body==='string'||Buffer.isBuffer(req.body)?req.body:JSON.stringify(req.body);
  else{const chunks=[];let length=0;for await(const chunk of req){length+=Buffer.byteLength(chunk);if(length>10000){res.statusCode=413;res.end('Too large');return}chunks.push(Buffer.from(chunk))}body=Buffer.concat(chunks)}
  if(Buffer.byteLength(body)>10000){res.statusCode=413;res.end('Too large');return}
  const request=new Request('https://africa-analogs.local/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body});
  const response=await worker.fetch(request,process.env);res.statusCode=response.status;
  response.headers.forEach((value,name)=>res.setHeader(name,value));res.setHeader('Cache-Control','no-store');res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Server error'}))}
}
