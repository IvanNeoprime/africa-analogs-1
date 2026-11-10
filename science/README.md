# Dados reais regionais

O snapshot `data/analysis.json` tem DEMs para 18 locais e seis referências planetárias, com recortes, atributos, fontes e hashes. Não certifica equivalência planetária. Fotografias são contexto visual e não geram estes índices.

## Produtos e processamento

- Terra: Copernicus DEM GLO-90 público via AWS, GeoTIFF WGS84, alturas ortométricas EGM2008. DSM com vegetação e infraestrutura. Respeita PixelIsPoint/PixelIsArea e agrega os centros dos píxeis nativos numa aproximação tangente esférica.
- Marte: MOLA MEGDR `megt90n000eb.img`, 16 pix/°, int16 big-endian, metros acima do areoide. `megc90n000eb.img` fornece contagens; a fração reportada refere-se aos bins amostrados no contexto de 80 km, não à cobertura observada de toda a ROI. Bins vazios podem ser interpolados.
- Lua: LOLA `ldem_16.img`, 16 pix/°, int16 little-endian, escala 0,5 m. Altura relativa à esfera de raio 1737400 m; não se adiciona esse raio à altura. Cobertura de retornos da versão coincidente não importada.
- Geologia: Macrostrat CC-BY 4.0 e referências originais, Tanaka et al. 2014/USGS (Marte, 1:20M), Fortezzo et al. 2020/USGS (Lua, 1:5M). Interseção no centro da ROI, com CRS planetários próprios. Não mede mineralogia nem inventaria toda a ROI.
- Clima: NASA POWER/MERRA-2, temperatura e precipitação médias climatológicas, período devolvido pela API (snapshot 2001–2025). Reanálise regional, não medição local. Sem climatologia planetária comparável; sem pontuação. Precipitação não é aridez.

Referências em `references.json`: Gale/Bagnold, Eberswalde, Olympus, Apollo, Tycho e Aristarchus. ROIs regionais aproximadas, não footprints das fotografias. A fotografia de gelo marciano sem ROI fiável fica sem índice.

ROI de 64 × 64 km, grelha comum de 4 km, filtro 3×3 (~12 km). A grelha não implica resolução efetiva de 4 km. Atributos: relevo P95−P5, declive mediano por diferenças centrais e RMS do resíduo face à média dos oito vizinhos. Não comparam altitudes absolutas de datums diferentes nem resolvem dunas ou mobilidade de rover.

Índice por atributo: `100*(min(a,b)+t)/(max(a,b)+t)`, regularização de 10 m, 0,05° e 1 m. Constantes e pesos são escolhas explícitas sem calibração científica. Média ponderada só de critérios quantitativos disponíveis; geologia qualitativa fica sem pontuação. Peso só na geologia ou todos os pesos a zero deixam o índice indisponível.

160 réplicas de bootstrap espacial em blocos de 16 km produzem P5–P95 descritivo. Também se calcula a mudança ao reamostrar para 8 km e ao deslocar a ROI ±4 km. Não são intervalos de confiança nem probabilidades de equivalência e não abrangem todos os erros sistemáticos. ROIs com >30% de células niveladas a zero ficam sem índice até existir máscara de água validada (Bazaruto e Aldabra). É uma regra operacional conservadora, não classificação hidrológica validada.

## QGIS / JMARS

O painel **Dados reais** exporta ZIP com ASCII Grid/PRJ terrestre e planetário, recorte planetário nativo, CSV e metadados. Abra cada `.asc` no QGIS mantendo o `.prj` homónimo na pasta. Cada corpo tem o seu CRS; nunca atribuir EPSG:4326 terrestre a Marte/Lua. Não sobrepor mundos como se partilhassem coordenadas.

No JMARS, escolha o corpo correto e importe `native-jmars-west.csv` na Shape Layer com longitude positiva a Oeste. Adicione o mapa numérico MOLA ou LOLA compatível a 16 pix/°, exporte as alturas pelo [Pixel Export](https://jmars.mars.asu.edu/pixel-export) e reimporte o CSV no protótipo. Indique longitude, metros/quilómetros e amostragem efetiva. A comparação apresenta RMSE, viés, erro P95 e pontos fora do recorte. Tolerância de 1 m/0,5 m refere-se à quantização/concordância, não à acurácia do terreno. Concordância não autentica origem JMARS. O roundtrip automatizado usa CSV do próprio exportador; **passagem no JMARS e QGIS desktop pendente**.

## Reproduzir

```powershell
npm run science:download
npm run science:acquire
npm run science:export
npm run build
```

Primeira aquisição exige Internet. `.science-cache/` (ignorada no Git) guarda ~100 MB de PDS, tiles Copernicus e respostas dos serviços. Rótulos em `data/labels/`, SHA-256/URLs em `data/pds-provenance.json`, ROIs em `data/rois/`. `exports/` contém rasters/CSV gerados pelo CLI. Não editar medidas manualmente.

`npm run test:science` verifica planos analíticos, NoData, pesos, endian/escala e bytes PDS, bootstrap, CSV e ZIP. Exige cache PDS original e `tar` para leitura independente do ZIP. `npm test` verifica interface/API com Playwright/Edge e servidor ativo. O transporte NVIDIA dessa suíte é simulado. `outputs/science-validation.json` regista os resultados e hashes do código.

Ver [VALIDATION.md](VALIDATION.md): validação computacional e sensibilidade implementadas; **hipóteses científicas, especialistas e campo pendentes**. São necessários AOIs científicos, controlos independentes, calibração e erros sistemáticos antes de alegar adequação a uma missão.
