import React from 'react';
import './RoadmapPage.css';
// Importando mais ícones para dar mais detalhes visuais
import { 
  RiServerLine, 
  RiBarChartBoxLine, 
  RiCpuLine, 
  RiCloudLine, 
  RiCheckDoubleFill,
  RiSettings3Line,
  RiCheckboxBlankCircleLine
} from 'react-icons/ri';

const RoadmapPage = () => {
  return (
    <div className="roadmap-container">
      {/* CARD DE INTRODUÇÃO NO TOPO */}
      <div className="roadmap-header-card">
        <h1>Roteiro de Desenvolvimento</h1>
        <p className="roadmap-subtitle">
          Uma timeline documentando a jornada do <strong>Cypher's Edge</strong>, desde a concepção e infraestrutura até a implementação do sistema híbrido de Machine Learning e os próximos passos para o futuro.
        </p>
      </div>

      <div className="timeline-container">
        {/* FASE 1: FUNDAÇÃO */}
        <div className="timeline-item completed">
          <div className="timeline-icon"><RiServerLine /></div>
          <div className="timeline-content">
            <h3>Fase 1: Fundação e Infraestrutura</h3>
            <p className="phase-description">Construção da base sólida da aplicação, garantindo que todas as tecnologias conversem entre si e que o projeto seja escalável e seguro desde o início.</p>
            <ul>
              <li><RiCheckDoubleFill /> Configuração do ambiente de desenvolvimento (Node.js, React, Python).</li>
              <li><RiCheckDoubleFill /> Estruturação do projeto (Frontend, Backend, Banco de Dados).</li>
              <li><RiCheckDoubleFill /> Implementação da autenticação com a API da Riot (RSO).</li>
              <li><RiCheckDoubleFill /> Deploy contínuo configurado no Render.com e MongoDB Atlas.</li>
            </ul>
          </div>
        </div>

        {/* FASE 2: ANÁLISE EXPLORATÓRIA */}
        <div className="timeline-item completed">
          <div className="timeline-icon"><RiBarChartBoxLine /></div>
          <div className="timeline-content">
            <h3>Fase 2: Análise Exploratória e Visualização</h3>
            <p className="phase-description">Transformação de dados brutos em conhecimento visual. Criação de uma interface rica para explorar a performance do jogador de múltiplas maneiras.</p>
            <ul>
              <li><RiCheckDoubleFill /> Geração de uma base de dados fictícia e robusta com 50 partidas.</li>
              <li><RiCheckDoubleFill /> Desenvolvimento do Dashboard com KPIs (Widgets de Stats).</li>
              <li><RiCheckDoubleFill /> Implementação de múltiplos gráficos de análise (Evolução, Agente, Dispersão, etc.).</li>
              <li><RiCheckDoubleFill /> Criação de um sistema de detecção de anomalias estatísticas.</li>
            </ul>
          </div>
        </div>

        {/* FASE 3: MODELAGEM PREDITIVA */}
        <div className="timeline-item in-progress">
          <div className="timeline-icon"><RiCpuLine /></div>
          <div className="timeline-content">
            <h3>Fase 3: Modelagem Preditiva (Sistema Híbrido)</h3>
            <p className="phase-description">O coração acadêmico do projeto. Aplicação de técnicas de Machine Learning para criar modelos preditivos e compará-los.</p>
            <ul>
              <li><RiCheckDoubleFill /> Implementação do pipeline de Clustering (K-Means) para identificar estilos de jogo.</li>
              <li><RiCheckDoubleFill /> Implementação do pipeline de Classificação (MLP) para prever vitórias.</li>
              <li><RiSettings3Line className="icon-spin" /> <strong>Em Andamento:</strong> Implementar e comparar outros modelos (ex: Naive Bayes) para validação estatística.</li>
            </ul>
          </div>
        </div>

        {/* FASE 4: FUTURO */}
        <div className="timeline-item planned">
          <div className="timeline-icon"><RiCloudLine /></div>
          <div className="timeline-content">
            <h3>Fase 4: Integração com Dados Reais e Futuro</h3>
            <p className="phase-description">Transição do ambiente de desenvolvimento para um produto funcional, consumindo dados reais e documentando os resultados.</p>
            <ul>
              <li><RiCheckboxBlankCircleLine /> <strong>Planejado:</strong> Ativar as chaves da API da Riot para coleta de dados reais.</li>
              <li><RiCheckboxBlankCircleLine /> <strong>Planejado:</strong> Implementar a busca e armazenamento do histórico de partidas completo do usuário.</li>
              <li><RiCheckboxBlankCircleLine /> <strong>Planejado:</strong> Refinar o frontend para exibir os resultados dos modelos com base nos dados reais do usuário logado.</li>
              <li><RiCheckboxBlankCircleLine /> <strong>Planejado:</strong> Redação do artigo científico no formato IEEE.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;

