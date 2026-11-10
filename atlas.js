// Geographic explorer. Local boundaries and markers work without external tiles.
const countryNames=Object.fromEntries(sites.map(site=>[site.code,site.country]));
const countryCounts=Object.fromEntries(Object.values(countryNames).map(name=>[name,sites.filter(site=>site.country===name).length]));
let shortlist=[];
try{const saved=JSON.parse(localStorage.getItem('africa-analogs-shortlist')||'[]');if(Array.isArray(saved))shortlist=[...new Set(saved)].filter(id=>sites.some(site=>site.id===id)).slice(0,3)}catch{}
let markers=new Map(),countryLayers=new Map(),lastSelected='',lastFilters='',countryLabelsVisible=true,roadErrors=0;
const mapHost=$('.map');
mapHost.setAttribute('aria-label','Mapa geográfico interativo da SADC');
mapHost.innerHTML='<div id="atlas-map" aria-label="Arraste para explorar, use os controlos para ampliar e selecione um marcador"></div><div class="atlas-toolbar"><div class="atlas-switch" role="group" aria-label="Cartografia"><button id="atlas-local" class="active" aria-pressed="true">Atlas local</button><button id="atlas-roads" aria-pressed="false">Ruas · online</button></div><button id="map-fit" title="Mostrar todos os resultados">⊙ Ver resultados</button><button id="map-fullscreen" title="Abrir mapa em ecrã inteiro">⛶</button></div><div id="map-status" role="status">Arraste o mapa · clique num país ou marcador</div>';
$('#relief')?.closest('label')?.remove();$('#labels')?.closest('label')?.remove();
$('.sidebar .notice').insertAdjacentHTML('beforebegin','<label><input id="country-labels" type="checkbox" checked> Nomes dos países</label><button class="reset-filters" id="reset-filters">Limpar filtros ↺</button>');
$('.sidebar .notice').textContent='18 locais em 16 países da SADC. Pontos aproximados e índices regionais provisórios; fontes descritivas não validam analogia planetária.';
$('#sites').setAttribute('aria-label','Locais candidatos');
$('.feature').insertAdjacentHTML('afterend',`<section class="region-discovery"><div><small>EXPLORAR A SADC</small><h2>Mais paisagens. Mais perguntas.</h2><p>18 candidatos em 16 países. Comece por Moçambique ou desenhe a sua própria comparação.</p></div><div class="country-chips"><button data-region="Moçambique" class="primary">Moçambique <span>2 locais</span></button><button data-region="Angola">Angola</button><button data-region="Tanzânia">Tanzânia</button><button data-region="Madagáscar">Madagáscar</button><button data-region="">Toda a SADC ↗</button></div></section>`);
const compareSection=document.createElement('section');compareSection.id='site-comparison';compareSection.className='site-comparison';$('#comparison').before(compareSection);
const map=L.map('atlas-map',{zoomControl:false,minZoom:2,maxZoom:14,scrollWheelZoom:false,preferCanvas:false,zoomAnimation:!matchMedia('(prefers-reduced-motion: reduce)').matches}).setView([-17,34],4);
window.atlasMap=map;
L.control.zoom({zoomInTitle:'Aumentar mapa',zoomOutTitle:'Diminuir mapa'}).addTo(map);
L.control.scale({imperial:false,maxWidth:100,position:'bottomleft'}).addTo(map);
map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet</a>');
map.attributionControl.addAttribution('<a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth · 1:50m</a>');
map.createPane('country-labels');map.getPane('country-labels').style.zIndex=450;map.getPane('country-labels').style.pointerEvents='none';
const labelLayer=L.layerGroup().addTo(map);
function countryStyle(feature){const name=countryNames[feature.properties.code],highlight=name&&name===$('#country').value;return {color:highlight?'#d6f28a':name?'#77936b':'#354c47',weight:highlight?2:1,fillColor:highlight?'#829659':name?'#344c36':'#182c29',fillOpacity:map.hasLayer(roads)?0.05:highlight?0.85:0.75}}
const roads=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',updateWhenIdle:true,keepBuffer:1});
const boundaries=L.geoJSON(REGION_GEOMETRY,{style:countryStyle,onEachFeature(feature,layer){
  const name=countryNames[feature.properties.code];if(!name)return;
  countryLayers.set(name,layer);
  layer.bindTooltip(name+' · '+countryCounts[name]+' local'+(countryCounts[name]===1?'':'is'),{sticky:true,className:'atlas-tooltip'});
  layer.on('click',()=>selectRegion(name));
  layer.on('mouseover',()=>layer.setStyle({weight:2,color:'#d6f28a'}));layer.on('mouseout',()=>layer.setStyle(countryStyle(feature)));
  const centre=layer.getBounds().getCenter();L.marker(centre,{pane:'country-labels',interactive:false,keyboard:false,icon:L.divIcon({className:'country-label',html:name,iconSize:[100,20],iconAnchor:[50,10]})}).addTo(labelLayer);
}}).addTo(map);
for(const [name,layer]of countryLayers){const element=layer.getElement();if(element){element.dataset.country=name;element.setAttribute('tabindex','0');element.setAttribute('role','button');element.setAttribute('aria-label','Explorar '+name);element.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectRegion(name)}}}}
map.on('zoomend',()=>{if(map.getZoom()>7&&map.hasLayer(labelLayer))map.removeLayer(labelLayer);else if(map.getZoom()<=7&&countryLabelsVisible&&!map.hasLayer(labelLayer))map.addLayer(labelLayer)});
roads.on('tileerror',()=>{if(++roadErrors>=3){setBase(false);$('#map-status').textContent='Cartografia online indisponível. O atlas local continua a funcionar.'}});
function setBase(online){if(online){roadErrors=0;roads.addTo(map);roads.bringToBack()}else if(map.hasLayer(roads))map.removeLayer(roads);$('#atlas-local').classList.toggle('active',!online);$('#atlas-roads').classList.toggle('active',online);$('#atlas-local').setAttribute('aria-pressed',String(!online));$('#atlas-roads').setAttribute('aria-pressed',String(online));boundaries.setStyle(countryStyle);$('#map-status').textContent=online?'OpenStreetMap · cartografia online · pontos aproximados':'Atlas local · pontos aproximados · arraste para explorar'}
$('#atlas-local').onclick=()=>setBase(false);$('#atlas-roads').onclick=()=>setBase(true);
function fitResults(){const visible=visibleSites();if(visible.length)map.fitBounds(L.latLngBounds(visible.map(site=>[site.lat,site.lon])),{padding:[50,65],maxZoom:visible.length===1?8:7,animate:false});}
$('#map-fit').onclick=fitResults;
function selectRegion(name){$('#country').value=name;$('#search').value='';$('#terrain').value='';render();const layer=countryLayers.get(name);if(layer)map.fitBounds(layer.getBounds(),{padding:[35,55],maxZoom:7,animate:false});$('#explore').scrollIntoView({behavior:'smooth',block:'start'})}
document.querySelectorAll('[data-region]').forEach(button=>button.onclick=()=>{if(button.dataset.region)selectRegion(button.dataset.region);else{resetAtlasFilters();$('#explore').scrollIntoView({behavior:'smooth'})}});
function resetAtlasFilters(){$('#country').value='';$('#search').value='';$('#terrain').value='';render();fitResults()}
window.resetAtlasFilters=resetAtlasFilters;$('#reset-filters').onclick=resetAtlasFilters;
$('#country-labels').onchange=event=>{countryLabelsVisible=event.target.checked;if(countryLabelsVisible&&map.getZoom()<=7)map.addLayer(labelLayer);else map.removeLayer(labelLayer)};
$('#map-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await mapHost.requestFullscreen()}catch{notify('O navegador não permite ecrã inteiro. Pode ampliar com os controlos do mapa.')}};
document.addEventListener('fullscreenchange',()=>map.invalidateSize());
function markerIcon(site){const active=site===selected,inCompare=shortlist.includes(site.id);return L.divIcon({className:'atlas-marker'+(active?' current':'')+(inCompare?' in-comparison':''),html:`<span class="map-point" aria-hidden="true">${inCompare?'✓':''}</span>`,iconSize:[28,28],iconAnchor:[14,14],popupAnchor:[0,-10]})}
function popupContent(site){const root=document.createElement('div');root.className='atlas-popup';root.innerHTML=`<small>${site.country} / ${categories[site.category]}</small><h3>${site.name}</h3><p>${site.lat.toFixed(2)}°, ${site.lon.toFixed(2)}° · ponto aproximado</p><p>Índice topográfico provisório: ${score(site)??'—'} / 100</p><p>${site.source?'Fonte descritiva disponível':'Candidato conceptual por documentar'} · analogia por validar</p>`;const open=document.createElement('button');open.textContent='Abrir ficha ↗';open.onclick=()=>{selected=site;render();$('#comparison').scrollIntoView({behavior:'smooth',block:'start'})};const compare=document.createElement('button');compare.textContent=shortlist.includes(site.id)?'Retirar da comparação':'＋ Comparar';compare.onclick=()=>toggleShortlist(site.id);root.append(open,compare);return root}
function syncAtlas(visible){
  if(!visible.length){answerVersion++;answerRecord=null;currentEvidenceKey='';$('#ask').disabled=true;$('#answer').textContent='Não há locais com estes filtros. Limpe os filtros para voltar a perguntar à IA.';$('#answer-context').textContent='Sem local selecionado';}
  const visibleIds=new Set(visible.map(site=>site.id));
  for(const [id,marker]of markers)if(!visibleIds.has(id)){map.removeLayer(marker);markers.delete(id)}
  for(const site of visible){let marker=markers.get(site.id);if(!marker){marker=L.marker([site.lat,site.lon],{title:site.name+' · '+site.country,alt:'Selecionar '+site.name,keyboard:true,icon:markerIcon(site),riseOnHover:true}).addTo(map);marker.on('click',()=>{selected=site;render();marker.openPopup()});markers.set(site.id,marker)}marker.setIcon(markerIcon(site));marker.setZIndexOffset(site===selected?1000:shortlist.includes(site.id)?500:0);marker.getElement().dataset.siteId=site.id;marker.getElement().setAttribute('aria-label','Selecionar '+site.name+' · '+site.country);if(marker.getPopup())marker.setPopupContent(popupContent(site));else marker.bindPopup(popupContent(site));}
  boundaries.setStyle(countryStyle);
  const filterKey=[$('#country').value,$('#terrain').value,$('#search').value].join(':');
  if(filterKey!==lastFilters){if(visible.length)fitResults();lastFilters=filterKey}else if(selected.id!==lastSelected&&visible.length)map.panTo([selected.lat,selected.lon],{animate:false});
  lastSelected=selected.id;
  for(const site of visible){const element=markers.get(site.id).getElement();element.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selected=site;render();markers.get(site.id)?.openPopup()}};}
  document.querySelectorAll('[data-region]').forEach(button=>button.classList.toggle('region-selected',button.dataset.region===$('#country').value));
  updateShortlist();
  if(visible.length&&selected.source){const box=$('.evidence-box ul');box.replaceChildren();const item=document.createElement('li');item.textContent=selected.source.fact;const link=document.createElement('a');link.href=selected.source.url;link.target='_blank';link.rel='noreferrer';link.textContent=selected.source.title+' ↗';const row=document.createElement('li');row.append(link);box.append(item,row);const paragraph=$('#comparison .world-empty')?.parentElement.querySelector('figcaption');if(paragraph){const text=document.createElement('p');text.textContent='Fonte descritiva disponível; imagem local e medições ainda não importadas.';paragraph.append(text)}}
}
window.syncAtlas=syncAtlas;
function toggleShortlist(id){
  if(!sites.some(site=>site.id===id))return;
  if(shortlist.includes(id))shortlist=shortlist.filter(value=>value!==id);else if(shortlist.length>=3){notify('Pode comparar até 3 locais. Retire um para adicionar outro.');return}else shortlist.push(id);
  try{localStorage.setItem('africa-analogs-shortlist',JSON.stringify(shortlist))}catch{}
  render();
}
window.toggleShortlist=toggleShortlist;
function updateShortlist(){
  document.querySelectorAll('[data-compare-id]').forEach(button=>{const added=shortlist.includes(button.dataset.compareId);button.classList.toggle('added',added);button.textContent=added?'✓':'＋';button.setAttribute('aria-pressed',String(added));button.title=added?'Retirar da comparação':'Adicionar à comparação'});
  if($('#detail-compare'))$('#detail-compare').textContent=shortlist.includes(selected.id)?'✓ Retirar da comparação':'＋ Comparar este local';
  const list=shortlist.map(id=>sites.find(site=>site.id===id));
  compareSection.innerHTML=`<div class="compare-tray-head"><div><small>A SUA SELEÇÃO / ${list.length} DE 3</small><h2>Compare paisagens africanas.</h2><p>Use o botão ＋ na lista ou nos marcadores. Os pesos e o destino escolhidos atualizam esta comparação.</p></div><div><button id="compare-clear" ${list.length?'':'disabled'}>Limpar</button><button id="compare-export" ${list.length?'':'disabled'}>↓ Exportar seleção</button></div></div>${list.length?`<div class="shortlist-grid">${list.map(site=>`<article class="shortlist-card"><div class="shortlist-top"><small>${site.country}</small><button data-remove-id="${site.id}" aria-label="Remover ${site.name}">×</button></div><h3>${site.name}</h3><p>${site.type}</p><div class="shortlist-score">${score(site)??'—'} <small>/ 100 · ${target==='Mars'?'Marte':'Lua'} · provisório</small></div>${criteria.map((criterion,i)=>`<div class="shortlist-metric"><span>${criterion}</span><b>${scientificDisplay(componentScores(site)[i],0)}</b><i style="--value:${componentScores(site)[i]??0}%"></i></div>`).join('')}<p>${site.why}</p><button data-open-id="${site.id}">Selecionar no mapa ↗</button></article>`).join('')}${Array.from({length:3-list.length},()=>'<div class="shortlist-placeholder"><span>＋</span>Escolha outro local<br>para comparar</div>').join('')}</div>`:'<div class="shortlist-empty">Comece por <button id="compare-mozambique">comparar Bazaruto e Chimanimani</button>, dois locais de Moçambique com paisagens diferentes.</div>'}<p class="data-caveat">Cálculos derivados de DEMs regionais. Intervalos sobrepostos não estabelecem superioridade; equivalência científica e operações não estão validadas.</p>`;
  $('#compare-clear').onclick=()=>{shortlist=[];try{localStorage.removeItem('africa-analogs-shortlist')}catch{}render()};
  $('#compare-export').onclick=()=>download('africa-analogs-selecao.geojson',JSON.stringify({type:'FeatureCollection',features:list.map(geoFeature)},null,2),'application/geo+json');
  document.querySelectorAll('[data-remove-id]').forEach(button=>button.onclick=()=>toggleShortlist(button.dataset.removeId));
  document.querySelectorAll('[data-open-id]').forEach(button=>button.onclick=()=>{const site=sites.find(site=>site.id===button.dataset.openId);$('#country').value='';$('#search').value='';$('#terrain').value='';selected=site;render();map.setView([site.lat,site.lon],7,{animate:false});$('#explore').scrollIntoView({behavior:'smooth'})});
  if($('#compare-mozambique'))$('#compare-mozambique').onclick=()=>{shortlist=['bazaruto','chimanimani'];try{localStorage.setItem('africa-analogs-shortlist',JSON.stringify(shortlist))}catch{}render();compareSection.scrollIntoView({behavior:'smooth',block:'start'})};
}
const renderBeforeAtlas=render;render=function(){renderBeforeAtlas();syncAtlas(visibleSites())};
// An empty result invalidates pending AI answers and prevents hidden context use.
const chatSubmitBeforeAtlas=$('#chat').onsubmit;
$('#chat').onsubmit=event=>{if(!visibleSites().length){event.preventDefault();notify('Selecione um local antes de perguntar à IA.');return}return chatSubmitBeforeAtlas(event)};
window.addEventListener('resize',()=>map.invalidateSize());
window.atlasReady=true;
render();fitResults();
