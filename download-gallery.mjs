import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
const seeds=JSON.parse(readFileSync('gallery-seeds.json','utf8'));
const evidence=JSON.parse(readFileSync('evidence.json','utf8'));
const basic=[{...evidence.earth,id:'namib-orbit',world:'Earth',sites:['namib'],category:'dunes'},{...evidence.mars,id:'mars-bagnold',world:'Mars',sites:[],category:'dunes'},{...evidence.moon,id:'moon-apollo',world:'Moon',sites:[],category:'volcanic'}];
const cached=existsSync('gallery.json')?JSON.parse(readFileSync('gallery.json','utf8')):[];
const refresh=process.argv.includes('--refresh');
const manifest=[...basic];mkdirSync('assets/gallery',{recursive:true});
const decode=value=>value.replaceAll('&amp;','&').replaceAll('&#038;','&');
for(const seed of seeds){
 const previous=cached.find(item=>item.id===seed.id);if(!refresh&&previous&&existsSync('.'+previous.image)){manifest.push({...previous,...seed});console.log(seed.id+': cached');continue}
 try{
  const response=await fetch(seed.url,{signal:AbortSignal.timeout(25000)});if(!response.ok&&!seed.image_url)throw Error('Source HTTP '+response.status);
  const html=await response.text();
  const downloads=[...html.matchAll(/href=["']([^"']+\.(?:jpg|jpeg|png)(?:\?[^"']*)?)["']/gi)].map(match=>decode(match[1])).filter(url=>url.includes('assets.science.nasa.gov'));
  let image=seed.image_url||downloads.find(url=>/_lrg\./i.test(url))||downloads.find(url=>url.includes('/dynamicimage/'))||html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)/i)?.[1]||html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image/i)?.[1];
  if(!image&&seed.url.includes('modis.gsfc.nasa.gov'))image=[...html.matchAll(/(?:src|href)=["']([^"']+\.(?:jpg|png)(?:\?[^"']*)?)["']/gi)].map(match=>match[1]).find(url=>/gallery|images\/image|uploads|crefl/i.test(url)&&!/logo|banner|header/i.test(url));
  if(!image)throw Error('Sem imagem identificada');
  const imageURL=new URL(decode(image),seed.url);if(imageURL.hostname==='assets.science.nasa.gov'){imageURL.search='';imageURL.searchParams.set('w','1500');imageURL.searchParams.set('quality','85')}
  const result=await fetch(imageURL,{signal:AbortSignal.timeout(30000)});const mime=result.headers.get('content-type')?.split(';')[0];if(!result.ok||!mime?.startsWith('image/'))throw Error('Image HTTP '+result.status);
  const bytes=Buffer.from(await result.arrayBuffer());if(bytes.length<12000)throw Error('Imagem demasiado pequena para galeria');
  const extension=mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';const file='assets/gallery/'+seed.id+'.'+extension;writeFileSync(file,bytes);
  manifest.push({...seed,image:'/'+file,image_url:imageURL.href,mime,credit:seed.credit||'NASA · créditos completos na página da fonte',date_label:seed.date_label||'Data de aquisição: consultar fonte',resolution:'Imagem de apresentação, não georreferenciada. Sem escala comum entre vistas.',reviewed_at:'2026-11-09'});
  console.log(seed.id+': '+bytes.length+' bytes');
 }catch(error){console.log(seed.id+': FAILED '+error.message)}
 writeFileSync('gallery.json',JSON.stringify(manifest,null,2));
}
writeFileSync('gallery.json',JSON.stringify(manifest,null,2));console.log('Galeria: '+manifest.length+' imagens');
await import('./optimise-gallery.mjs');
