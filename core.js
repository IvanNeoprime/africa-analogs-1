const sites=CATALOG;
let selected=sites[0],target='Mars',weights=[34,33,33,0];
const criteria=['Relevo relativo','Declive regional','Irregularidade regional','Geologia (qualitativa)'];
const $=selector=>document.querySelector(selector);
const normalise=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const score=site=>{const value=scientificComparison(site).index;return finiteValue(value)?Math.round(value):null};
const categories={dunes:'Dunas',salt:'Salinas',rock:'Terrenos rochosos',sediments:'Sedimentos',volcanic:'Vulcanismo'};
function visibleSites(){
  const query=normalise($('#search').value),country=$('#country').value,category=$('#terrain')?.value||'';
  return sites.filter(site=>(!country||site.country===country)&&(!category||site.category===category)&&normalise(site.name+' '+site.country+' '+site.type).includes(query))
    .sort((a,b)=>(score(b)??-1)-(score(a)??-1)||a.name.localeCompare(b.name,'pt'));
}
$('#country').replaceChildren(new Option('Toda a SADC',''),...[...new Set(sites.map(s=>s.country))].sort((a,b)=>a.localeCompare(b,'pt')).map(country=>new Option(country,country)));
$('#country').insertAdjacentHTML('afterend',`<label for="terrain">Tipo de paisagem</label><select id="terrain"><option value="">Todas as paisagens</option>${Object.entries(categories).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select>`);
function render(){
  const visible=visibleSites();
  if(visible.length&&!visible.includes(selected))selected=visible[0];
  $('#count').textContent=String(visible.length).padStart(2,'0');
  $('#sites').replaceChildren();
  for(const site of visible){
    const row=document.createElement('div');row.className='site-row';
    const button=document.createElement('button');button.className='site'+(selected===site?' selected':'');button.dataset.selectId=site.id;button.setAttribute('aria-pressed',String(selected===site));
    button.innerHTML=`<b>${score(site)??'—'}<small> /100</small></b><strong>${site.name}</strong><span>${site.country} · ${categories[site.category]}</span>`;
    button.onclick=()=>{selected=site;render()};
    const compare=document.createElement('button');compare.className='compare-toggle';compare.dataset.compareId=site.id;compare.title='Adicionar à comparação';compare.setAttribute('aria-label','Comparar '+site.name);compare.textContent='＋';compare.onclick=()=>window.toggleShortlist?.(site.id);
    row.append(button,compare);$('#sites').append(row);
  }
  if(!visible.length){
    $('#sites').innerHTML='<p class="empty">Nenhum local com estes filtros. Experimente outro país ou tipo de paisagem.</p><button id="empty-reset">Limpar filtros</button>';
    $('#empty-reset').onclick=()=>window.resetAtlasFilters?.();
    $('#detail').innerHTML='<h2>Sem resultados</h2><p class="sub">Altere os filtros para descobrir outros locais da SADC.</p>';
  }else renderDetail();
  $('#formula').textContent=weights.some(Boolean)?`S = Σ(peso × similaridade) / Σ(pesos) · soma: ${weights.reduce((a,b)=>a+b,0)}. Só critérios medidos; consulte os intervalos de sensibilidade.`:'Defina pelo menos um peso maior que zero para calcular a pontuação.';
  if(window.atlasReady)window.syncAtlas?.(visible);
}
function renderDetail(){
  const site=selected,values=componentScores(site);
  $('#detail').innerHTML=`<div><div class="eyebrow">CANDIDATO EXPLORATÓRIO / ${target==='Mars'?'MARTE':'LUA'}</div><h2>${site.name}</h2><div class="sub">${site.country}<br>${site.lat.toFixed(2)}°, ${site.lon.toFixed(2)}° · posição aproximada</div><div class="scorebox"><div class="ring">${score(site)??'—'}</div><div><p>Triagem regional provisória</p><small>ÍNDICE TOPOGRÁFICO / 100</small></div></div></div><div>${criteria.map((criterion,i)=>`<div class="metric"><div><span>${criterion}</span><span>${values[i]===null?'sem pontuação':scientificDisplay(values[i],0)+' / 100'}</span></div><section class="bar"><i style="width:${values[i]??0}%"></i></section></div>`).join('')}</div><div><div class="notice">DEM real a 4 km/célula, suavizado a 12 km. Não caracteriza dunas ou mobilidade de rover. Geologia qualitativa; equivalência por validar.</div><button class="primary" id="explain">Explorar relevância científica ↗</button><button id="detail-compare">＋ Comparar este local</button><button id="geo">↓ GeoJSON para QGIS</button><button id="kml">↓ Pontos KML para UgCS</button><button id="provenance">Fontes e limitações</button></div>`;
  $('#geo').onclick=exportGeo;$('#kml').onclick=exportKml;$('#detail-compare').onclick=()=>window.toggleShortlist?.(site.id);
  $('#explain').onclick=()=>{$('#question').value='Qual é o potencial científico deste local e quais são as limitações?';$('#chat').requestSubmit();$('#answer').scrollIntoView({behavior:'smooth',block:'center'})};
  $('#provenance').onclick=()=>{
    $('#sourcebody').innerHTML=`<p><b>${site.name}</b> · ${site.country}</p>${site.source?`<p>${site.source.fact}</p><p><a href="${site.source.url}" target="_blank" rel="noreferrer">${site.source.title} ↗</a></p>`:'<p>Exemplo do catálogo conceptual Africa Analogs. Consulte a comparação para as fichas disponíveis.</p>'}<p>A fonte descritiva não certifica analogia planetária. As posições são aproximadas. O índice é calculado a partir dos DEMs disponíveis, com critérios ausentes excluídos.</p><p>Sem data de aquisição ou resolução para o ponto do catálogo. Os DEMs MOLA/LOLA foram processados apenas nas ROIs e escalas declaradas.</p><p>Dados em falta: ${site.missing}</p><p>Referência planetária: <a href="${target==='Mars'?'https://mars.asu.edu/data/':'https://pds-geosciences.wustl.edu/missions/lro/lola.htm'}" target="_blank" rel="noreferrer">${target==='Mars'?'MOLA / ASU':'LOLA / PDS'} ↗</a>. QGIS e UgCS recebem ficheiros exportados; o KML não constitui uma rota de voo.</p>`;
    $('#sources').showModal();
  };
}
$('#weights').innerHTML=criteria.map((criterion,i)=>`<label>${criterion}<span id="w${i}">${weights[i]}</span><input type="range" min="0" max="100" value="${weights[i]}" data-i="${i}" aria-label="Peso: ${criterion}"></label>`).join('');
document.querySelectorAll('[data-i]').forEach(element=>element.oninput=()=>{weights[+element.dataset.i]=+element.value;$('#w'+element.dataset.i).textContent=element.value;render()});
document.querySelectorAll('[data-target]').forEach(button=>button.onclick=()=>{target=button.dataset.target;document.querySelectorAll('[data-target]').forEach(other=>other.classList.toggle('active',other===button));render()});
$('#search').oninput=render;$('#country').onchange=render;$('#terrain').onchange=render;$('#close').onclick=()=>$('#sources').close();
function notify(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').style.display='none',3500)}
function download(name,data,type){const anchor=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Ficheiro exportado · dados e proveniência')}
function geoFeature(site){return {type:'Feature',geometry:{type:'Point',coordinates:[site.lon,site.lat]},properties:{name:site.name,country:site.country,target,score:score(site),synthetic:false,analysis:scientificComparison(site),method:SCIENCE_DATA.method,coordinate_accuracy:'approximate',source:site.source?.url||'Africa Analogs conceptual proposal',acquired_at:SCIENCE_DATA.generated_at,resolution_m:4000,missing:site.missing,weights:Object.fromEntries(criteria.map((criterion,i)=>[criterion,weights[i]]))}}}
function exportGeo(){download('africa-analogs-'+selected.id+'.geojson',JSON.stringify({type:'FeatureCollection',features:[geoFeature(selected)]},null,2),'application/geo+json')}
function exportKml(){download('reconhecimento-'+selected.id+'.kml',`<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Africa Analogs — ponto de estudo</name><Placemark><name>${selected.name}</name><description>DEMO: coordenadas aproximadas. Ponto de interesse para revisão no UgCS; sem altitude nem rota operacional.</description><Point><altitudeMode>clampToGround</altitudeMode><coordinates>${selected.lon},${selected.lat},0</coordinates></Point></Placemark></Document></kml>`,'application/vnd.google-earth.kml+xml')}
render();
