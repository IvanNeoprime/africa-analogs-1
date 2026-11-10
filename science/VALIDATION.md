# Estado de validação

O software calcula um índice descritivo de topografia regional a partir de DEMs reais. Não certifica equivalência planetária e não valida automaticamente a hipótese de que um local sirva para uma missão.

## Controlos computacionais

- Rótulos PDS preservados, dimensão dos produtos conferida e SHA-256 dos bytes registado.
- MOLA: int16 big-endian, metros sobre areoide. LOLA: int16 little-endian, fator 0,5 m; o offset 1737400 m é usado só para raio, nunca adicionado à altura.
- Copernicus GLO-90: GeoTIFF geográfico WGS84, DSM com vegetação e infraestrutura. Alturas ortométricas EGM2008 não são comparadas diretamente com altitudes planetárias.
- Grades a 4 km e filtro comum 3x3; ROI de 64 km e escala efetiva regional. Não medem dunas, rochas ou capacidade de deslocação de rover.
- Unidades geológicas por interseção no centro, respeitando os CRS planetários próprios dos serviços USGS. Não há equivalência mineralógica calculada entre taxonomias.
- Bootstrap espacial por blocos de 16 km, 160 réplicas: P5–P95 descritivo, não intervalo de confiança de equivalência. Sensibilidade adicional ao reamostrar para 8 km e ao deslocar a ROI ±4 km.
- A fração de amostras de contexto com bin contendo retornos MOLA é reportada; não significa que todo pixel do DEM tenha observação direta. A cobertura direta de LOLA da versão coincidente não foi quantificada.
- Bloqueio de índice para ROI com >30% de células niveladas a zero, até existir máscara de água validada. É uma regra de triagem conservadora, não uma classificação hidrológica validada.
- CSV do JMARS: latitude, convenção Este/Oeste, unidade e interpolação explícitas; comparação numérica com o recorte PDS. Concordância não autentica a origem do ficheiro nem toda a camada.

## Trabalho científico ainda necessário

1. Definir com investigadores uma pergunta e a escala operacional antes de selecionar variáveis ou pesos. Processos sedimentares, mobilidade e treino de operações requerem critérios diferentes.
2. Delimitar AOIs científicas em vez de centros regionais aproximados, verificar a ligação das fotografias às AOIs e harmonizar redes de controlo.
3. Validar água, vegetação e contactos geológicos; usar DTM e levantamentos de resolução apropriada quando necessário.
4. Comparar com levantamentos independentes e visitas de campo autorizadas. Usar separação espacial entre calibração e validação, com locais de controlo; evitar avaliar nos mesmos dados que definiram os pesos.
5. Calibrar regularização e pesos, verificar estabilidade a fontes alternativas e quantificar os erros sistemáticos de cada produto. Os intervalos atuais não cobrem toda essa incerteza.
6. Submeter o método e as hipóteses à revisão de especialistas. Registar decisão, responsável, data e evidências antes de marcar um candidato como validado.

**Estado atual:** controlos computacionais e análise de sensibilidade. **Revisão científica e validação em campo: pendentes.**
