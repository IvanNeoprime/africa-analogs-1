// Loaded after numerical functions/data and before the UI. No synthetic fallback.
const scientificMemo=new Map();
function scientificReferenceImage(){return window.galleryReady?window.selectedGalleryIds().planet:target==='Mars'?'mars-bagnold':'moon-apollo'}
function scientificComparison(site,imageId=scientificReferenceImage()){
 const referenceId=SCIENCE_DATA.image_references[imageId],earth=SCIENCE_DATA.earth[site.id],planet=SCIENCE_DATA.planet[referenceId],key=site.id+'|'+(referenceId||imageId)+'|'+weights.join(',');
 if(!scientificMemo.has(key))scientificMemo.set(key,compareTerrain(earth,planet,weights));
 return {...scientificMemo.get(key),earth,planet,referenceId,imageId};
}
function componentScores(site){return scientificComparison(site).components}
function scientificDisplay(value,digits=1){return finiteValue(value)?value.toLocaleString('pt',{maximumFractionDigits:digits}):'—'}
