import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Tag } from '../types';
import { AlertTriangle, Camera, QrCode, Download, Edit, Wrench, Search, Plus, X, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

export function AdminPage() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [filter, setFilter] = useState<'all' | 'com_nota' | 'operacional' | 'manutenção' | 'inativo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    tag_completo: '',
    nome_equipamento: '',
    localizacao_texto: '',
    status: 'operacional' as 'operacional' | 'manutenção' | 'inativo',
    foto_url: ''
  });

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

  const filteredTags = tags.filter(tag => {
    const matchesSearch = searchQuery.trim() === '' ||
      tag.tag_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.nome_equipamento.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'com_nota') return matchesSearch && !!tag.nota_manutencao;
    return matchesSearch && tag.status === filter;
  });

  const tagsComNota = tags.filter(t => t.nota_manutencao).length;
  const tagsOperacionais = tags.filter(t => t.status === 'operacional').length;
  const tagsManutencao = tags.filter(t => t.status === 'manutenção').length;
  const tagsInativos = tags.filter(t => t.status === 'inativo').length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'operacional': return { bg: '#D1FAE5', text: '#065F46', dot: '#00A551' };
      case 'manutenção': return { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' };
      case 'inativo': return { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' };
    }
  };

  const getPrioridadeStyle = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente': return { bg: '#DC2626', text: '#fff' };
      case 'alta': return { bg: '#EA580C', text: '#fff' };
      case 'média': return { bg: '#D97706', text: '#fff' };
      case 'baixa': return { bg: '#003865', text: '#fff' };
      default: return { bg: '#6B7280', text: '#fff' };
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
      setFormData({ tag_completo: '', nome_equipamento: '', localizacao_texto: '', status: 'operacional', foto_url: '' });
    } catch (error) {
      console.error('Erro ao criar TAG:', error);
      alert('Erro ao criar TAG. Tente novamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const inputClass = "w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors";
  const inputStyle = { borderColor: '#D1D5DB', color: '#2D2D2D', backgroundColor: '#F9FAFB' };

  const filterButtons: Array<{ key: typeof filter; label: string; activeColor: string }> = [
    { key: 'all', label: 'Todos', activeColor: '#003865' },
    { key: 'com_nota', label: 'Com Nota', activeColor: '#DC2626' },
    { key: 'operacional', label: 'Operacional', activeColor: '#00A551' },
    { key: 'manutenção', label: 'Manutenção', activeColor: '#D97706' },
    { key: 'inativo', label: 'Inativo', activeColor: '#5A5A5A' },
  ];

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div
        className="bg-white rounded border p-5 shadow-sm"
        style={{ borderColor: '#D1D5DB' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h1 className="font-semibold" style={{ color: '#2D2D2D', fontSize: '1.1rem' }}>
              Gestão de TAGs
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#5A5A5A' }}>
              Monitoramento e gerenciamento de equipamentos
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: '#003865' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#002850'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#003865'; }}
            >
              <Plus size={15} />
              Criar TAG
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded border text-sm font-medium transition-colors"
              style={{ borderColor: '#003865', color: '#003865', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#003865'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#003865'; }}
            >
              <QrCode size={15} />
              QR Codes
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded border text-sm font-medium transition-colors"
              style={{ borderColor: '#00A551', color: '#00A551', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00A551'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#00A551'; }}
            >
              <Download size={15} />
              Exportar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: tags.length, bg: '#EFF6FF', text: '#1E40AF', icon: <Activity size={16} /> },
            { label: 'Com Nota', value: tagsComNota, bg: '#FEF2F2', text: '#991B1B', icon: <AlertTriangle size={16} /> },
            { label: 'Operacionais', value: tagsOperacionais, bg: '#F0FDF4', text: '#065F46', icon: null },
            { label: 'Manutenção', value: tagsManutencao, bg: '#FFFBEB', text: '#92400E', icon: <Wrench size={16} /> },
            { label: 'Inativos', value: tagsInativos, bg: '#F9FAFB', text: '#374151', icon: null },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded border p-3"
              style={{ backgroundColor: stat.bg, borderColor: `${stat.text}30` }}
            >
              <div className="flex items-center gap-1.5 mb-1" style={{ color: stat.text }}>
                {stat.icon}
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: stat.text }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & filters */}
      <div
        className="bg-white rounded border p-4 shadow-sm flex flex-col sm:flex-row gap-3"
        style={{ borderColor: '#D1D5DB' }}
      >
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5A5A5A' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por TAG ou equipamento…"
            className={inputClass + ' pl-8'}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#003865'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,56,101,0.1)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
              style={
                filter === btn.key
                  ? { backgroundColor: btn.activeColor, color: '#fff' }
                  : { backgroundColor: '#E8E8E8', color: '#5A5A5A' }
              }
              onMouseEnter={(e) => { if (filter !== btn.key) e.currentTarget.style.backgroundColor = '#D1D5DB'; }}
              onMouseLeave={(e) => { if (filter !== btn.key) e.currentTarget.style.backgroundColor = '#E8E8E8'; }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded border shadow-sm overflow-hidden"
        style={{ borderColor: '#D1D5DB' }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ backgroundColor: '#F4F5F7', borderBottom: '1px solid #D1D5DB' }}>
                {['TAG / Equipamento', 'Localização', 'Status', 'Nota Manutenção', 'Atualização', 'Ações'].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#5A5A5A' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: '#003865', borderTopColor: 'transparent' }}
                      />
                      <p className="text-sm" style={{ color: '#5A5A5A' }}>Carregando equipamentos…</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-sm" style={{ color: '#5A5A5A' }}>Nenhum equipamento encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag, idx) => {
                  const statusStyle = getStatusStyle(tag.status);
                  const priorStyle = tag.nota_manutencao ? getPrioridadeStyle(tag.nota_manutencao.prioridade) : null;
                  return (
                    <tr
                      key={tag.id}
                      style={{
                        backgroundColor: tag.nota_manutencao ? '#FFF5F5' : idx % 2 === 0 ? '#fff' : '#FAFAFA',
                        borderBottom: '1px solid #E8E8E8',
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 overflow-hidden"
                            style={{ backgroundColor: '#E8E8E8' }}
                          >
                            {tag.foto_url ? (
                              <img src={tag.foto_url} alt={tag.nome_equipamento} className="w-full h-full object-cover" />
                            ) : (
                              <Camera size={16} style={{ color: '#9CA3AF' }} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold font-mono" style={{ color: '#003865' }}>{tag.tag_completo}</p>
                            <p className="text-sm" style={{ color: '#2D2D2D' }}>{tag.nome_equipamento}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm" style={{ color: '#5A5A5A' }}>{tag.localizacao_texto}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
                          {tag.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {tag.nota_manutencao && priorStyle ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle size={13} style={{ color: '#DC2626' }} />
                              <span
                                className="px-1.5 py-0.5 rounded text-xs font-bold"
                                style={{ backgroundColor: priorStyle.bg, color: priorStyle.text }}
                              >
                                {tag.nota_manutencao.prioridade.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs font-medium" style={{ color: '#2D2D2D' }}>{tag.nota_manutencao.numero_nota}</p>
                            <p className="text-xs line-clamp-1" style={{ color: '#5A5A5A' }}>{tag.nota_manutencao.descricao}</p>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs" style={{ color: '#5A5A5A' }}>{formatDate(tag.atualizado_em)}</p>
                        {tag.atualizado_por && (
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>por {tag.atualizado_por}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/tag/${tag.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium text-white transition-colors"
                          style={{ backgroundColor: '#003865' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#002850'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#003865'; }}
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
      </div>

      {/* Maintenance note cards */}
      {tagsComNota > 0 && (
        <div
          className="bg-white rounded border p-5 shadow-sm"
          style={{ borderColor: '#D1D5DB' }}
        >
          <h2
            className="font-semibold mb-4 flex items-center gap-2"
            style={{ color: '#2D2D2D' }}
          >
            <AlertTriangle size={17} style={{ color: '#DC2626' }} />
            Equipamentos com Nota de Manutenção Aberta
            <span
              className="ml-1 px-2 py-0.5 rounded text-xs font-bold"
              style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
            >
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
                  className="block rounded border-2 p-4 transition-shadow hover:shadow-md"
                  style={{ borderColor: '#DC2626', backgroundColor: '#FFF5F5' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#5A5A5A' }}>TAG</p>
                      <p className="text-sm font-bold font-mono" style={{ color: '#003865' }}>{tag.tag_completo}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ backgroundColor: priorStyle.bg, color: priorStyle.text }}
                    >
                      {tag.nota_manutencao?.prioridade.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#2D2D2D' }}>{tag.nome_equipamento}</p>
                  <div className="space-y-0.5 text-xs" style={{ color: '#5A5A5A' }}>
                    <p><span className="font-medium">Nota:</span> {tag.nota_manutencao?.numero_nota}</p>
                    <p className="line-clamp-2">{tag.nota_manutencao?.descricao}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      Aberta em: {tag.nota_manutencao && formatDate(tag.nota_manutencao.data_abertura)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Create TAG Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div
            className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ border: '1px solid #D1D5DB' }}
          >
            <div
              className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between border-b"
              style={{ borderColor: '#E8E8E8' }}
            >
              <h2 className="font-semibold" style={{ color: '#2D2D2D' }}>Criar Novo TAG</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded transition-colors"
                style={{ color: '#5A5A5A' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E8E8E8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
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
                  <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>{field.label}</label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    required={field.required}
                    value={(formData as any)[field.id]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#003865'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,56,101,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  {(field as any).hint && (
                    <p className="mt-1 text-xs" style={{ color: '#5A5A5A' }}>{(field as any).hint}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>Localização *</label>
                <textarea
                  name="localizacao_texto"
                  required
                  value={formData.localizacao_texto}
                  onChange={handleInputChange}
                  placeholder="Ex: Casa de Máquinas – Tubulação 3"
                  rows={3}
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#003865'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,56,101,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#003865'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,56,101,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <option value="operacional">Operacional</option>
                  <option value="manutenção">Manutenção</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#E8E8E8' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded border text-sm font-medium transition-colors"
                  style={{ borderColor: '#D1D5DB', color: '#5A5A5A' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F4F5F7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-white text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#003865' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#002850'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#003865'; }}
                >
                  <Plus size={15} />
                  Criar TAG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
