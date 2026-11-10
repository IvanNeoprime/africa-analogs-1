# Africa Analogs

## Deploy na Vercel

Importe o repositório `mundinho/africa-analogs` na Vercel. `vercel.json` define o build `npm run build:vercel`, os assets estáticos em `dist/public` e a função Node `api/chat.js` (60 s). A API conserva o cálculo científico e a integração Nemotron do Worker existente. Defina `NVIDIA_API_KEY` e, opcionalmente, `NEMOTRON_MODEL` nas variáveis de ambiente do servidor Vercel e faça redeploy. Sem chave, o site continua funcional e o assistente usa a síntese local identificada. Nunca coloque a chave no frontend ou em variáveis públicas. `.env` e caches estão excluídos do upload. Para validar localmente: `npm run build:vercel` e `npm run test:vercel`.

A interface inclui navegação persistente Explorar → Dados reais → Imagens → Explicar, três casos de investigação prontos a abrir, guia **Como começar?** e resumo da seleção atual. Direção visual documentada em [docs/design-system.md](docs/design-system.md). `npm run test:design` verifica os novos fluxos e o layout móvel com o servidor ativo.

## NASA

O mapa tem a camada opcional **NASA · satélite**, com imagens MODIS Terra/Aqua via NASA Earthdata GIBS, escolha de data e créditos. Requer Internet; não exige chave de API. Os períodos suportados e a matriz WMTS são obtidos do catálogo oficial e preservados em `science/data/nasa-gibs.json`, com URL e SHA-256. A data inicial é histórica (2024-06-15), não é uma alegação de imagem atual. Nuvens, lacunas e ausência de cobertura são possíveis. Falhas de carregamento regressam ao atlas local. Zoom acima do nível 9 só amplia a imagem existente.

O painel **NASA / Dados com proveniência** mostra as missões MOLA/LOLA e séries mensais NASA POWER de temperatura e precipitação para o local selecionado, com exportação JSON e link para a resposta original. Climatologia não é previsão do tempo. Imagens GIBS são visualizações de contexto e não valores quantitativos de refletância; não entram no índice topográfico, tal como o clima. O DEM terrestre continua a ser Copernicus GLO-90 (europeu), explicitamente identificado.

Atualize o catálogo com `node science/download-nasa-catalog.mjs AAAA-MM-DD`, indicando a data de verificação, e reconstrua o projeto. `npm run nasa:check` descarrega dois mosaicos reais e regista formato, URLs e hashes em `outputs/nasa-live-check.json`. Depois, `npm run test:nasa` verifica interface/proveniência/fallback com a imagem de teste em `outputs/nasa-sample.jpg`. As requisições da suíte de interface usam esse fixture para serem repetíveis e não certificam a cobertura de todas as imagens.

Protótipo em português baseado em Africa_Analogs_Proposta.pdf. Sem dependências de execução; Node 22+ para desenvolvimento.

Execute `node build.mjs` e `node serve.mjs`. Abra http://localhost:4173.

## Testes

Com o servidor ativo e as dependências de desenvolvimento instaladas (`npm install`), execute `npm test` ou `node test.mjs`; os controlos numéricos adicionais correm com `npm run test:science`. A suíte usa Playwright e o Edge instalado no caminho Windows definido no teste. Os 46 cenários verificam interface, catálogo SADC, países e marcadores por teclado, filtros combinados, pesos, comparação de até três locais, galeria, cortina, ampliação, pares guardados, persistência, exportações, recursos locais sem rede externa, layout móvel e validação da API. A integração Nemotron na suíte usa um transporte simulado; não faz chamadas reais. Capturas ficam em `outputs/`.

O catálogo contém 18 candidatos em 16 países da SADC e posições aproximadas. As pontuações sintéticas foram removidas: o índice topográfico provisório deriva de Copernicus GLO-90, MOLA e LOLA efetivamente processados. Há seis referências planetárias. Geologia Macrostrat/USGS e clima NASA POWER são importados como contexto, sem pontuação de equivalência. KML para UgCS não é rota de voo. Consulte [o fluxo científico](science/README.md).

## Atlas SADC e comparação de locais

O mapa Leaflet permite arrastar, ampliar, abrir marcadores, filtrar pelos países clicáveis e usar ecrã inteiro. O atlas padrão usa os limites Natural Earth 1:50m incluídos no build; não exige ligações externas. A camada opcional **Ruas · online** carrega mosaicos OpenStreetMap só quando selecionada, mantém os créditos e regressa ao atlas local em caso de falha. Não há download em massa ou cache de mapas offline. Os pontos do catálogo são referências regionais aproximadas, não limites nem coordenadas de navegação.

`catalog.json` é a fonte dos locais, categorias, hipóteses, lacunas e referências descritivas. Inclui Bazaruto e Chimanimani (Moçambique), Iona (Angola), Matobo (Zimbabwe), Kafue (Zâmbia), Mulanje (Malawi), Ol Doinyo Lengai (Tanzânia), Bemaraha (Madagáscar), Trou aux Cerfs (Maurícia), Aldabra (Seicheles), Karthala (Comores), Nyiragongo (RD Congo) e Sibebe (Eswatini), além dos cinco exemplos iniciais. As referências documentam características geográficas, não validam analogia planetária. Ambientes húmidos, costeiros e carbonatados são apresentados com diferenças explícitas; os exemplos vulcânicos são hipóteses de observação remota.

O botão **＋** guarda até três locais para comparar atributos topográficos reais lado a lado, com os pesos e destino atuais. A seleção é guardada apenas no navegador em localStorage e pode ser limpa ou exportada como GeoJSON. Os filtros não apagam a seleção comparativa. O atalho **comparar Bazaruto e Chimanimani** prepara uma comparação de Moçambique.

`download-regional-map.mjs` permite atualizar o recorte Natural Earth e confirma as geometrias dos 16 países. Os pequenos estados insulares estão incluídos. O Leaflet e a respetiva licença são incorporados no build; execute `npm install` antes de construir numa nova máquina.

## Demonstração para o hackathon

Na página inicial, clique em **Explorar este caso** ou **Apresentação guiada · 4 passos**. O caso Namibe–Marte apresenta uma imagem orbital terrestre SeaHawk/HawkEye e um mosaico de superfície Curiosity/Mastcam. A referência lunar usa LROC NAC na Bacia Apollo. Todas têm fontes, créditos e limitações visíveis; não estão alinhadas nem na mesma escala.

`evidence.json` mantém as três fichas iniciais, também presentes em `gallery.json`. As imagens foram descarregadas de páginas oficiais NASA e ficam em `assets/`. O build incorpora os recursos no Worker, sem depender de imagens remotas durante a apresentação. A IA recebe as fichas das imagens efetivamente selecionadas, a pergunta de investigação e os pesos; o índice topográfico é recalculado no servidor a partir dos atributos reais. Ainda não existe pesquisa automática em artigos, navegação ou interpretação visual por IA.

## Laboratório visual

O botão **Laboratório de imagens** abre um comparador com 19 fotografias documentadas: 12 da Terra em nove regiões, quatro de Marte e três da Lua. Há fotografias de Bazaruto e Chimanimani, além de Namibe, Etosha, Ntwetwe/Makgadikgadi, Kafue, Bemaraha, Aldabra e Nyiragongo. Cada imagem tem fonte, contexto, instrumento quando conhecido e limitações. Os locais sem imagem continuam sem fotografia; a galeria permite mudar explicitamente para outra região, sincronizando o mapa.

Pode escolher fotografias nos menus e miniaturas, navegar entre vistas da mesma região, alternar Marte/Lua, usar vista lado a lado ou cortina deslizante, ampliar em conjunto e arrastar as imagens. A ampliação modal permite navegação e zoom próprios, com fecho por Escape. Os pares de comparação podem ser guardados (até seis, apenas em localStorage) e restaurados. A exportação JSON de fontes e a ficha de investigação incluem as imagens atuais. Mudar de fotografia invalida respostas antigas da IA.

As vistas não têm alinhamento geográfico nem escala comum: a cortina é uma ferramenta de exploração visual, não uma sobreposição científica registada. As pontuações não são calculadas a partir das fotografias. A IA recebe metadados e resumos documentais, não os píxeis. A API valida se a imagem terrestre pertence ao local e se a referência corresponde ao destino selecionado.

`gallery-seeds.json` descreve as fontes de aquisição; `download-gallery.mjs` descarrega as imagens e `gallery.json` guarda o catálogo resultante. Use `node download-gallery.mjs --refresh` para atualizar as aquisições. `optimise-gallery.mjs` usa Sharp para limitar o lado maior a 1800 píxeis, preservando a proporção e sem ampliar artificialmente, recortar ou gerar conteúdo por IA. As dimensões originais e de apresentação ficam nos metadados. Os ficheiros são cópias de apresentação, não rasters científicos.

A ficha de investigação exportável inclui fontes, critérios, limitações, próximos passos e a resposta da IA apenas quando corresponde à seleção atual. Candidatos sem documentação local não mostram a fotografia do Namibe como se fosse desse local. As respostas pendentes são descartadas quando a seleção muda.

As perguntas de investigação ajustam os pesos para demonstrar a metodologia. Esses pesos são escolhas de interface, não calibração científica. O par Namibe–Lua é explicitamente um contraste, sem alegação de analogia eólica.

## Nemotron

O endpoint `/api/chat` chama NVIDIA NIM quando `NVIDIA_API_KEY` está definida no ambiente do servidor. O modelo padrão é `nvidia/nemotron-3.5-lightning-30b-a3b`; `NEMOTRON_MODEL` permite alterá-lo. Localmente, copie `.env.example` para `.env`, preencha a chave e reinicie `node serve.mjs`. O servidor carrega `.env` automaticamente. Chaves ficam no servidor. Sem chave, o endpoint devolve uma síntese determinística claramente identificada como demonstração. Esta síntese não responde livremente a perguntas. A chamada usa `stream:false` e `enable_thinking:false` para devolver apenas a resposta final em JSON, compatível com a interface atual. Não há RAG científico implementado. Na hospedagem, configure as variáveis através dos segredos/variáveis do Site; não inclua chaves no repositório.

## Validação científica pendente

Importação dos DEMs, proveniência, atributos regionais e análise de sensibilidade implementadas. O painel mostra bootstrap espacial P5–P95, variação de escala e deslocamento da ROI. Estes intervalos não abrangem todos os erros sistemáticos nem representam probabilidades de equivalência. A hipótese científica continua sem validação por especialistas ou em campo; ver [VALIDATION.md](science/VALIDATION.md). MOLA/LOLA não devem ser sobrepostos diretamente a coordenadas terrestres.

Fontes: https://jmars.mars.asu.edu/numeric-maps ; https://mars.asu.edu/data/ ; https://pds-geosciences.wustl.edu/missions/lro/lola.htm ; https://manuals-ugcs.sphengineering.com/docs/importing-routes ; https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
