import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Tag } from '../types';
import {
  AlertTriangle, Camera, QrCode, Download, Edit, Wrench, Search,
  Plus, X, Activity, FileSpreadsheet, FileText, File, Users,
  CheckSquare, Square, Printer, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useArea } from '../contexts/AreaContext';
import * as api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

type FilterKey = 'all' | 'com_nota' | 'operacional' | 'manutenção' | 'inativo';

export function AdminPage() {
  const { user } = useAuth();
  const { selectedArea } = useArea();
  const [searchParams] = useSearchParams();

  return <AdminPageContent selectedArea={selectedArea} initialFilter={(searchParams.get('filter') as FilterKey) || 'all'} />;
}

function AdminPageContent({ selectedArea, initialFilter }: { selectedArea: string; initialFilter: FilterKey }) {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [filter, setFilter] = useState<FilterKey>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // QR modal state
  const [qrPage, setQrPage] = useState(1);
  const [qrSelected, setQrSelected] = useState<Set<number>>(new Set());
  const [tagsToPrint, setTagsToPrint] = useState<Tag[]>([]);
  const QR_PER_PAGE = 8;

  // Export modal state
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [exportFilter, setExportFilter] = useState<'all' | 'com_nota'>('all');
  const [exporting, setExporting] = useState(false);

  // Table pagination state
  const [tablePage, setTablePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    tag_completo: '',
    nome_equipamento: '',
    localizacao_texto: '',
    status: 'operacional' as 'operacional' | 'manutenção' | 'inativo',
    foto_url: '',
    area: selectedArea,
  });

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, area: selectedArea }));
  }, [selectedArea]);

  useEffect(() => {
    setTablePage(1);
  }, [searchQuery, filter, selectedArea]);

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

  const filteredTags = areaTags.filter(tag => {
    const matchesSearch = searchQuery.trim() === '' ||
      tag.tag_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.nome_equipamento.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'com_nota') return matchesSearch && !!tag.nota_manutencao;
    return matchesSearch && tag.status === filter;
  });

  const sortedTags = [...filteredTags].sort((a, b) => {
    const matchA = a.tag_completo.match(/\d{4}$/);
    const matchB = b.tag_completo.match(/\d{4}$/);
    const numA = matchA ? parseInt(matchA[0], 10) : 0;
    const numB = matchB ? parseInt(matchB[0], 10) : 0;
    if (numA !== numB) return numA - numB;
    return a.tag_completo.localeCompare(b.tag_completo);
  });

  const totalPages = Math.max(1, Math.ceil(sortedTags.length / itemsPerPage));
  const paginatedTags = sortedTags.slice((tablePage - 1) * itemsPerPage, tablePage * itemsPerPage);

  const tagsComNota = areaTags.filter(t => t.nota_manutencao).length;
  const tagsOperacionais = areaTags.filter(t => t.status === 'operacional').length;
  const tagsManutencao = areaTags.filter(t => t.status === 'manutenção').length;
  const tagsInativos = areaTags.filter(t => t.status === 'inativo').length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'operacional': return { container: 'bg-accent/10 text-accent', dot: 'bg-accent' };
      case 'manutenção': return { container: 'bg-amber-100 text-amber-800', dot: 'bg-amber-600' };
      case 'inativo': return { container: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' };
      default: return { container: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' };
    }
  };

  const getPrioridadeStyle = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-destructive text-destructive-foreground';
      case 'alta': return 'bg-orange-600 text-white';
      case 'média': return 'bg-amber-600 text-white';
      case 'baixa': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted-foreground text-white';
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const ultimos4Match = formData.tag_completo.match(/\d{4}$/);
    if (!ultimos4Match) {
      alert('O TAG deve terminar com 4 dígitos (ex: CAL-BOI-0001)');
      return;
    }
    try {
      const newTag = await api.createTag({
        tag_completo: formData.tag_completo,
        nome_equipamento: formData.nome_equipamento,
        localizacao_texto: formData.localizacao_texto,
        status: formData.status,
        foto_url: formData.foto_url || undefined,
        user_nome: user?.nome
      });
      setTags([newTag, ...tags]);
      setShowCreateModal(false);
      setFormData({ tag_completo: '', nome_equipamento: '', localizacao_texto: '', status: 'operacional', foto_url: '', area: selectedArea });
    } catch (error) {
      console.error('Erro ao criar TAG:', error);
      alert('Erro ao criar TAG. Tente novamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1200));
    const exportData = exportFilter === 'com_nota' ? tags.filter(t => t.nota_manutencao) : tags;
    const csv = [
      ['TAG', 'Nome', 'Localização', 'Status', 'Nota', 'Prioridade', 'Atualizado em'].join(';'),
      ...exportData.map(t => [
        t.tag_completo,
        t.nome_equipamento,
        t.localizacao_texto,
        t.status,
        t.nota_manutencao?.numero_nota ?? '',
        t.nota_manutencao?.prioridade ?? '',
        formatDate(t.atualizado_em),
      ].join(';'))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `klabin-tags-${new Date().toISOString().slice(0, 10)}.${exportFormat === 'csv' ? 'csv' : exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    setShowExportModal(false);
  };

  const toggleQrSelect = (id: number) => {
    setQrSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (qrSelected.size === tags.length) {
      setQrSelected(new Set());
    } else {
      setQrSelected(new Set(tags.map(t => t.id)));
    }
  };

  const qrTotalPages = Math.ceil(tags.length / QR_PER_PAGE);
  const qrPagedTags = tags.slice((qrPage - 1) * QR_PER_PAGE, qrPage * QR_PER_PAGE);

  const inputClass = "w-full px-3 py-2.5 rounded border border-border bg-muted/30 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

  const filterButtons: Array<{ key: FilterKey; label: string; activeClass: string }> = [
    { key: 'all', label: 'Todos', activeClass: 'bg-primary text-primary-foreground' },
    { key: 'com_nota', label: 'Com Nota', activeClass: 'bg-destructive text-destructive-foreground' },
    { key: 'operacional', label: 'Operacional', activeClass: 'bg-accent text-accent-foreground' },
    { key: 'manutenção', label: 'Manutenção', activeClass: 'bg-amber-600 text-white' },
    { key: 'inativo', label: 'Inativo', activeClass: 'bg-muted-foreground text-white' },
  ];

  const isAdmin = ['Operador Lider', 'Coordenador', 'Especialista', 'Engenheiro', 'Assistente Tecnico'].includes(user?.cargo || '');

  return (
    <>
      <div className="space-y-5 print:hidden">
        {/* Header card */}
      <div className="bg-card rounded border border-border p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h1 className="font-semibold text-foreground text-[1.1rem]">
              Gestão de TAGs
              <span className="ml-2 text-xs font-normal text-muted-foreground">— {selectedArea}</span>
            </h1>
            <p className="text-sm mt-0.5 text-muted-foreground">
              Monitoramento e gerenciamento de equipamentos
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
            >
              <Plus size={15} />
              Criar TAG
            </button>
            <button
              onClick={() => { setQrPage(1); setQrSelected(new Set()); setShowQrModal(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded border border-primary text-primary text-sm font-medium transition-colors bg-transparent hover:bg-primary hover:text-primary-foreground"
            >
              <QrCode size={15} />
              QR Codes
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded border border-accent text-accent text-sm font-medium transition-colors bg-transparent hover:bg-accent hover:text-accent-foreground"
            >
              <Download size={15} />
              Exportar
            </button>
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded border border-border text-muted-foreground text-sm font-medium transition-colors bg-transparent hover:bg-muted">
                  <Activity size={15} />
                  Dashboard
                </Link>
                <Link to="/admin/team" className="flex items-center gap-1.5 px-3 py-2 rounded border border-border text-muted-foreground text-sm font-medium transition-colors bg-transparent hover:bg-muted">
                  <Users size={15} />
                  Equipe
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: areaTags.length, style: 'bg-primary/5 border-primary/20 text-primary', icon: <Activity size={16} /> },
            { label: 'Com Nota', value: tagsComNota, style: 'bg-destructive/5 border-destructive/20 text-destructive', icon: <AlertTriangle size={16} /> },
            { label: 'Operacionais', value: tagsOperacionais, style: 'bg-accent/5 border-accent/20 text-accent', icon: null },
            { label: 'Manutenção', value: tagsManutencao, style: 'bg-amber-100 border-amber-200 text-amber-800', icon: <Wrench size={16} /> },
            { label: 'Inativos', value: tagsInativos, style: 'bg-muted border-border text-muted-foreground', icon: null },
          ].map(stat => (
            <div key={stat.label} className={`rounded border p-3 ${stat.style}`}>
              <div className="flex items-center gap-1.5 mb-1">
                {stat.icon}
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & filters */}
      <div className="bg-card rounded border border-border p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por TAG ou equipamento…"
            className={`${inputClass} pl-8`}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                filter === btn.key ? btn.activeClass : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted border-b border-border">
                {['TAG / Equipamento', 'Área', 'Localização', 'Status', 'Nota Manutenção', 'Atualização', 'Ações'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Carregando equipamentos…</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedTags.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="text-sm text-muted-foreground">Nenhum equipamento encontrado</p>
                  </td>
                </tr>
              ) : (
                paginatedTags.map((tag) => {
                  const statusStyle = getStatusStyle(tag.status);
                  const priorStyle = tag.nota_manutencao ? getPrioridadeStyle(tag.nota_manutencao.prioridade) : null;
                  return (
                    <tr key={tag.id} className={tag.nota_manutencao ? 'bg-destructive/5' : 'even:bg-muted/30'}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-muted">
                            {tag.foto_url ? (
                              <img src={tag.foto_url} alt={tag.nome_equipamento} className="w-full h-full object-cover" />
                            ) : (
                              <Camera size={16} className="text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold font-mono text-primary">{tag.tag_completo}</p>
                            <p className="text-sm text-foreground">{tag.nome_equipamento}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/20">
                          {selectedArea}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-muted-foreground">{tag.localizacao_texto}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${statusStyle.container}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {tag.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {tag.nota_manutencao && priorStyle ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle size={13} className="text-destructive" />
                              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${priorStyle}`}>
                                {tag.nota_manutencao.prioridade.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-foreground">{tag.nota_manutencao.numero_nota}</p>
                            <p className="text-xs line-clamp-1 text-muted-foreground">{tag.nota_manutencao.descricao}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-muted-foreground">{formatDate(tag.atualizado_em)}</p>
                        {tag.atualizado_por && (
                          <p className="text-xs text-muted-foreground/80">por {tag.atualizado_por}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/tag/${tag.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          <Edit size={12} />
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="bg-muted/30 border-t border-border px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Exibir</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setTablePage(1);
              }}
              className="text-sm border border-border rounded bg-background px-2 py-1 outline-none focus:border-primary"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-muted-foreground">por página</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Página {tablePage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTablePage(p => Math.max(1, p - 1))}
                disabled={tablePage === 1}
                className="px-2 py-1 rounded border border-border text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-background"
              >
                Anterior
              </button>
              <button
                onClick={() => setTablePage(p => Math.min(totalPages, p + 1))}
                disabled={tablePage === totalPages}
                className="px-2 py-1 rounded border border-border text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-background"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance note cards */}
      {tagsComNota > 0 && (
        <div className="bg-card rounded border border-border p-5 shadow-sm">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
            <AlertTriangle size={17} className="text-destructive" />
            Equipamentos com Nota de Manutenção Aberta
            <span className="ml-1 px-2 py-0.5 rounded text-xs font-bold bg-destructive/10 text-destructive">
              {tagsComNota}
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tags.filter(t => t.nota_manutencao).map((tag) => {
              const priorStyle = getPrioridadeStyle(tag.nota_manutencao?.prioridade);
              return (
                <Link
                  key={tag.id}
                  to={`/tag/${tag.id}`}
                  className="block rounded border-2 border-destructive p-4 transition-shadow hover:shadow-md bg-destructive/5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-0.5 text-muted-foreground">TAG</p>
                      <p className="text-sm font-bold font-mono text-primary">{tag.tag_completo}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorStyle}`}>
                      {tag.nota_manutencao?.prioridade.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2 text-foreground">{tag.nome_equipamento}</p>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    <p><span className="font-medium text-foreground">Nota:</span> {tag.nota_manutencao?.numero_nota}</p>
                    <p className="line-clamp-2 text-muted-foreground/80">{tag.nota_manutencao?.descricao}</p>
                    <p className="text-xs text-muted-foreground/60">
                      Aberta em: {tag.nota_manutencao && formatDate(tag.nota_manutencao.data_abertura)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Create TAG Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50">
          <div className="bg-card rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-card px-5 py-4 flex items-center justify-between border-b border-border">
              <h2 className="font-semibold text-foreground">Criar Novo TAG</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded transition-colors text-muted-foreground hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTag} className="p-5 space-y-4">
              {[
                { id: 'tag_completo', label: 'TAG Completo *', placeholder: 'Ex: CAL-BOI-0001', hint: 'Deve terminar com 4 dígitos', type: 'text', required: true },
                { id: 'nome_equipamento', label: 'Nome do Equipamento *', placeholder: 'Ex: Válvula de Alívio B01', type: 'text', required: true },
                { id: 'foto_url', label: 'URL da Foto (opcional)', placeholder: 'https://exemplo.com/foto.jpg', hint: 'URL completa da imagem', type: 'url', required: false },
              ].map(field => (
                <div key={field.id}>
                  <label className="block mb-1.5 text-sm font-medium text-foreground">{field.label}</label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    required={field.required}
                    value={(formData as any)[field.id]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                  {(field as any).hint && <p className="mt-1 text-xs text-muted-foreground">{(field as any).hint}</p>}
                </div>
              ))}

              <div>
                <label className="block mb-1.5 text-sm font-medium text-foreground">Localização *</label>
                <textarea
                  name="localizacao_texto"
                  required
                  value={formData.localizacao_texto}
                  onChange={handleInputChange}
                  placeholder="Ex: Casa de Máquinas – Tubulação 3"
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-foreground">Área *</label>
                <select name="area" value={formData.area} onChange={handleInputChange} className={inputClass}>
                  {['CDF II', 'ETAC II', 'CDF I', 'ETAC I'].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-foreground">Status *</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>
                  <option value="operacional">Operacional</option>
                  <option value="manutenção">Manutenção</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded border border-border text-muted-foreground text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
                >
                  <Plus size={15} />
                  Criar TAG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QR Codes Modal ── */}
      {showQrModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50">
          <div className="bg-card rounded shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-card px-5 py-4 flex items-center justify-between border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <QrCode size={16} className="text-primary" />
                Gerenciar QR Codes
              </h2>
              <button onClick={() => setShowQrModal(false)} className="p-1 rounded transition-colors text-muted-foreground hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {/* Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  {qrSelected.size === areaTags.length ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} />}
                  {qrSelected.size === areaTags.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
                {qrSelected.size > 0 && (
                  <button
                    onClick={() => {
                      setTagsToPrint(areaTags.filter(t => qrSelected.has(t.id)));
                      setTimeout(() => window.print(), 150);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Printer size={14} />
                    Gerar QR Selecionados ({qrSelected.size})
                  </button>
                )}
                <button
                  onClick={() => {
                    setTagsToPrint(areaTags);
                    setTimeout(() => window.print(), 150);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-accent text-accent text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
                >
                  <Printer size={14} />
                  Imprimir Todos
                </button>
              </div>

              {/* Tag list */}
              <div className="divide-y divide-border border border-border rounded">
                {qrPagedTags.map(tag => (
                  <div
                    key={tag.id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer ${qrSelected.has(tag.id) ? 'bg-primary/5' : ''}`}
                    onClick={() => toggleQrSelect(tag.id)}
                  >
                    <div className="flex-shrink-0">
                      {qrSelected.has(tag.id) ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : (
                        <Square size={18} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold font-mono text-primary">{tag.tag_completo}</p>
                      <p className="text-sm text-foreground truncate">{tag.nome_equipamento}</p>
                      <p className="text-xs text-muted-foreground">{tag.localizacao_texto}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-foreground/5 rounded border border-border flex items-center justify-center">
                        <QrCode size={20} className="text-foreground/40" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {qrTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => setQrPage(p => Math.max(1, p - 1))}
                    disabled={qrPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded border border-border text-sm text-muted-foreground disabled:opacity-40 hover:bg-muted transition-colors"
                  >
                    <ChevronLeft size={14} />
                    Anterior
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Página {qrPage} de {qrTotalPages}
                  </span>
                  <button
                    onClick={() => setQrPage(p => Math.min(qrTotalPages, p + 1))}
                    disabled={qrPage === qrTotalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded border border-border text-sm text-muted-foreground disabled:opacity-40 hover:bg-muted transition-colors"
                  >
                    Próxima
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Export Modal ── */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50">
          <div className="bg-card rounded shadow-2xl w-full max-w-sm border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Download size={16} className="text-primary" />
                Exportar dados
              </h2>
              <button onClick={() => setShowExportModal(false)} className="p-1 rounded transition-colors text-muted-foreground hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Formato</p>
                <div className="space-y-2">
                  {[
                    { value: 'xlsx', label: 'Excel (.xlsx)', Icon: FileSpreadsheet },
                    { value: 'csv', label: 'CSV', Icon: File },
                    { value: 'pdf', label: 'PDF — Relatório de manutenção', Icon: FileText },
                  ].map(({ value, label, Icon }) => (
                    <label key={value} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted transition-colors">
                      <input
                        type="radio"
                        name="exportFormat"
                        value={value}
                        checked={exportFormat === value}
                        onChange={() => setExportFormat(value as any)}
                        className="accent-primary"
                      />
                      <Icon size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Dados</p>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Todos os TAGs' },
                    { value: 'com_nota', label: 'Apenas TAGs com nota aberta' },
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted transition-colors">
                      <input
                        type="radio"
                        name="exportFilter"
                        value={value}
                        checked={exportFilter === value}
                        onChange={() => setExportFilter(value as any)}
                        className="accent-primary"
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 py-2.5 rounded border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
                >
                  {exporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gerando…
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      Gerar arquivo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ── Hidden Print View ── */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] overflow-visible">
        {Array.from({ length: Math.ceil(tagsToPrint.length / 9) }, (_, i) => tagsToPrint.slice(i * 9, i * 9 + 9)).map((pageTags, pageIndex, arr) => (
          <div key={pageIndex} className="grid grid-cols-3 gap-6 p-6 print:p-6" style={{ pageBreakAfter: pageIndex < arr.length - 1 ? 'always' : 'auto' }}>
            {pageTags.map(tag => (
              <div key={tag.id} className="flex flex-col items-center justify-center p-4 border-2 border-black rounded-lg break-inside-avoid shadow-none h-[290px]">
                <QRCodeSVG value={`${window.location.origin}/tag/${tag.id}`} size={140} level="H" />
                <div className="mt-4 text-center">
                  <p className="font-bold text-[1.1rem] font-mono text-black">{tag.tag_completo}</p>
                  <p className="text-[0.8rem] font-bold text-black uppercase leading-tight line-clamp-2 mt-1">{tag.nome_equipamento}</p>
                  <p className="text-[0.7rem] text-gray-600 mt-1 font-semibold">{tag.localizacao_texto} • KLABIN</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
