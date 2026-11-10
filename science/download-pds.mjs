import {mkdirSync,existsSync,statSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const cache='.science-cache/pds';mkdirSync(cache,{recursive:true});mkdirSync('science/data/labels',{recursive:true});
const sources=[
 {id:'mola',base:'https://pds-geosciences.wustl.edu/mgs/urn-nasa-pds-mgs_mola_topography_derived/meg016/',file:'megt90n000eb',size:33177600},
 {id:'mola-counts',base:'https://pds-geosciences.wustl.edu/mgs/urn-nasa-pds-mgs_mola_topography_derived/meg016/',file:'megc90n000eb',size:33177600},
 {id:'lola',base:'https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/',file:'ldem_16',size:33177600}
];
for(const source of sources){
 const file=cache+'/'+source.file+'.img';
 if(!existsSync(file)||statSync(file).size!==source.size){console.log('A descarregar '+source.id+' · 33 MB');const response=await fetch(source.base+source.file+'.img',{signal:AbortSignal.timeout(180000)});if(!response.ok)throw Error(source.id+': HTTP '+response.status);const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length!==source.size)throw Error('Tamanho inesperado: '+source.id);writeFileSync(file,bytes)}
 const response=await fetch(source.base+source.file+'.lbl',{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Label: HTTP '+response.status);const label=await response.text();writeFileSync('science/data/labels/'+source.id+'.lbl',label);
 const bytes=readFileSync(file);source.sha256=createHash('sha256').update(bytes).digest('hex');source.label_sha256=createHash('sha256').update(label).digest('hex');source.url=source.base+source.file+'.img';source.label_url=source.base+source.file+'.lbl';source.retrieved_at=new Date().toISOString();console.log(source.id+' · tamanho e SHA-256 registados.');
}
writeFileSync('science/data/pds-provenance.json',JSON.stringify(sources,null,2));
