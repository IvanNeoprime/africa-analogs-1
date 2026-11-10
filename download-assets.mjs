import {mkdirSync,writeFileSync} from 'node:fs';
const page=await (await fetch('https://www.nasa.gov/image-article/mastcam-telephoto-of-martian-dunes-downwind-face/')).text();
const og=page.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)/)?.[1]||page.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image/)?.[1];
if(!og)throw Error('Imagem oficial não encontrada');
const urls={namib:'https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/imagerecords/149000/149130/namibdunes_hwk_202020_lrg.jpg?w=1400',mars:og.replaceAll('&amp;','&'),moon:'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia13/pia13002/PIA13002.jpg?w=1200'};
mkdirSync('assets',{recursive:true});
for(const [name,url]of Object.entries(urls)){const r=await fetch(url);if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw Error('Falha no download de '+name);const b=Buffer.from(await r.arrayBuffer());writeFileSync('assets/'+name+'.jpg',b);console.log(name+': '+b.length+' bytes');}
