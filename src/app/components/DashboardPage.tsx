import { useState, useEffect } from 'react';
import { useArea } from '../contexts/AreaContext';
import * as api from '../services/api';
import { Tag } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { ArrowLeft, AlertTriangle, Activity } from 'lucide-react';
import { Link } from 'react-router';

const PRIORIDADE_COLORS: Record<string, string> = {
  urgente: '#ef4444', // red-500
  alta: '#f97316',    // orange-500
  média: '#eab308',   // yellow-500
  baixa: '#3b82f6',   // blue-500
};

const STATUS_COLORS: Record<string, string> = {
  operacional: '#10b981', // emerald-500
  manutenção: '#f59e0b',  // amber-500
  inativo: '#6b7280',     // gray-500
};

export function DashboardPage() {
  const { selectedArea } = useArea();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await api.getAllTags();
      setTags(data);
    } catch (error) {
      console.error('Erro ao carregar TAGs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizacaoFromArea = (area: string) => {
    switch (area) {
      case 'ETAC II': return 'ETAC 2';
      case 'CDF II': return 'Caldeira 2';
      case 'ETAC I': return 'ETAC 1';
      case 'CDF I': return 'Caldeira 1';
      default: return area;
    }
  };

  const areaTags = tags.filter(t => t.localizacao_texto === getLocalizacaoFromArea(selectedArea));

  // Process data for charts
  const notesPriorityData = [
    { name: 'Urgente', value: 0, prioridade: 'urgente' },
    { name: 'Alta', value: 0, prioridade: 'alta' },
    { name: 'Média', value: 0, prioridade: 'média' },
    { name: 'Baixa', value: 0, prioridade: 'baixa' },
  ];

  const statusData = [
    { name: 'Operacional', value: 0, status: 'operacional' },
    { name: 'Em Manutenção', value: 0, status: 'manutenção' },
    { name: 'Inativo', value: 0, status: 'inativo' },
  ];

  areaTags.forEach(tag => {
    // Fill status
    const statusEntry = statusData.find(s => s.status === tag.status);
    if (statusEntry) statusEntry.value += 1;

    // Fill notes
    if (tag.nota_manutencao) {
      const pEntry = notesPriorityData.find(p => p.prioridade === tag.nota_manutencao?.prioridade);
      if (pEntry) pEntry.value += 1;
    }
  });

  const totalNotas = areaTags.filter(t => t.nota_manutencao).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin" className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Gráfico</h1>
          </div>
          <p className="text-muted-foreground ml-9 text-sm">Visão analítica de manutenção da área {selectedArea}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card: Notas por Criticidade */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="text-destructive" size={20} />
              <h2 className="text-lg font-bold text-foreground">Notas por Criticidade</h2>
              <span className="ml-auto bg-destructive/10 text-destructive text-xs font-bold px-2.5 py-0.5 rounded-full">
                {totalNotas} Abertas
              </span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={notesPriorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" tick={{fill: '#888'}} axisLine={{stroke: '#333'}} />
                  <YAxis allowDecimals={false} tick={{fill: '#888'}} axisLine={{stroke: '#333'}} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem'}}
                    itemStyle={{ color: '#e5e7eb' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Quantidade" 
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(data) => {
                      if (data && data.prioridade) {
                        setSelectedPriority(data.prioridade);
                      }
                    }}
                  >
                    {notesPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORIDADE_COLORS[entry.prioridade]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card: Status Geral */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-foreground">Distribuição de Status</h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem'}}
                    itemStyle={{ color: '#e5e7eb' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Selected Priority Details */}
      {selectedPriority && !loading && (
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Equipamentos com Nota: <span className="uppercase text-primary" style={{ color: PRIORIDADE_COLORS[selectedPriority] || 'inherit' }}>{selectedPriority}</span>
            </h2>
            <button onClick={() => setSelectedPriority(null)} className="text-sm text-muted-foreground hover:text-foreground">
              ✕ Fechar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {areaTags.filter(t => t.nota_manutencao?.prioridade === selectedPriority).map(tag => (
              <Link key={tag.id} to={`/tag/${tag.id}`} className="block p-3 rounded border border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="font-mono font-bold text-primary text-xs mb-1">{tag.tag_completo}</p>
                <p className="text-sm text-foreground font-medium mb-1 truncate">{tag.nome_equipamento}</p>
                <p className="text-xs text-muted-foreground truncate">Nota: {tag.nota_manutencao?.numero_nota}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
