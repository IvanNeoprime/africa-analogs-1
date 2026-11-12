import worker from '../dist/server/index.js';

export default async function handler(req,res){
 try{
  const url=new URL(req.url,'https://africa-analogs.local');
  const request=new Request('https://africa-analogs.local/api/nasa-data'+url.search,{method:req.method,headers:{Accept:String(req.headers?.accept||'application/json')}});
  const response=await worker.fetch(request,process.env);
  res.statusCode=response.status;
  response.headers.forEach((value,name)=>res.setHeader(name,value));
  const body=await response.arrayBuffer();
  res.end(Buffer.from(body));
 }catch{
  res.statusCode=500;
  res.setHeader('Content-Type','application/json');
  res.setHeader('Cache-Control','no-store');
  res.end(JSON.stringify({error:'NASA data service unavailable'}));
 }
}
