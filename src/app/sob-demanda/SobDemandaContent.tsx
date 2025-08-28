'use client';

import { useState } from "react";

const prices: Record<string, { prof: number; corp: string }> = {
  1000: { prof: 3100, corp: "Sob demanda" },
  1500: { prof: 3415, corp: "Sob demanda" },
  2000: { prof: 3731, corp: "Sob demanda" },
  2500: { prof: 4046, corp: "Sob demanda" },
  3000: { prof: 4362, corp: "Sob demanda" },
  4000: { prof: 4993, corp: "Sob demanda" },
  5000: { prof: 5624, corp: "Sob demanda" },
  6000: { prof: 6255, corp: "Sob demanda" },
  7000: { prof: 6886, corp: "Sob demanda" },
  8000: { prof: 7517, corp: "Sob demanda" },
  9000: { prof: 8148, corp: "Sob demanda" },
  10000: { prof: 8779, corp: "Sob demanda" },
};

function formatPrice(v: number) {
  return "R$ " + v.toLocaleString("pt-BR") + "/mês";
}

export default function SobDemandaContent() {
  const [demand, setDemand] = useState("1000");

  return (
    <>
      <style jsx global>{`
  :root{
    --maxw:1000px;
    --space:2rem;
  }

  /* Container geral */
  .plan-container{
    font-family:'Roboto',sans-serif!important;
    max-width:var(--maxw);
    margin:0 auto;
    padding:0 16px;               /* respiro lateral */
    color:#222;
  }

  /* Selector */
  .selector{margin-bottom:1.25rem;font-size:1rem;text-align:center;}
  select{
    padding:0.6rem 0.9rem;
    font-size:1rem;
    border:2px solid #ddd;
    border-radius:8px;
    background:#f8f8f8;
    transition:border-color .3s;
  }
  select:focus{
    border-color:#00796b;
    outline:none;
    box-shadow:0 0 5px rgba(0,123,123,.5);
  }

  /* Cards dos planos */
  .plan-boxes{
    display:flex;
    flex-wrap:wrap;
    gap:1rem;
    justify-content:space-between;
    margin-bottom:var(--space);
  }
  .plan{
    border:1px solid #ddd;
    border-radius:10px;
    padding:1.5rem;               /* menor que antes */
    flex:1;
    min-width:260px;
    text-align:center;
    background:#fff;
    box-shadow:0 2px 8px rgba(0,0,0,.08);
    transition:transform .3s;
  }
  .plan:hover{transform:translateY(-3px);}
  .plan h3{margin:0 0 .4rem;font-size:1.35rem;color:#333;}
  .plan-price{
    font-size:1.7rem;             /* menor que antes */
    margin:.4rem 0;
    font-weight:bold;
    color:#00796b;
  }
  .plan-note{font-size:.85rem;color:#555;}
  .plan-btn{
    margin-top:.8rem;
    padding:.6rem 1.2rem;
    border:2px solid #00796b;
    background:#fff;
    color:#00796b;
    cursor:pointer;
    border-radius:8px;
    transition:all .25s;
    font-size:.9rem;
  }
  .plan-btn:hover{
    background:#00796b;
    color:#fff;
    transform:translateY(-2px);
  }
  .plan-btn:focus{
    outline:none;
    box-shadow:0 0 6px rgba(0,123,123,.5);
  }

  /* Tabelas */
  .table-wrapper{
    max-width:var(--maxw);
    margin:0 auto var(--space);
    overflow-x:auto;              /* scroll horizontal se precisar */
  }
  .plan-table{
    width:100%;
    border-collapse:collapse;
    table-layout:fixed;
    border-radius:8px;
    overflow:hidden;
    box-shadow:0 2px 8px rgba(0,0,0,.08);
    font-family:'Roboto',sans-serif!important;
  }
  .plan-table th,
  .plan-table td{
    padding:.9rem;
    text-align:center;
    border:1px solid #ddd;
    font-size:1rem;
    line-height:1.3;
  }
  .plan-table th{
    background:#00796b;
    color:#fff;
    font-weight:bold;
  }
  .plan-table td:first-child{text-align:left;}
  .plan-table tr:hover{background:#f7f7f7;}
  .check{color:green;font-weight:bold;}
  .cross{color:red;font-weight:bold;}
  .plan-table td.texto{font-size:.85rem!important;color:#202020;}

  /* Responsivo */
  @media (max-width:1024px){
    .plan{padding:1.25rem;}
    .plan-price{font-size:1.55rem;}
  }

@media (max-width:768px){
  .plan-container{ padding:0 !important; }        /* antes 0 16px */
  .table-wrapper{ padding:0; margin:0 0 var(--space); } /* remove auto nas laterais */
}

@media (max-width:768px){
  /* 1ª coluna maior, mantém table-layout:fixed */
  .plan-table col:first-child{ width:36% !important; }
  .plan-table col:nth-child(2),
  .plan-table col:nth-child(3){ width:32% !important; }
}

  @media (max-width:768px){
    .plan-boxes{gap:.75rem;}
    .plan{padding:1rem;min-width:100%;}
    .plan h3{font-size:1.2rem;}
    .plan-price{font-size:1.45rem;}
    .plan-btn{font-size:.85rem;padding:.55rem 1rem;}

    .plan-table th,
    .plan-table td{
      padding:.6rem;
      font-size:.8rem;            /* MAIOR que antes (0.6) */
    }
    .plan-table td.texto{font-size:.7rem!important;}
  }

  @media (max-width:480px){
    .plan-price{font-size:1.35rem;}
    .plan h3{font-size:1.1rem;}
    .plan-note{font-size:.75rem;}
  }
      `}</style>
      <div className="plan-container">
        <div className="selector">
          <label htmlFor="whatsapp-demand">Qual sua demanda mensal de conversas:</label>
          <select
            id="whatsapp-demand"
            onChange={(e) => setDemand(e.target.value)}
          >
            <option value="1000">Até 1.000 conversas</option>
            <option value="1500">Até 1.500 conversas</option>
            <option value="2000">Até 2.000 conversas</option>
            <option value="2500">Até 2.500 conversas</option>
            <option value="3000">Até 3.000 conversas</option>
            <option value="4000">Até 4.000 conversas</option>
            <option value="5000">Até 5.000 conversas</option>
            <option value="6000">Até 6.000 conversas</option>
            <option value="7000">Até 7.000 conversas</option>
            <option value="8000">Até 8.000 conversas</option>
            <option value="9000">Até 9.000 conversas</option>
            <option value="10000">Até 10.000 conversas</option>
          </select>
        </div>

        <div className="plan-boxes">
          <div className="plan">
            <h3>Profissional</h3>
            <div className="plan-price" id="price-prof">{formatPrice(prices[demand].prof)}</div>
            <div className="plan-note">Valor cobrado no <strong>Plano Semestral</strong></div>
            <a href="https://evoluke.com.br/demonstracao" target="_blank" rel="noreferrer">
              <button className="plan-btn">AGENDAR DEMONSTRAÇÃO</button>
            </a>
          </div>

          <div className="plan">
            <h3>Corporativo</h3>
            <div className="plan-price" id="price-corp">Sob demanda</div>
            <a href="https://evoluke.com.br/demonstracao" target="_blank" rel="noreferrer">
              <button className="plan-btn">AGENDAR DEMONSTRAÇÃO</button>
            </a>
          </div>
        </div>

        {/* TABELAS */}
        <div className="table-wrapper">
          <table className="plan-table">
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '37.5%' }} />
              <col style={{ width: '37.5%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>CANAIS DE COMUNICAÇÃO</th>
                <th>Profissional</th>
                <th>Corporativo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>WhatsApp</td><td className="check">✓</td><td className="check">✓</td></tr>
              <tr><td>Chat no site</td><td className="check">✓</td><td className="check">✓</td></tr>
              <tr><td>Telegram</td><td className="check">✓</td><td className="check">✓</td></tr>
              <tr><td>Facebook</td><td className="check">✓</td><td className="check">✓</td></tr>
              <tr><td>Instagram</td><td className="check">✓</td><td className="check">✓</td></tr>
              <tr><td>Outros</td><td className="texto">Custo adicional</td><td className="texto">Ilimitado</td></tr>
            </tbody>
          </table>
        </div>

        <div className="table-wrapper">
          <table className="plan-table">
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '37.5%' }} />
              <col style={{ width: '37.5%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>INTEGRAÇÕES</th>
                <th>Profissional</th>
                <th>Corporativo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Evoluke CRM</td><td className="check">✓</td><td className="check">✓</td></tr>
              <tr><td>Evoluke Multi-Canal</td><td className="check">✓</td><td className="check">✓</td></tr>
              <tr><td>Integração CRM Externo</td><td className="cross">&#10060;</td><td className="check">✓</td></tr>
            </tbody>
          </table>
        </div>

        <div className="table-wrapper">
          <table className="plan-table">
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '37.5%' }} />
              <col style={{ width: '37.5%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>PLATAFORMA</th>
                <th>Profissional</th>
                <th>Corporativo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Usuários inclusos</td><td className="texto">10 usuários</td><td className="texto">Ilimitado</td></tr>
              <tr><td>Funil de vendas</td><td className="check">✓</td><td className="check">✓</td></tr>
              <tr><td>Histórico de atendimentos</td><td className="texto">180 dias</td><td className="texto">Ilimitado</td></tr>
            </tbody>
          </table>
        </div>

        <div className="table-wrapper">
          <table className="plan-table">
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '37.5%' }} />
              <col style={{ width: '37.5%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>AGENTES DE IA</th>
                <th>Profissional</th>
                <th>Corporativo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Quantidade de agentes</td><td className="texto">1 agente</td><td className="texto">Ilimitado</td></tr>
              <tr><td>Janela de atendimento</td><td className="check">✓</td><td className="check">✓</td></tr>
              <tr><td>Integrações/API</td><td className="texto">Limitado</td><td className="texto">Ilimitado</td></tr>
            </tbody>
          </table>
        </div>

        <div className="table-wrapper">
          <table className="plan-table">
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '37.5%' }} />
              <col style={{ width: '37.5%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>SUPORTE E ATENDIMENTO</th>
                <th>Profissional</th>
                <th>Corporativo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Suporte</td><td className="texto">Chat</td><td className="texto">Chat + Ligação</td></tr>
              <tr><td>Monitoramento prioritário</td><td className="texto">7 dias</td><td className="texto">30 dias</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

