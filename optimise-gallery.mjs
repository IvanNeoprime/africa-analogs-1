import {readFileSync,writeFileSync} from 'node:fs';
import sharp from 'sharp';
const manifest=JSON.parse(readFileSync('gallery.json','utf8'));
for(const image of manifest){
 const file=image.image.slice(1),bytes=readFileSync(file),metadata=await sharp(bytes).metadata();
 if(image.presentation_version==='1800-v1'&&image.display_width===metadata.width&&image.display_height===metadata.height)continue;
 image.original_width=metadata.width;image.original_height=metadata.height;
 if(Math.max(metadata.width,metadata.height)>1800){const output=await sharp(bytes).resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).jpeg({quality:88,mozjpeg:true}).toBuffer({resolveWithObject:true});writeFileSync(file,output.data);image.display_width=output.info.width;image.display_height=output.info.height;image.processing='Redimensionamento proporcional para apresentação; sem recorte, super-resolução ou geração por IA.'}else{image.display_width=metadata.width;image.display_height=metadata.height;image.processing='Imagem original de apresentação; sem ampliação artificial ou geração por IA.'}
 image.presentation_version='1800-v1';image.resolution=`Apresentação: ${image.display_width} × ${image.display_height} píxeis. Sem georreferenciação ou escala comum entre vistas; consultar a fonte para a resolução científica.`;
 console.log(image.id+': '+image.display_width+' x '+image.display_height);
}
writeFileSync('gallery.json',JSON.stringify(manifest,null,2));
