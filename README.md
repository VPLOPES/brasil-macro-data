# 🇧🇷 Brasil Macro Data

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat&logo=mysql&logoColor=white)

**Plataforma de inteligência econômica e análise de dados financeiros brasileiros.**
Dashboard interativo • Correção Monetária • Projeções de Mercado (Focus) • API REST

[Ver Demo (Em breve)]() · [Reportar Bug](https://github.com/VPLOPES/brasil-macro-data/issues) · [Solicitar Feature](https://github.com/VPLOPES/brasil-macro-data/issues)

</div>

---

## 📋 Sobre o Projeto

**Brasil Macro Data** é uma solução *full-stack* desenvolvida para simplificar o acesso e a análise de indicadores econômicos complexos. Diferente de portais governamentais fragmentados, esta plataforma centraliza, normaliza e enriquece dados de múltiplas fontes oficiais (BCB, IBGE, etc.) em uma interface unificada e performática.

O projeto foi construído com foco em **Type-Safety End-to-End** (segurança de tipos de ponta a ponta), garantindo robustez desde a coleta dos dados no backend até a visualização no frontend.

### 🚀 Diferenciais
* **Centralização:** SELIC, IPCA, PIB e Câmbio em um único *data warehouse*.
* **Ferramentas Financeiras:** Calculadora integrada para correção de valores históricos.
* **Expectativas de Mercado:** Monitoramento visual das projeções do Boletim Focus.
* **Arquitetura Moderna:** SPA reativa com React 19 e backend otimizado com Drizzle ORM.

---

## ✨ Funcionalidades Principais

### 📊 Dashboard Macroeconômico
* **Indicadores em Tempo Real:** Acompanhamento de SELIC, CDI, Câmbio (USD/EUR) e Índices de Preços.
* **Visualização de Dados:** Gráficos interativos (Linha, Área, Comparativos) utilizando *Recharts*.
* **Séries Históricas:** Consulta profunda de dados retroativos com filtros de período.

### 🧮 Calculadora de Correção Monetária
* Correção de valores nominais por índices oficiais (IPCA, IGP-M, INPC).
* Atualização por taxas de juros (SELIC, CDI).
* Interface intuitiva para cálculos complexos de descapitalização e juros compostos.

### 🎯 Boletim Focus (Expectativas)
* Painel dedicado às projeções de mercado do Banco Central.
* Comparativo visual entre as metas anuais e as expectativas medianas.

### ⚙️ Engenharia de Dados
* **ETL Automatizado:** Rotinas de coleta e normalização de dados do BCB e SIDRA (IBGE).
* **Cache Inteligente:** Estratégias de cache para reduzir latência em consultas frequentes.
* **API Pública:** Endpoints documentados para integração com sistemas de terceiros.

---

## 🛠️ Stack Tecnológica

O projeto utiliza uma arquitetura moderna baseada no ecossistema JavaScript/TypeScript.

### Core & Backend
* **Runtime:** Node.js
* **Linguagem:** TypeScript (Strict Mode)
* **Framework:** Express
* **API Layer:** **tRPC** (Type-safe APIs)
* **Database:** MySQL
* **ORM:** **Drizzle ORM** (Alta performance e queries type-safe)
* **Validação:** Zod

### Frontend (Client)
* **Framework:** React 19 + Vite
* **Estilização:** Tailwind CSS v4 + Shadcn/UI
* **Gerenciamento de Estado:** TanStack Query (React Query)
* **Visualização:** Recharts
* **Animações:** Framer Motion

### DevOps & QA
* **Testes:** Vitest
* **Linting/Format:** ESLint, Prettier
* **Deploy:** Docker (Ready)

---

## 🚀 Como Executar

### Pré-requisitos
* Node.js >= 20
* pnpm (Recomendado)
* MySQL 8.0+

### Instalação

1.  **Clone o repositório**
    ```bash
    git clone [https://github.com/VPLOPES/brasil-macro-data.git](https://github.com/VPLOPES/brasil-macro-data.git)
    cd brasil-macro-data
    ```

2.  **Instale as dependências**
    ```bash
    pnpm install
    ```

3.  **Configuração de Ambiente**
    Crie um arquivo `.env` na raiz baseado no exemplo:
    ```env
    DATABASE_URL="mysql://usuario:senha@localhost:3306/macro_data"
    NODE_ENV="development"
    PORT=5000
    ```

4.  **Banco de Dados**
    Execute as migrações do Drizzle para configurar o schema:
    ```bash
    pnpm db:push
    ```

5.  **Inicie o projeto**
    ```bash
    # Modo Desenvolvimento (Client + Server)
    pnpm dev
    ```

A aplicação estará disponível em `http://localhost:5000` (ou porta configurada).

---

## 📂 Estrutura do Projeto

```text
brasil-macro-data/
├── client/                 # Frontend React (Vite)
│   ├── src/
│   │   ├── components/    # Componentes UI (Shadcn)
│   │   ├── pages/         # Rotas da aplicação
│   │   └── lib/           # Utilitários e hooks
│
├── server/                # Backend Node.js
│   ├── routes.ts          # Definição de rotas e tRPC procedures
│   ├── services/          # Integrações (BCB, IBGE)
│   └── storage.ts         # Camada de persistência
│
├── shared/                # Tipos compartilhados (Zod schemas)
│
├── drizzle/               # Schemas e migrações do banco
└── ...configs
