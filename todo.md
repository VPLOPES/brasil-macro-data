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
