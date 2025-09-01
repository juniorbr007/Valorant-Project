# Cypher's Edge: Análise de Performance em Valorant com Sistema Híbrido de ML

<p align="center">
  </p>

> Projeto acadêmico desenvolvido para a disciplina de Sistemas Híbridos, com o objetivo de aplicar técnicas de Machine Learning para análise e classificação de desempenho de jogadores de Valorant.

<p align="center">
  <strong><a href="https://valorant-frontend.onrender.com/">Acessar a Aplicação Online</a></strong>
</p>

---

## 📑 Sobre o Projeto

**Cypher's Edge** é uma aplicação web completa que serve como ferramenta para a coleta e visualização de dados do jogo Valorant. O núcleo do projeto é o desenvolvimento de um **sistema híbrido de Machine Learning** no backend, projetado para transformar dados brutos de partidas em insights táticos acionáveis.

O trabalho cumpre requisitos acadêmicos que incluem a comparação do método proposto com outros da literatura, a aplicação de testes de hipótese para validação estatística e a documentação dos resultados em formato de artigo científico.

### ✨ Features Principais

-   **Autenticação Segura:** Integração com o sistema oficial da Riot Games (RSO) para acesso consentido aos dados do jogador.
-   **Dashboard Analítico com Múltiplas Abas:**
    -   **Visão Geral:** Apresenta estatísticas chave (KPIs), histórico de partidas paginado e um sistema de **detecção de anomalias** para destacar performances fora da curva.
    -   **Gráficos de Performance:** Uma suíte de visualizações de dados, incluindo evolução de performance, análise por agente, distribuição de ACS e um gráfico de radar para desempenho por função.
    -   **Laboratório de Modelos:** Uma seção interativa para treinar e avaliar modelos de Machine Learning (como MLP) em tempo real, exibindo métricas como acurácia e a matriz de confusão.
    -   **Roteiro do Projeto:** Uma timeline visual que documenta o progresso e os próximos passos do desenvolvimento.
-   **Galeria de Agentes:** Consulta e exibe informações detalhadas de todos os agentes do jogo, com suas habilidades (com modal interativo) e biografias, consumindo dados de múltiplas APIs.

---

## 🚀 Tecnologias Utilizadas

-   **Frontend:** React, React Router, Chart.js
-   **Backend:** Node.js, Express.js
-   **Banco de Dados:** MongoDB Atlas
-   **Machine Learning (Backend):** Python, Scikit-learn, Pandas
-   **Hospagem (Deploy):** Render.com
-   **Controle de Versão:** Git & GitHub

---

## 🔧 Como Executar Localmente

Para executar este projeto no seu ambiente de desenvolvimento local, siga os passos abaixo.

### Pré-requisitos

-   Node.js (versão 18+)
-   Python (versão 3.8+)
-   Git
-   Uma conta no MongoDB Atlas.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/juniorbr007/Valorant-Project.git](https://github.com/juniorbr007/Valorant-Project.git)
    cd Valorant-Project
    ```

2.  **Configure o Backend:**
    ```bash
    cd server
    npm install
    pip install pandas scikit-learn pymongo dnspython python-dotenv
    # Crie um arquivo .env na pasta 'server' com suas chaves (use .env.example como modelo).
    ```

3.  **Configure o Frontend:**
    ```bash
    cd ../client
    npm install
    # Crie um arquivo .env na pasta 'client' com o conteúdo:
    # REACT_APP_API_URL=http://localhost:5000
    ```
### Executando a Aplicação

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

---

## 🏛️ Estrutura do Projeto

```bash
/
├── client/         # Contém todo o código do Frontend (React)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── assets/
│       └── shared/
├── server/         # Contém todo o código do Backend (Node.js/Express)
│   ├── cluster_model.py
│   └── classifier_model.py
└── README.md

```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.


