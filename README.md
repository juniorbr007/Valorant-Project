# Cypher's Edge: Plataforma de Análise de Performance em Jogos Competitivos

> Um ecossistema de análise de dados projetado para extrair insights táticos e de desempenho de múltiplos jogos competitivos, começando com Valorant e League of Legends.

<p align="center">
  <strong><a href="https://valorant-frontend.onrender.com/">Acessar a Aplicação Online</a></strong>
</p>

---

## 📑 Sobre o Projeto

O **Cypher's Edge** evoluiu para uma plataforma web completa que serve como uma central para coleta, visualização e análise de dados de jogos. O núcleo do projeto continua sendo o desenvolvimento de um **sistema híbrido de Machine Learning**, mas agora com um escopo expandido para diferentes universos de jogos:

1.  **Módulo Valorant:** Utiliza um conjunto de dados simulados (`mock data`) para o desenvolvimento e treinamento de modelos de ML, focando na classificação de estilos de jogo e detecção de anomalias sem a necessidade de uma chave de API de produção.
2.  **Módulo League of Legends:** Integra-se diretamente com a **API oficial da Riot Games**, permitindo a busca e análise de dados de jogadores em tempo real, servindo como a aplicação prática e real dos conceitos estudados.

O trabalho cumpre requisitos acadêmicos que incluem a comparação de métodos propostos com outros da literatura, a aplicação de testes de hipótese e a documentação dos resultados em formato de artigo científico.

### ✨ Features Principais

#### Plataforma
-   **Tela de Seleção de Jogo:** Uma interface de entrada imersiva que permite ao usuário escolher qual ecossistema de jogo deseja analisar.
-   **Navegação Unificada:** Uma barra de navegação persistente que oferece acesso rápido às diferentes seções da aplicação.

#### Módulo Valorant (Dados Simulados)
-   **Dashboard Analítico Completo:** Múltiplas abas para visualização de KPIs, histórico de partidas, gráficos de performance por agente/função e muito mais.
-   **Laboratório de Modelos:** Uma seção interativa para treinar e avaliar modelos de Machine Learning (MLP, etc.) em tempo real.
-   **Galeria de Agentes:** Consulta e exibe informações detalhadas de todos os agentes do jogo.

#### Módulo League of Legends (API Real)
-   **Busca de Invocador por Riot ID:** Funcionalidade para encontrar qualquer jogador utilizando seu nome e tagline.
-   **Visualização de Dados da Conta:** Exibe informações essenciais da conta, como o `PUUID`, que é a chave para futuras consultas.
-   **(Em Desenvolvimento):** Histórico de partidas, análise detalhada de confrontos e estatísticas de campeões.

---

## 🚀 Tecnologias Utilizadas

-   **Frontend:** React, Chart.js (para visualização de dados)
-   **Backend:** Node.js, Express.js
-   **Comunicação com API Externa:** Axios
-   **Banco de Dados:** MongoDB Atlas
-   **Machine Learning (Backend):** Python, Scikit-learn, Pandas
-   **Hospagem (Deploy):** Render.com
-   **Controle de Versão:** Git & GitHub

---

## 🔧 Como Executar Localmente

### Pré-requisitos
-   Node.js (versão 18+)
-   Python (versão 3.8+)
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
    pip install pandas scikit-learn pymongo dnspython python-dotenv
    ```
    - Crie um arquivo `.env` na pasta `server` e adicione suas chaves:
    ```env
    # Conexão com o MongoDB
    MONGODB_URI="sua_string_de_conexao_do_mongodb"

    # Chave da API da Riot Games para o League of Legends
    RIOT_API_KEY="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ```

3.  **Configure o Frontend (`/client`):**
    ```bash
    cd ../client
    npm install
    ```
    - Crie um arquivo `.env` na pasta `client` com o conteúdo:
    ```env
    REACT_APP_API_URL=http://localhost:5000
    ```

### Executando a Aplicação
Você precisará de dois terminais abertos.

-   **Terminal 1 (Backend):**
    ```bash
    cd server
    npm run dev
    ```

-   **Terminal 2 (Frontend):**
    ```bash
    cd client
    npm start
    ```
> Acesse a aplicação em `http://localhost:3000`.

---

## 🏛️ Estrutura do Projeto (Arquitetura Baseada em Features)

O projeto foi refatorado para uma arquitetura escalável e organizada, onde cada funcionalidade principal reside em seu próprio módulo.

```bash
/
├── client/
│   └── src/
│       ├── assets/
│       ├── components/       # Componentes globais e reutilizáveis (Navbar, Footer)
│       │   └── layouts/
│       ├── features/         # ARQUITETURA PRINCIPAL: Cada feature é um módulo
│       │   ├── GameSelection/  # Tela de seleção de jogo
│       │   ├── valorant/       # Módulo completo do Valorant
│       │   └── lol/            # Módulo completo do League of Legends
│       └── App.js            # Orquestrador principal da aplicação
└── server/
    ├── index.js              # Servidor principal e rotas da API
    ├── cluster_model.py      # Script de ML para clustering
    └── classifier_model.py   # Script de ML para classificação

    📄 Licença
Este projeto está sob a licença MIT.