import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { Wrench, MapPin, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useArea } from '../contexts/AreaContext';
import { Tag, NotaManutencao } from '../types';
import * as api from '../services/api';
import { getLocalizacaoFromArea, checkAreaMatch, getAllOperationalAreas } from '../utils/hierarchy';

// Todas as áreas operacionais (derivadas do HIERARQUIA, excluindo Manutenção)
const AREAS_OPERACIONAIS = getAllOperationalAreas();

// Label de exibição — como as novas áreas já têm nome legível, usa o próprio nome
// Mantemos retrocompatibilidade com áreas antigas
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // M1-M5: filtros e ordenação da lista de notas
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState<'todas' | 'urgente' | 'alta' | 'média' | 'baixa'>('todas');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'aberta' | 'visualizada' | 'em_tratamento' | 'finalizada_manutencao'>('todos');
  const [sortBy, setSortBy] = useState<'prioridade' | 'data' | 'tag'>('prioridade');

  const normP = (p?: string) => (p || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const diasAbertos = (data?: string) => {
    if (!data) return null;
    const d = new Date(data);
    if (isNaN(d.getTime())) return null;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
  };

  useEffect(() => {
    if (user) loadData();
  }, [user, navigate, selectedArea]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAllTags();
      // Notas ativas: filtra pela área selecionada no header (ou todas as operacionais)
      const comNota = data.filter(tag => {
        const matchesArea = !selectedArea || checkAreaMatch(tag.localizacao_texto, selectedArea);
        return matchesArea && tag.nota_manutencao;
      });
      setAllTags(comNota);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // M1-M5: lista filtrada + KPIs + ordenação
  const notasFiltradas = useMemo(() => {
    let lista = [...allTags];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      lista = lista.filter(t =>
        t.tag_completo.toLowerCase().includes(q) ||
        t.nome_equipamento.toLowerCase().includes(q) ||
        (t.nota_manutencao?.descricao || '').toLowerCase().includes(q)
      );
    }
    if (filtroPrioridade !== 'todas') lista = lista.filter(t => normP(t.nota_manutencao?.prioridade) === filtroPrioridade);
    if (filtroStatus !== 'todos') lista = lista.filter(t => (t.nota_manutencao?.status_manutencao || 'aberta') === filtroStatus);

    const ordemP = { urgente: 0, alta: 1, média: 2, baixa: 3 } as const;
    if (sortBy === 'prioridade') lista.sort((a, b) => ordemP[(normP(a.nota_manutencao?.prioridade) as keyof typeof ordemP)] - ordemP[(normP(b.nota_manutencao?.prioridade) as keyof typeof ordemP)]);
    else if (sortBy === 'data') lista.sort((a, b) => new Date((b.nota_manutencao?.data_abertura || 0)).getTime() - new Date((a.nota_manutencao?.data_abertura || 0)).getTime());
    else lista.sort((a, b) => a.tag_completo.localeCompare(b.tag_completo));
    return lista;
  }, [allTags, searchQuery, filtroPrioridade, filtroStatus, sortBy]);

  const kpisNotas = useMemo(() => {
    const pendentes = allTags.filter(t => (t.nota_manutencao?.status_manutencao || 'aberta') !== 'finalizada_manutencao').length;
    const urgentes = allTags.filter(t => normP(t.nota_manutencao?.prioridade) === 'urgente' && (t.nota_manutencao?.status_manutencao || 'aberta') !== 'finalizada_manutencao').length;
    const vencidas = allTags.filter(t => {
      const st = t.nota_manutencao?.status_manutencao || 'aberta';
      if (st === 'finalizada_manutencao') return false;
      const d = diasAbertos(t.nota_manutencao?.data_abertura);
      return d !== null && d > 30;
    }).length;
    return { total: allTags.length, pendentes, urgentes, vencidas };
  }, [allTags]);

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

  // Paginação (usa a lista filtrada)
  const totalPages = Math.ceil(notasFiltradas.length / itemsPerPage);
  const paginatedTags = notasFiltradas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      </div>

      <div className="space-y-3">
        {/* M3: KPIs de resumo das notas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Abertas', value: kpisNotas.total, cls: 'bg-primary/5 border-primary/20 text-primary' },
            { label: 'Pendentes', value: kpisNotas.pendentes, cls: 'bg-muted border-border text-foreground' },
            { label: 'Urgentes', value: kpisNotas.urgentes, cls: 'bg-red-50 border-red-200 text-red-700' },
            { label: 'Vencidas >30d', value: kpisNotas.vencidas, cls: 'bg-amber-50 border-amber-200 text-amber-700' },
          ].map(k => (
            <div key={k.label} className={`border p-3 ${k.cls}`}>
              <p className="text-xs font-medium">{k.label}</p>
              <p className="text-xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>

        {/* M1+M2+M4+M5: busca + filtros + ordenação */}
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap items-center">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar TAG, equipamento ou descrição…"
            className="flex-1 min-w-[200px] px-3 py-2 rounded border border-border bg-background text-foreground text-sm outline-none focus:border-primary"
          />
          <select value={filtroPrioridade} onChange={e => setFiltroPrioridade(e.target.value as any)} className="px-3 py-2 rounded border border-border bg-background text-foreground text-sm">
            <option value="todas">Todas prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="média">Média</option>
            <option value="baixa">Baixa</option>
          </select>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as any)} className="px-3 py-2 rounded border border-border bg-background text-foreground text-sm">
            <option value="todos">Todos status</option>
            <option value="aberta">Aberta</option>
            <option value="visualizada">Visualizada</option>
            <option value="em_tratamento">Em tratamento</option>
            <option value="finalizada_manutencao">Finalizada</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-3 py-2 rounded border border-border bg-background text-foreground text-sm">
            <option value="prioridade">Ordenar: Prioridade</option>
            <option value="data">Ordenar: Data</option>
            <option value="tag">Ordenar: TAG</option>
          </select>
        </div>

        {paginatedTags.length === 0 ? (
          <div className="p-12 text-center bg-muted/10 border border-border rounded-none border-dashed">
            <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium text-foreground">Tudo limpo!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Nenhuma nota aberta {selectedArea ? ` em ${AREA_LABEL[getLocalizacaoFromArea(selectedArea)] ?? selectedArea}` : ''}.
            </p>
          </div>
        ) : (
          paginatedTags.map(tag => {
            const nota = tag.nota_manutencao!;
            const status = nota.status_manutencao || 'aberta';
            const areaLabel = AREA_LABEL[tag.localizacao_texto] ?? tag.localizacao_texto;

            return (
              <div key={tag.id} className="bg-card border border-border rounded-none p-4 shadow-sm hover:shadow-md transition-shadow">
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
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        <MapPin size={10} />
                        {areaLabel}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p><span className="font-medium text-foreground">Equipamento:</span> {tag.nome_equipamento}</p>
                      <p><span className="font-medium text-foreground">Nota:</span> {nota.numero_nota} ({nota.especialidade})</p>
                      <p><span className="font-medium text-foreground">Descrição:</span> {nota.descricao}</p>
                      <p className="text-xs mt-1.5 text-muted-foreground/70">
                        Aberta por {nota.aberta_por} em {new Date(nota.data_abertura).toLocaleDateString('pt-BR')}
                        {(() => {
                          const d = diasAbertos(nota.data_abertura);
                          if (d === null) return null;
                          const venc = d > 30;
                          return (
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${venc ? 'bg-red-600 text-white' : d > 14 ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                              {d} dias aberta{venc ? ' · SLA VENCIDO' : ''}
                            </span>
                          );
                        })()}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 pb-8">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-border rounded-none hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-border rounded-none hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

