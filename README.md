# Africa Analogs

Protótipo em português baseado em Africa_Analogs_Proposta.pdf. Sem dependências de execução; Node 22+ para desenvolvimento.

Execute `node build.mjs` e `node serve.mjs`. Abra http://localhost:4173.

O catálogo contém cinco candidatos, posições aproximadas e similaridades sintéticas. Seleção Marte/Lua, pesquisa, filtros, pesos interativos, mapa esquemático acessível, exportação GeoJSON WGS84 para QGIS e ponto KML para revisão no UgCS. KML não é uma rota de voo. Nenhum raster MOLA/LOLA está incluído ou processado. JMARS e os arquivos planetários são referências externas.

## Nemotron

O endpoint `/api/chat` chama NVIDIA NIM quando `NVIDIA_API_KEY` e `NEMOTRON_MODEL` estão definidos no ambiente do servidor. Configure um identificador Nemotron disponível na sua conta NVIDIA. Chaves ficam no servidor. Sem configuração, o endpoint devolve uma síntese determinística claramente identificada como demonstração. Esta síntese não responde livremente a perguntas. Não há RAG científico implementado. Na hospedagem, configure as duas variáveis através dos segredos/variáveis do Site; não inclua chaves no repositório.

## Validação científica pendente

Importar e harmonizar DEMs reais, registar resolução/data/CRS, calcular atributos terrestres e planetários comparáveis, quantificar incerteza e validar com especialistas. MOLA/LOLA não devem ser sobrepostos diretamente a coordenadas terrestres.

Fontes: https://jmars.mars.asu.edu/numeric-maps ; https://mars.asu.edu/data/ ; https://pds-geosciences.wustl.edu/missions/lro/lola.htm ; https://manuals-ugcs.sphengineering.com/docs/importing-routes ; https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
