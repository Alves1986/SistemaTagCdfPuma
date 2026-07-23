import { useState, useEffect, useMemo } from 'react';
import { useArea } from '../contexts/AreaContext';
import * as api from '../services/api';
import { Tag } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line
} from 'recharts';
import { ArrowLeft, AlertTriangle, Activity, Gauge, Thermometer, Wrench, Layers, TrendingUp, Download, Printer } from 'lucide-react';
import { Link } from 'react-router';
import { useSearchParams } from 'react-router';
import { checkAreaMatch } from '../utils/hierarchy';

const PRIORIDADE_COLORS: Record<string, string> = {
  urgente: '#00A551', // verde Klabin (destaque crítico)
  alta: '#f97316',
  média: '#eab308',
  baixa: '#3b82f6',
};

const STATUS_COLORS: Record<string, string> = {
  operacional: '#00A551',
  'manutenção': '#f59e0b',
  inativo: '#6b7280',
};

export function DashboardPage() {
  const { selectedArea } = useArea();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedEquipamento, setSelectedEquipamento] = useState<string | null>(null);
  // Fase 17: ordenação do heatmap
  const [sortHeat, setSortHeat] = useState<'notas' | 'tags' | 'nome'>('notas');
  // Fase 18: filtro de status
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'operacional' | 'manutenção' | 'inativo'>('todos');
  // Fase 19: busca por texto (TAG / equipamento)
  const [busca, setBusca] = useState('');
  // Filtro de especialidade persistido na URL (?esp=...) para deep-link
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEspecialidade = searchParams.get('esp') || 'todas';
  const setSelectedEspecialidade = (esp: string) => {
    const next = new URLSearchParams(searchParams);
    if (esp === 'todas') next.delete('esp');
    else next.set('esp', esp);
    setSearchParams(next, { replace: true });
  };

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

  const areaTags = tags.filter(t => checkAreaMatch(t.localizacao_texto || '', selectedArea));
  // Normaliza especialidade (remove acento) para casar URL sem acento vs dados com acento
  const normEsp = (s?: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  // Filtra por especialidade da nota (se selecionada) — afeta KPIs, gráficos e heatmap
  const filteredTags = selectedEspecialidade === 'todas'
    ? areaTags
    : areaTags.filter(t => normEsp(t.nota_manutencao?.especialidade) === normEsp(selectedEspecialidade));
  // Fase 18 + 19: aplica filtro de status e busca textual sobre a vista filtrada
  const vistaTags = filteredTags
    .filter(t => filtroStatus === 'todos' || t.status === filtroStatus)
    .filter(t => {
      const q = busca.trim().toLowerCase();
      if (!q) return true;
      return (t.tag_completo || '').toLowerCase().includes(q)
        || (t.nome_equipamento || '').toLowerCase().includes(q);
    });
  const totalNotas = vistaTags.filter(t => t.nota_manutencao).length;
  const criticas = vistaTags.filter(t => {
    const p = (t.nota_manutencao?.prioridade || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    return p === 'urgente' || p === 'alta';
  }).length;
  const operacionais = vistaTags.filter(t => t.status === 'operacional').length;

  // Última atualização: data de abertura mais recente entre as notas filtradas
  const ultimaAtualizacao = useMemo(() => {
    let max: Date | null = null;
    vistaTags.forEach(t => {
      const d = t.nota_manutencao?.data_abertura ? new Date(t.nota_manutencao.data_abertura) : null;
      if (d && !isNaN(d.getTime()) && (!max || d > max)) max = d;
    });
    return max;
  }, [filteredTags]);

  // Notas abertas há mais de 30 dias (antigas / risco de vencimento de SLA)
  const notasAntigas = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);
    return vistaTags.filter(t => {
      const d = t.nota_manutencao?.data_abertura ? new Date(t.nota_manutencao.data_abertura) : null;
      return d && !isNaN(d.getTime()) && d < limite;
    });
  }, [vistaTags]);

  // Fase 20: resumo de notas por especialidade
  const resumoEspecialidade = useMemo(() => {
    const mapa = new Map<string, number>();
    vistaTags.forEach(t => {
      const esp = (t.nota_manutencao?.especialidade || 'Sem espec.').trim();
      if (!esp) return;
      mapa.set(esp, (mapa.get(esp) || 0) + 1);
    });
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }, [vistaTags]);
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

  vistaTags.forEach(tag => {
    const statusEntry = statusData.find(s => s.status === tag.status);
    if (statusEntry) statusEntry.value += 1;
    // Fill notes
    if (tag.nota_manutencao) {
      const normP = (s?: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
      const prio = normP(tag.nota_manutencao?.prioridade);
      const pEntry = notesPriorityData.find(p => normP(p.prioridade) === prio);
      if (pEntry) pEntry.value += 1;
    }
  });

  const kpis = [
    { label: 'ATIVOS', value: areaTags.length, icon: <Layers size={18} />, tone: 'text-accent' },
    { label: 'OPERACIONAIS', value: operacionais, icon: <Gauge size={18} />, tone: 'text-accent' },
    { label: 'NOTAS ABERTAS', value: totalNotas, icon: <Wrench size={18} />, tone: 'text-amber-400' },
    { label: 'CRÍTICAS', value: criticas, icon: <AlertTriangle size={18} />, tone: 'text-destructive' },
    { label: 'DISPONIBILIDADE', value: areaTags.length > 0 ? `${Math.round((operacionais / areaTags.length) * 100)}%` : '—', icon: <Activity size={18} />, tone: 'text-accent' },
  ];

  // Heatmap de equipamentos críticos: agrega TAGs por nome_equipamento e conta notas abertas
  const equipamentos = useMemo(() => {
    const mapa = new Map<string, { tags: number; notas: number; esps: Set<string> }>();
    vistaTags.forEach(t => {
      const nome = (t.nome_equipamento || 'SEM EQUIPAMENTO').trim().toUpperCase();
      const e = mapa.get(nome) || { tags: 0, notas: 0, esps: new Set<string>() };
      e.tags += 1;
      if (t.nota_manutencao) {
        e.notas += 1;
        const esp = (t.nota_manutencao?.especialidade || '').trim();
        if (esp) e.esps.add(esp);
      }
      mapa.set(nome, e);
    });
    const lista = [...mapa.entries()].map(([nome, v]) => ({ nome, tags: v.tags, notas: v.notas, espBadges: [...v.esps] }));
    lista.sort((a, b) => b.notas - a.notas || b.tags - a.tags);
    return lista;
  }, [vistaTags]);

  // Apenas equipamentos em alerta (com notas abertas) — o "calor" real
  const equipamentosAlerta = equipamentos.filter(e => e.notas > 0);
  const totalEquipamentos = equipamentos.length;
  // Fase 17: ordenação do heatmap
  const ordenarEquip = (lista: typeof equipamentosAlerta) => {
    const c = [...lista];
    if (sortHeat === 'tags') c.sort((a, b) => b.tags - a.tags || a.nome.localeCompare(b.nome));
    else if (sortHeat === 'nome') c.sort((a, b) => a.nome.localeCompare(b.nome));
    else c.sort((a, b) => b.notas - a.notas || b.tags - a.tags);
    return c;
  };
  const equipamentosOrdenados = ordenarEquip(equipamentosAlerta);

  const maxNotas = equipamentosAlerta.reduce((m, e) => Math.max(m, e.notas), 0);

  // Cor de calor: verde (0) -> âmbar (médio) -> vermelho (máx)
  const heatColor = (notas: number) => {
    if (notas === 0) return 'border-accent/20 bg-[#0A1A2A] text-slate-400';
    const ratio = maxNotas > 0 ? notas / maxNotas : 0;
    if (ratio >= 0.66) return 'border-red-500/70 bg-red-500/15 text-red-300';
    if (ratio >= 0.33) return 'border-amber-400/70 bg-amber-400/15 text-amber-300';
    return 'border-accent/70 bg-accent/10 text-accent';
  };

  // Tendência temporal: agrega notas abertas por mês (data_nota)
  const tendenciaData = useMemo(() => {
    const mapa = new Map<string, { mes: string; key: string; total: number; criticas: number }>();
    vistaTags.forEach(t => {
      const nota = t.nota_manutencao;
      if (!nota) return;
      const d = nota.data_abertura ? new Date(nota.data_abertura) : null;
      if (!d || isNaN(d.getTime())) return;
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      const mes = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '').toUpperCase();
      const e = mapa.get(key) || { mes, key, total: 0, criticas: 0 };
      e.total += 1;
      const p = (nota.prioridade || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
      if (p === 'urgente' || p === 'alta') e.criticas += 1;
      mapa.set(key, e);
    });
    return [...mapa.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [vistaTags]);

  // Fase 21: variação da tendência (último mês vs anterior)
  const tendenciaVariacao = useMemo(() => {
    if (tendenciaData.length < 2) return 0;
    const ult = tendenciaData[tendenciaData.length - 1].total;
    const prev = tendenciaData[tendenciaData.length - 2].total;
    return prev > 0 ? Math.round(((ult - prev) / prev) * 100) : (ult > 0 ? 100 : 0);
  }, [tendenciaData]);

  // Exporta a vista filtrada (área + especialidade) em CSV
  const exportCSV = () => {
    const rows = [
      ['TAG', 'EQUIPAMENTO', 'LOCALIZACAO', 'STATUS', 'NOTA', 'PRIORIDADE', 'ESPECIALIDADE', 'DATA_ABERTURA', 'DESCRICAO'],
      ...vistaTags
        .filter(t => t.nota_manutencao)
        .map(t => {
          const n = t.nota_manutencao!;
          return [
            t.tag_completo,
            t.nome_equipamento,
            t.localizacao_texto,
            t.status,
            n.numero_nota,
            n.prioridade,
            n.especialidade || '',
            n.data_abertura ? new Date(n.data_abertura).toLocaleDateString('pt-BR') : '',
            (n.descricao || '').replace(/\n/g, ' '),
          ];
        }),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetria_${selectedArea}_${selectedEspecialidade}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tactical -m-6 p-6 min-h-full bg-[#0A1A2A] text-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b-2 border-accent/30 pb-4">
        <Link to="/admin" className="p-1.5 border border-accent/40 text-accent hover:bg-accent/10 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold uppercase tracking-[0.08em] text-accent mono">TELEMETRIA // OPS</h1>
          <p className="text-xs text-slate-400 mono">ÁREA: {selectedArea}</p>
          <p className="text-[0.6rem] text-slate-500 mono mt-0.5">FORÇA TAREFA: CDF2/ETAC2 · ÚLTIMA ATUALIZAÇÃO: {ultimaAtualizacao ? ultimaAtualizacao.toLocaleDateString('pt-BR') : '—'}</p>
        </div>
        <span className={`ml-auto flex items-center gap-1.5 text-xs mono ${tendenciaVariacao > 0 ? 'text-red-300' : tendenciaVariacao < 0 ? 'text-accent' : 'text-accent/70'}`}>
          <Activity size={14} /> LIVE
          {tendenciaVariacao !== 0 && (
            <span className="px-1 py-0.5 text-[0.58rem] font-bold border border-current">
              {tendenciaVariacao > 0 ? `↑ ${tendenciaVariacao}%` : `↓ ${Math.abs(tendenciaVariacao)}%`}
            </span>
          )}
        </span>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-wider border-2 border-accent/40 text-accent hover:bg-accent/10 transition-colors"
        >
          <Download size={14} /> EXPORT CSV
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-wider border-2 border-accent/40 text-accent hover:bg-accent/10 transition-colors"
        >
          <Printer size={14} /> IMPRIMIR
        </button>
      </div>

      {/* Filtro de especialidade */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">Especialidade:</span>
        {['todas', 'Mecânica', 'Elétrica', 'Instrumentação', 'Automação', 'Civil', 'Lubrificação', 'Isolamento'].map(esp => (
          <button
            key={esp}
            onClick={() => setSelectedEspecialidade(esp)}
            className={`px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider border-2 transition-colors ${
              selectedEspecialidade === esp
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-accent/20 text-slate-400 hover:border-accent/50 hover:text-slate-200'
            }`}
          >
            {esp}
          </button>
        ))}
      </div>

      {/* Filtro rápido de criticidade */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">Criticidade:</span>
        {[
          { key: 'todas', label: 'Todas' },
          { key: 'urgente', label: 'Urgente' },
          { key: 'alta', label: 'Alta' },
          { key: 'média', label: 'Média' },
          { key: 'baixa', label: 'Baixa' },
        ].map(c => (
          <button
            key={c.key}
            onClick={() => setSelectedPriority(c.key === 'todas' ? null : c.key)}
            className={`px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider border-2 transition-colors ${
              (c.key === 'todas' ? selectedPriority === null : selectedPriority === c.key)
                ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                : 'border-amber-400/20 text-slate-400 hover:border-amber-400/50 hover:text-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Fase 19: Busca + Fase 18: Filtro de status + Fase 17: Ordenação do heatmap */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar TAG ou equipamento…"
          className="px-2.5 py-1.5 text-xs bg-[#0A1A2A] border-2 border-accent/30 text-slate-200 placeholder:text-slate-500 focus:border-accent focus:outline-none w-56"
        />
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">Status:</span>
        {(['todos', 'operacional', 'manutenção', 'inativo'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider border-2 transition-colors ${
              filtroStatus === s
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-accent/20 text-slate-400 hover:border-accent/50 hover:text-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 ml-2">Ordenar:</span>
        {([{ k: 'notas', l: 'Notas' }, { k: 'tags', l: 'TAGs' }, { k: 'nome', l: 'Nome' }] as const).map(o => (
          <button
            key={o.k}
            onClick={() => setSortHeat(o.k)}
            className={`px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider border-2 transition-colors ${
              sortHeat === o.k
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-accent/20 text-slate-400 hover:border-accent/50 hover:text-slate-200'
            }`}
          >
            {o.l}
          </button>
        ))}
        <button
          onClick={loadTags}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-wider border-2 border-accent/40 text-accent hover:bg-accent/10 transition-colors"
        >
          <Activity size={14} /> ATUALIZAR
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {kpis.map(k => (
              <div key={k.label} className="bg-[#0E2236] border-2 border-accent/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">{k.label}</span>
                  <span className={k.tone}>{k.icon}</span>
                </div>
                <p className={`text-3xl font-black mono ${k.tone}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Criticidade */}
            <div className="bg-[#0E2236] border-2 border-accent/30 p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-accent/20 pb-2">
                <AlertTriangle className="text-accent" size={16} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">Notas por Criticidade</h2>
                <span className="ml-auto bg-accent/20 text-accent text-xs font-bold px-2 py-0.5">{totalNotas} ABERTAS</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={notesPriorityData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e3a52' }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e3a52' }} />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(0,165,81,0.08)' }}
                      contentStyle={{ backgroundColor: '#0E2236', border: '1px solid #1e3a52', borderRadius: 0 }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Bar
                      dataKey="value"
                      name="Quantidade"
                      radius={[2, 2, 0, 0]}
                      cursor="pointer"
                      onClick={(data) => { if (data && data.prioridade) setSelectedPriority(data.prioridade); }}
                    >
                      {notesPriorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#00A551', '#f97316', '#eab308', '#3b82f6'][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status */}
            <div className="bg-[#0E2236] border-2 border-accent/30 p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-accent/20 pb-2">
                <Activity className="text-accent" size={16} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">Distribuição de Status</h2>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={40}
                      fill="#00A551"
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#00A551', '#f59e0b', '#6b7280'][index]} stroke="#0E2236" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0E2236', border: '1px solid #1e3a52', borderRadius: 0 }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tendência Temporal de Notas */}
          <div className="mt-4 bg-[#0E2236] border-2 border-accent/30 p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-accent/20 pb-2">
              <TrendingUp className="text-accent" size={16} />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">Tendência de Notas (por mês)</h2>
              <span className="ml-auto bg-accent/20 text-accent text-xs font-bold px-2 py-0.5">{tendenciaData.reduce((s, m) => s + m.total, 0)} NOTAS</span>
            </div>
            {tendenciaData.length === 0 ? (
              <p className="text-sm text-slate-400 mono py-4">SEM DADOS DE DATA PARA TENDÊNCIA</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tendenciaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e3a52' }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e3a52' }} />
                    <RechartsTooltip
                      cursor={{ stroke: '#00A551', strokeWidth: 1 }}
                      contentStyle={{ backgroundColor: '#0E2236', border: '1px solid #1e3a52', borderRadius: 0 }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#00A551" strokeWidth={2} dot={{ fill: '#00A551', r: 3 }} />
                    <Line type="monotone" dataKey="criticas" name="Críticas" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Notas Antigas (abertas há mais de 30 dias) */}
          <div className="mt-4 bg-[#0E2236] border-2 border-amber-400/30 p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-amber-400/20 pb-2">
              <Wrench className="text-amber-400" size={16} />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">Notas Antigas (SLA &gt; 30 dias)</h2>
              <span className="ml-auto bg-amber-400/20 text-amber-300 text-xs font-bold px-2 py-0.5">{notasAntigas.length} PENDENTES</span>
            </div>
            {notasAntigas.length === 0 ? (
              <p className="text-sm text-accent mono py-4">✓ NENHUMA NOTA ANTIGA — FLUXO DE MANUTENÇÃO SAUDÁVEL</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {notasAntigas.map(tag => {
                  const n = tag.nota_manutencao!;
                  const dias = n.data_abertura ? Math.floor((Date.now() - new Date(n.data_abertura).getTime()) / 86400000) : 0;
                  return (
                    <Link key={tag.id} to={`/tag/${tag.id}`} className="block p-3 border-2 border-amber-400/30 hover:border-amber-400 bg-[#0A1A2A] hover:bg-[#0E2236] transition-colors">
                      <p className="font-mono font-bold text-accent text-xs mb-1">{tag.tag_completo}</p>
                      <p className="text-sm text-slate-100 font-medium mb-1 truncate">{tag.nome_equipamento}</p>
                      <p className="text-xs text-slate-400 truncate">Nota: {n.numero_nota}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300">{dias} dias</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fase 20: Resumo por especialidade */}
          <div className="mt-4 bg-[#0E2236] border-2 border-accent/30 p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-accent/20 pb-2">
              <Layers className="text-accent" size={16} />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">Distribuição por Especialidade</h2>
            </div>
            {resumoEspecialidade.length === 0 ? (
              <p className="text-sm text-accent mono py-4">✓ NENHUMA NOTA POR ESPECIALIDADE</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {resumoEspecialidade.map(([esp, qtd]) => (
                  <button
                    key={esp}
                    onClick={() => setSelectedEspecialidade(esp === 'Sem espec.' ? 'todas' : esp)}
                    className="text-left p-3 border-2 border-accent/20 hover:border-accent bg-[#0A1A2A] hover:bg-[#0E2236] transition-colors"
                  >
                    <p className="text-lg font-bold text-accent mono">{qtd}</p>
                    <p className="text-[0.6rem] uppercase tracking-wider text-slate-400">{esp}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heatmap de Equipamentos Críticos */}
          <div className="mt-4 bg-[#0E2236] border-2 border-accent/30 p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-accent/20 pb-2">
              <Thermometer className="text-accent" size={16} />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">Heatmap de Equipamentos Críticos</h2>
              <span className="ml-auto bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5">{equipamentosAlerta.length} EM ALERTA</span>
              <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-0.5">{totalEquipamentos} MONIT.</span>
            </div>
            <div className="flex items-center gap-3 mb-3 text-[0.58rem] uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 border-2 border-accent/70 bg-accent/10"></span> Baixo</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 border-2 border-amber-400/70 bg-amber-400/15"></span> Médio</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 border-2 border-red-500/70 bg-red-500/15"></span> Alto</span>
              <span className="ml-auto">Cor = volume de notas abertas</span>
            </div>
            {equipamentosAlerta.length === 0 ? (
              <p className="text-sm text-accent mono py-4">✓ NENHUM EQUIPAMENTO EM ALERTA — OPERAÇÃO NOMINAL</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                {equipamentosOrdenados.map(eq => {
                  const espAplicavel = selectedEspecialidade !== 'todas'
                    && eq.espBadges.some(e => normEsp(e) === normEsp(selectedEspecialidade));
                  return (
                  <div
                    key={eq.nome}
                    onClick={() => setSelectedEquipamento(eq.nome)}
                    className={`border-2 p-3 flex flex-col gap-1 cursor-pointer transition-colors hover:brightness-125 ${heatColor(eq.notas)} ${selectedEquipamento === eq.nome ? 'ring-2 ring-accent' : ''} ${selectedEspecialidade !== 'todas' && !espAplicavel ? 'opacity-40' : ''}`}
                  >
                    <p className="text-[0.62rem] font-bold uppercase mono leading-tight truncate" title={eq.nome}>{eq.nome}</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-black mono leading-none">{eq.notas}</span>
                      <span className="text-[0.58rem] uppercase tracking-wider opacity-70">notas</span>
                    </div>
                    <span className="text-[0.58rem] uppercase tracking-wider opacity-70">{eq.tags} tags</span>
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {eq.espBadges.slice(0, 4).map((esp, i) => {
                        const ativa = selectedEspecialidade !== 'todas' && normEsp(esp) === normEsp(selectedEspecialidade);
                        return (
                          <span key={i} className={`px-1 text-[0.5rem] uppercase tracking-wider border ${ativa ? 'border-accent bg-accent text-[#0A1A2A] font-bold' : 'border-slate-500/50 text-slate-300'}`}>{esp}</span>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Selected Priority Details */}
      {selectedPriority && !loading && (
        <div className="mt-4 bg-[#0E2236] border-2 border-accent/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Equipamentos com Nota: <span className="uppercase text-accent">{selectedPriority}</span>
            </h2>
            <button onClick={() => setSelectedPriority(null)} className="text-xs text-slate-400 hover:text-slate-200">✕ FECHAR</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vistaTags.filter(t => {
              const p = (t.nota_manutencao?.prioridade || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
              return p === selectedPriority;
            }).map(tag => (
              <Link key={tag.id} to={`/tag/${tag.id}`} className="block p-3 border-2 border-accent/20 hover:border-accent bg-[#0A1A2A] hover:bg-[#0E2236] transition-colors">
                <p className="font-mono font-bold text-accent text-xs mb-1">{tag.tag_completo}</p>
                <p className="text-sm text-slate-100 font-medium mb-1 truncate">{tag.nome_equipamento}</p>
                <p className="text-xs text-slate-400 truncate">Nota: {tag.nota_manutencao?.numero_nota}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Selected Equipment Drill-down (Heatmap) */}
      {selectedEquipamento && !loading && (
        <div className="mt-4 bg-[#0E2236] border-2 border-accent/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <Thermometer size={16} className="text-accent" />
              Equipamento: <span className="uppercase text-accent mono">{selectedEquipamento}</span>
            </h2>
            <button onClick={() => setSelectedEquipamento(null)} className="text-xs text-slate-400 hover:text-slate-200">✕ FECHAR</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vistaTags.filter(t =>
              (t.nome_equipamento || 'SEM EQUIPAMENTO').trim().toUpperCase() === selectedEquipamento && t.nota_manutencao
            ).map(tag => {
              const n = tag.nota_manutencao!;
              const pNorm = (n.prioridade || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
              const pColor = PRIORIDADE_COLORS[pNorm] || '#94a3b8';
              return (
                <Link key={tag.id} to={`/tag/${tag.id}`} className="block p-3 border-2 border-accent/20 hover:border-accent bg-[#0A1A2A] hover:bg-[#0E2236] transition-colors">
                  <p className="font-mono font-bold text-accent text-xs mb-1">{tag.tag_completo}</p>
                  <p className="text-sm text-slate-100 font-medium mb-1 truncate">{tag.nome_equipamento}</p>
                  <p className="text-xs text-slate-400 truncate">Nota: {n.numero_nota}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-1.5 py-0.5 rounded text-[0.58rem] font-bold uppercase tracking-wider" style={{ backgroundColor: `${pColor}22`, color: pColor }}>{n.prioridade}</span>
                    {n.especialidade && <span className="text-[0.58rem] uppercase tracking-wider text-slate-400">{n.especialidade}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
