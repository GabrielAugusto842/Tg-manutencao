import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Loader2, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartTooltip } from "recharts";
import "./BacklogIntegrado.css";

const CHART_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'];

export default function BacklogIntegradoCard({ backlog = [], loading, error }) {

  const getStatusClass = (status) => {
    switch (status) {
      case "Aberta":
      case "Pendente": return "status aberta";
      case "Em Andamento": return "status andamento";
      case "Finalizado": return "status finalizado";
      case "Aguardando Peças": return "status aguardando-pecas";
      case "Aguardando Aprovação": return "status aguardando-aprovacao";
      default: return "status desconhecido";
    }
  };

  const sectorDistribution = useMemo(() => {
    const distribution = backlog.reduce((acc, os) => {
      const setor = os.nome_setor || "Desconhecido";
      acc[setor] = (acc[setor] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [backlog]);

  if (loading) {
    return (
      <div className="backlog-card flex items-center justify-center h-40">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" />
        Carregando Backlog...
      </div>
    );
  }

  if (error) {
    return (
      <div className="backlog-card flex flex-col items-center justify-center h-40 text-red-600">
        <TrendingDown className="w-8 h-8 mb-2" />
        <p className="font-bold">Erro ao carregar Backlog</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="backlog-card">
      <h4 className="titulo-card">Backlog Geral por OS</h4>

      <div className="backlog-flex">
        {/* ---------------- LISTA ---------------- */}
        <div className="backlog-left">
          {backlog.length === 0 ? (
            <p className="nenhuma-os">Nenhuma OS pendente.</p>
          ) : (
            <table className="tabela-os">
              <thead>
                <tr>
                  <th>Idade</th>
                  <th>Máquina / OS</th>
                  <th>Setor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {backlog.map((os) => (
                  <tr key={os.id_ord_serv}>
                    <td>{os.idade_dias}d</td>
                  <td className="col-os">
  <Link to={`/ordens/${os.id_ord_serv}`} className="os-link">
    {os.nome_maquina} 
  </Link>
  <br/>
  <span className="os-descricao">
    {os.descricao.length > 30 ? os.descricao.slice(0,30)+"..." : os.descricao}
  </span>

  <div className="os-tooltip">
    <strong>OS {os.id_ord_serv}</strong><br/>
    <b>Descrição:</b> {os.descricao}<br/>
    <b>Abertura:</b> {new Date(os.data_abertura).toLocaleString()}<br/>
    <b>Máquina:</b> {os.nome_maquina} ({os.tag_maquina})<br/>
    <b>Setor:</b> {os.nome_setor}<br/>
    <b>Status:</b> {os.status}
  </div>
</td>

                    <td>{os.nome_setor}</td>
                    <td>
                      <span className={getStatusClass(os.status)}>{os.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ---------------- GRÁFICO ---------------- */}
        <div className="backlog-right">
          <h5 className="grafico-titulo">Distribuição por Setor</h5>
          {sectorDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={sectorDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={60}
                >
                  {sectorDistribution.map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartTooltip 
                  formatter={(value, name, props) => [
                    `${value} OS (${((value/backlog.length)*100).toFixed(1)}%)`,
                    props.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-xs">Sem dados</p>}
        </div>
      </div>
    </div>
  );
}
