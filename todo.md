# Brasil Macro Data - TODO

## Estrutura Base
- [x] Schema do banco de dados (indicadores, séries temporais, cache)
- [x] Configuração de tema visual (dark mode, cores profissionais)
- [x] Layout principal com navegação

## Coleta de Dados
- [x] Serviço de integração com API BCB (SELIC, CDI, IGP-M, Câmbio)
- [x] Serviço de integração com API IBGE/SIDRA (IPCA, INPC, PIB, Desemprego)
- [x] Sistema de cache inteligente para dados
- [x] Serviço de coleta do Boletim Focus

## Dashboard Principal
- [x] Cards de indicadores em tempo real
- [x] Indicadores: IPCA, SELIC, PIB, Câmbio USD/EUR
- [x] Indicadores: Desemprego, Produção Industrial, Vendas Varejo
- [x] Atualização automática dos dados

## Visualizações
- [x] Gráficos de séries temporais interativos
- [x] Comparativos históricos entre indicadores
- [x] Tabelas de dados com filtros
- [ ] Matriz de calor (heatmap) mensal

## Calculadora de Correção Monetária
- [x] Interface da calculadora
- [x] Cálculo para IPCA, IGP-M, SELIC, CDI, INPC
- [x] Correção e descapitalização de valores
- [ ] Histórico de cálculos (requer persistência)

## Painel Focus (Expectativas)
- [x] Exibição de projeções do mercado
- [x] Comparativo entre anos de referência
- [ ] Histórico de revisões das expectativas

## Exportação e API
- [x] Exportação CSV dos dados
- [x] API REST documentada para empresas
- [x] Página de documentação da API com planos
- [ ] Exportação Excel
- [ ] Sistema de autenticação para API (chaves)

## Alertas e Notificações
- [x] Configuração de alertas por indicador
- [x] Painel de gestão de alertas
- [ ] Notificações por email (requer integração)

## Conjuntura Macroeconômica
- [x] Painel fiscal (Dívida, Resultado Primário/Nominal)
- [x] Setor externo (Balança Comercial, Transações Correntes)
- [x] IBC-Br (proxy mensal do PIB)

## Testes
- [x] Testes automatizados para routers
- [x] Validação de inputs da calculadora

## Notícias Econômicas
- [x] Seção de notícias econômicas no dashboard
- [x] Serviço de busca de notícias
- [x] Componente de exibição de notícias

## Expansão - Mercados Globais e Calendário
- [x] Cotações de bolsas globais em tempo real (Ibovespa, Dow Jones, S&P 500, Nasdaq, DAX, etc.)
- [x] Calendário econômico com eventos importantes dos mercados
- [x] Página dedicada de Mercados

## Expansão - Feed RSS e Notícias
- [x] Integração com feeds RSS reais de notícias econômicas (InfoMoney)
- [x] Atualização automática de notícias em tempo real

## Expansão - Novas Integrações de APIs
- [x] IPEADATA - dados históricos econômicos e sociais
- [x] SIDRA API (IBGE) - sistema de recuperação automática
- [x] BCB API - integração completa
- [x] BrasilAPI - endpoints modernos com CDN
- [x] FRED API - Federal Reserve para comparações internacionais
- [x] API do Tesouro Nacional - dados fiscais
- [x] CAGED/MTE - dados de emprego formal

## Página de Dados
- [x] Aba Fiscal - Dados do Tesouro Nacional
- [x] Aba Emprego - Dados do CAGED/MTE
- [x] Aba Internacional - Dados do FRED (EUA)
- [x] Aba Taxas - Taxas de juros via BrasilAPI
