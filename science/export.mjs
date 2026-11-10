import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {nativeCSV,asciiGrid,bodyGCS,localProjection} from './io.mjs';
const analysis=JSON.parse(readFileSync('science/data/analysis.json','utf8'));mkdirSync('science/exports',{recursive:true});
writeFileSync('science/exports/provenance.json',JSON.stringify(analysis,null,2));
for(const [id,record]of Object.entries(analysis.planet)){const native=record.native;writeFileSync('science/exports/'+id+'-jmars-west.csv',nativeCSV(record));writeFileSync('science/exports/'+id+'-native.asc',asciiGrid({...native,cell_m:1/native.ppd},{xll:native.col_start/native.ppd,yll:90-(native.row_start+native.height)/native.ppd,cell:1/native.ppd}));writeFileSync('science/exports/'+id+'-native.prj',bodyGCS(record.world,record.reference.radius_m));writeFileSync('science/exports/'+id+'-regional.asc',asciiGrid(record.grid));writeFileSync('science/exports/'+id+'-regional.prj',localProjection(record));}
for(const [id,record]of Object.entries(analysis.earth))if(record.grid){writeFileSync('science/exports/'+id+'-earth.asc',asciiGrid(record.grid));writeFileSync('science/exports/'+id+'-earth.prj',localProjection(record));}
console.log('Exportações nativas e regionais criadas com CRS separados por corpo.');
