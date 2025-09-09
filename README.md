# Cypher's Edge: Plataforma de Análise de Performance em Jogos Competitivos

> Um ecossistema de análise de dados projetado para extrair insights táticos e de desempenho de múltiplos jogos competitivos, começando com Valorant e League of Legends.

<p align="center">
  <a href="https://valorant-frontend.onrender.com/">
    <img src="https://img.shields.io/badge/Acessar%20Aplicação-Online-brightgreen?style=for-the-badge&logo=rocket" alt="Link para a aplicação online">
  </a>
</p>

---

## 🎞️ Demonstração (GIF)

[Aqui você pode inserir um GIF da sua aplicação em funcionamento]

*(**Dica:** Use um programa como o `ScreenToGif` para gravar sua tela mostrando o fluxo completo: busca de um jogador do LoL -> salvar as 20 partidas -> ir para o laboratório -> rodar os modelos -> gerar o gráfico de features. Depois, arraste o arquivo .gif para esta seção no GitHub.)*

---

## 📑 Sobre o Projeto

O **Cypher's Edge** é uma plataforma web full-stack que serve como uma central para coleta, visualização e **análise preditiva** de dados de jogos. O núcleo do projeto é uma **pipeline de Machine Learning completa e automatizada**, com um escopo expandido para diferentes universos de jogos:

1.  **Módulo Valorant:** Utiliza um conjunto de dados simulados (`mock data`) como uma prova de conceito para o desenvolvimento rápido da interface e dos componentes de visualização.
2.  **Módulo League of Legends:** O coração científico do projeto. Integra-se diretamente com a **API oficial da Riot Games**, permitindo a coleta de dados reais, que são então processados por uma pipeline de ML para treinar modelos preditivos e extrair insights profundos sobre a performance do jogador.

O trabalho cumpre requisitos acadêmicos que incluem a implementação de um sistema híbrido (Interface Web + Scripts de ML), a validação de modelos com Validação Cruzada e a geração de resultados prontos para serem analisados em um artigo científico.

## ✨ Features Principais

#### Plataforma
-   **Arquitetura Multi-Jogo:** Estrutura de `features` que permite a fácil expansão para outros jogos no futuro.
-   **Navegação Unificada:** Uma interface coesa que permite ao usuário transitar entre os diferentes módulos de análise.

#### Módulo League of Legends (API Real & Machine Learning)
-   **Coleta de Dados em Lote:** Funcionalidade para buscar o histórico de um jogador e salvar dezenas de partidas no banco de dados com um único clique.
-   **Cache Inteligente:** Otimização no backend que verifica quais partidas já estão salvas para evitar requisições desnecessárias à API da Riot, respeitando os *rate limits*.
-   **Placar Detalhado:** Visualização completa dos detalhes de uma partida, incluindo KDA, itens e desempenho de cada um dos 10 jogadores.
-   **Laboratório de Modelos Interativo:**
    -   **Pipeline Automatizada:** Um único clique aciona uma pipeline completa no backend que gera um dataset específico para o jogador e modo de jogo, treina múltiplos modelos e retorna os resultados.
    -   **Análise Segmentada:** Permite ao usuário filtrar a análise por modo de jogo (ARAM, Ranked, etc.), garantindo validade científica aos resultados.
    -   **Resultados Detalhados:** Exibe um relatório de classificação completo e uma **Matriz de Confusão** visual para cada modelo, permitindo uma análise profunda dos acertos e erros.
-   **Análise de Relevância das Features:** Gera um gráfico que revela quais estatísticas (KDA, Ouro, Visão, etc.) foram mais influentes para o modelo prever o resultado das partidas, gerando insights valiosos.

---

## 🚀 Tecnologias Utilizadas

-   **Frontend:** React, Chart.js
-   **Backend:** Node.js, Express.js, Axios
-   **Banco de Dados:** MongoDB Atlas
-   **Machine Learning & Data Science:** Python, Pandas, Scikit-learn, Matplotlib, Seaborn
-   **Hospagem (Deploy):** Render.com
-   **Controle de Versão:** Git & GitHub

---

## 🔧 Como Executar Localmente

### Pré-requisitos
-   Node.js (versão 18+)
-   Python (versão 3.8+) e `pip`
-   Git
-   Uma conta no MongoDB Atlas.
-   Uma **Personal API Key** do [Riot Developer Portal](https://developer.riotgames.com/).

### Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/juniorbr007/Valorant-Project.git](https://github.com/juniorbr007/Valorant-Project.git)
    cd Valorant-Project
    ```

2.  **Configure o Backend (`/server`):**
    ```bash
    cd server
    npm install
    # Instala todas as dependências do Python
    pip install pandas scikit-learn pymongo python-dotenv matplotlib seaborn
    ```
    - Crie um arquivo `.env` na pasta `server` e adicione suas chaves:
    ```env
    MONGODB_URI="sua_string_de_conexao_do_mongodb"
    RIOT_API_KEY="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ```

3.  **Configure o Frontend (`/client`):**
    ```bash
    cd ../client
    npm install
    ```
    - Crie um arquivo `.env` na pasta `client`:
    ```env
    REACT_APP_API_URL=http://localhost:5000
    ```
    - Crie um arquivo `jsconfig.json` na pasta `client`:
    ```json
    { "compilerOptions": { "baseUrl": "src" }, "include": ["src"] }
    ```

### Executando a Aplicação
-   **Terminal 1 (Backend):** `cd server && npm run dev`
-   **Terminal 2 (Frontend):** `cd client && npm start`

> Acesse a aplicação em `http://localhost:3000`.

---

## 🔬 Fluxo de Análise de Dados e ML

1.  **Coleta:** O usuário busca um jogador no Dashboard do LoL e clica em "Salvar as 20" para popular o MongoDB com os JSONs brutos das partidas.
2.  **Mineração e Treinamento:** O usuário vai ao "Laboratório de Modelos", seleciona um modo de jogo e clica em "Rodar Modelos". Isso aciona uma pipeline no backend que:
    a. Executa o `data_miner.py` para ler os JSONs do jogador, extrair as features e gerar um arquivo `lol_player_stats.csv` limpo.
    b. Executa o `lol_classifier_model.py` para ler o `.csv`, treinar e validar os modelos, e retornar os resultados como um JSON.
3.  **Visualização de Resultados:** O frontend exibe os gráficos de performance, tabelas de métricas e Matrizes de Confusão na tela.
4.  **Análise de Features:** O usuário clica em "Gerar Gráfico de Importância", que aciona o script `feature_analysis.py` para gerar e exibir um gráfico em PNG das features mais relevantes.

---

## 🏛️ Estrutura do Projeto

O projeto utiliza uma **arquitetura baseada em features**, separando a lógica de cada módulo.

```bash
/
├── client/
│   └── src/
│       ├── components/       # Componentes globais (Navbar) e compartilhados (gráficos de ML)
│       ├── features/         # ARQUITETURA PRINCIPAL: Cada feature é um módulo
│       └── App.js            # Orquestrador da aplicação
└── server/
    ├── index.js              # Servidor principal com todas as rotas
    ├── data_miner.py         # Script para mineração e geração do CSV
    ├── lol_classifier_model.py # Script para treinamento e validação dos modelos
    └── feature_analysis.py   # Script para análise da importância das features


```bash
       📄 Licença
Este projeto está sob a licença MIT.