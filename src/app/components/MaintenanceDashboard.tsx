import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Wrench, Eye, Settings, Play, CheckCircle, BarChart2, List, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useArea } from '../contexts/AreaContext';
import { Tag } from '../types';
import * as api from '../services/api';
import { getLocalizacaoFromArea } from '../utils/hierarchy';

type Especialidade = 'Mecânica' | 'Elétrica' | 'Instrumentação' | 'Automação';
type ViewMode = 'notas' | 'graficos';

const AREAS_OPERACIONAIS = ['Caldeira 2', 'ETAC 2', 'Caldeira 1', 'ETAC 1'];

const AREA_LABEL: Record<string, string> = {
  'Caldeira 2': 'CDF II',
  'ETAC 2': 'ETAC II',
  'Caldeira 1': 'CDF I',
  'ETAC 1': 'ETAC I',
};

const PRIORIDADE_COLOR: Record<string, string> = {
  urgente: '#ef4444',
  alta: '#f97316',
  média: '#eab308',
  baixa: '#3b82f6',
};

const PRIORIDADE_BG: Record<string, string> = {
  urgente: 'bg-red-600 text-white',
  alta: 'bg-orange-600 text-white',
  média: 'bg-amber-500 text-white',
  baixa: 'bg-blue-600 text-white',
};

export function MaintenanceDashboard() {
  const { user } = useAuth();
  const { selectedArea } = useArea();
  const navigate = useNavigate();

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Especialidade>('Mecânica');
  const [viewMode, setViewMode] = useState<ViewMode>('notas');

  useEffect(() => {
    if (user && user.gerencia !== 'Manutenção') {
      navigate('/admin');
      return;
    }
    if (user) loadData();
  }, [user, navigate, selectedArea]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAllTags();
      // Filtra pela área selecionada no header (ou todas as operacionais)
      const comNota = data.filter(tag => {
        const localizacao = getLocalizacaoFromArea(selectedArea);
        const matchesArea = !selectedArea || tag.localizacao_texto === localizacao;
        return matchesArea && tag.nota_manutencao && AREAS_OPERACIONAIS.includes(tag.localizacao_texto);
      });
      setAllTags(comNota);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    tagId: number,
    novoStatus: 'aberta' | 'visualizada' | 'em_tratamento' | 'finalizada_manutencao'
  ) => {
    const tag = allTags.find(t => t.id === tagId);
    if (!tag || !tag.nota_manutencao) return;
    try {
      const updatedTag = await api.updateTag(tag.id, {
        nota_manutencao: { ...tag.nota_manutencao, status_manutencao: novoStatus },
      });
      setAllTags(allTags.map(t => (t.id === tagId ? updatedTag : t)));
    } catch {
      alert('Erro ao atualizar status da nota');
    }
  };

  // allTags já está filtrado pela área do header
  const tagsByTab = allTags.filter(
    t => t.nota_manutencao?.especialidade === activeTab
  );

  const counts: Record<Especialidade, number> = {
    Mecânica: allTags.filter(t => t.nota_manutencao?.especialidade === 'Mecânica').length,
    Elétrica: allTags.filter(t => t.nota_manutencao?.especialidade === 'Elétrica').length,
    Instrumentação: allTags.filter(t => t.nota_manutencao?.especialidade === 'Instrumentação').length,
    Automação: allTags.filter(t => t.nota_manutencao?.especialidade === 'Automação').length,
  };

  // ── Dados para gráficos ──────────────────────────────────────────
  const prioridadeData = ['urgente', 'alta', 'média', 'baixa'].map(p => ({
    label: p.charAt(0).toUpperCase() + p.slice(1),
    prioridade: p,
    count: allTags.filter(t => t.nota_manutencao?.prioridade === p).length,
  }));

  const areaData = AREAS_OPERACIONAIS.map(loc => ({
    label: AREA_LABEL[loc] ?? loc,
    localizacao: loc,
    count: allTags.filter(t => t.localizacao_texto === loc).length,
  })).filter(a => a.count > 0);

  const maxPrioridade = Math.max(...prioridadeData.map(d => d.count), 1);
  const maxArea = Math.max(...areaData.map(d => d.count), 1);

  const tabs: { id: Especialidade; label: string; icon: any }[] = [
    { id: 'Mecânica', label: 'Mecânica', icon: Wrench },
    { id: 'Elétrica', label: 'Elétrica', icon: Settings },
    { id: 'Instrumentação', label: 'Instrumentação', icon: Eye },
    { id: 'Automação', label: 'Automação', icon: Play },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando painel…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Manutenção</h1>
          <p className="text-sm text-muted-foreground">
            {allTags.length} nota{allTags.length !== 1 ? 's' : ''} abertas — área: <strong>{selectedArea}</strong>
          </p>
        </div>

        {/* View toggle */}
        <div className="flex bg-muted/40 p-1 rounded-lg border border-border gap-1">
          <button
            onClick={() => setViewMode('notas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${viewMode === 'notas' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List size={14} /> Notas
          </button>
          <button
            onClick={() => setViewMode('graficos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${viewMode === 'graficos' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <BarChart2 size={14} /> Gráficos
          </button>
        </div>
      </div>


      {/* ─── MODO GRÁFICOS ─── */}
      {viewMode === 'graficos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Gráfico por criticidade */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4">Notas por Criticidade</h2>
            <div className="space-y-3">
              {prioridadeData.map(d => (
                <div key={d.prioridade} className="flex items-center gap-3">
                  <span className="w-16 text-right text-xs font-medium text-muted-foreground">{d.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{
                        width: `${(d.count / maxPrioridade) * 100}%`,
                        minWidth: d.count > 0 ? '2rem' : '0',
                        backgroundColor: PRIORIDADE_COLOR[d.prioridade],
                      }}
                    >
                      {d.count > 0 && (
                        <span className="text-white text-xs font-bold">{d.count}</span>
                      )}
                    </div>
                  </div>
                  {d.count === 0 && <span className="text-xs text-muted-foreground">0</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico por área */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4">Notas por Área</h2>
            {areaData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma nota encontrada</p>
            ) : (
              <div className="space-y-3">
                {areaData.map(d => (
                  <div key={d.localizacao} className="flex items-center gap-3">
                    <span className="w-16 text-right text-xs font-medium text-muted-foreground">{d.label}</span>
                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 bg-primary transition-all duration-500"
                        style={{ width: `${(d.count / maxArea) * 100}%`, minWidth: '2rem' }}
                      >
                        <span className="text-white text-xs font-bold">{d.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumo por especialidade */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm md:col-span-2">
            <h2 className="text-base font-semibold text-foreground mb-4">Notas por Especialidade</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <div key={tab.id} className="bg-muted/40 rounded-lg p-4 text-center border border-border">
                    <Icon size={22} className="mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-foreground">{counts[tab.id]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tab.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODO NOTAS ─── */}
      {viewMode === 'notas' && (
        <>
          {/* Especialidade tabs */}
          <div className="flex bg-muted/30 p-1.5 rounded-lg border border-border overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all min-w-[120px] ${
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Note cards */}
          <div className="space-y-3">
            {tagsByTab.length === 0 ? (
              <div className="p-12 text-center bg-muted/10 border border-border rounded-lg border-dashed">
                <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <h3 className="text-sm font-medium text-foreground">Tudo limpo!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Nenhuma nota aberta para a especialidade {activeTab}
                  {filterArea !== 'todas' ? ` em ${AREA_LABEL[filterArea] ?? filterArea}` : ''}.
                </p>
              </div>
            ) : (
              tagsByTab.map(tag => {
                const nota = tag.nota_manutencao!;
                const status = nota.status_manutencao || 'aberta';
                const areaLabel = AREA_LABEL[tag.localizacao_texto] ?? tag.localizacao_texto;

                return (
                  <div key={tag.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-base text-foreground">{tag.tag_completo}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${PRIORIDADE_BG[nota.prioridade] ?? 'bg-muted text-foreground'}`}>
                            {nota.prioridade}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            status === 'aberta' ? 'bg-red-100 text-red-800' :
                            status === 'visualizada' ? 'bg-blue-100 text-blue-800' :
                            status === 'em_tratamento' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {status.replace(/_/g, ' ')}
                          </span>
                          {/* Área/Gerência do equipamento */}
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            <MapPin size={10} />
                            {areaLabel}
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-0.5">
                          <p><span className="font-medium text-foreground">Equipamento:</span> {tag.nome_equipamento}</p>
                          <p><span className="font-medium text-foreground">Nota:</span> {nota.numero_nota}</p>
                          <p><span className="font-medium text-foreground">Descrição:</span> {nota.descricao}</p>
                          <p className="text-xs mt-1.5 text-muted-foreground/70">
                            Aberta por {nota.aberta_por} em {new Date(nota.data_abertura).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                        {status === 'aberta' && (
                          <button
                            onClick={() => handleUpdateStatus(tag.id, 'visualizada')}
                            className="flex-1 md:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors text-center"
                          >
                            Marcar Visualizado
                          </button>
                        )}
                        {(status === 'aberta' || status === 'visualizada') && (
                          <button
                            onClick={() => handleUpdateStatus(tag.id, 'em_tratamento')}
                            className="flex-1 md:flex-none px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded transition-colors text-center"
                          >
                            Iniciar Tratamento
                          </button>
                        )}
                        {(status === 'em_tratamento' || status === 'visualizada') && (
                          <button
                            onClick={() => handleUpdateStatus(tag.id, 'finalizada_manutencao')}
                            className="flex-1 md:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors text-center"
                          >
                            Sinalizar Finalizado
                          </button>
                        )}
                        {status === 'finalizada_manutencao' && (
                          <div className="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-medium rounded border border-border text-center">
                            Aguardando Validação
                          </div>
                        )}
                        <Link
                          to={`/tag/${tag.id}`}
                          className="flex-1 md:flex-none px-3 py-1.5 bg-transparent hover:bg-muted text-foreground text-xs font-medium rounded border border-border transition-colors text-center"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

