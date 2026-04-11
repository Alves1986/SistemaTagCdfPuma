import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { mockTags } from '../mockData';
import { Tag } from '../types';
import { AlertTriangle, Camera, QrCode, Download, Filter, Edit, Wrench, Search, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AdminPage() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>(() => {
    const savedTags = localStorage.getItem('tags');
    return savedTags ? JSON.parse(savedTags) : mockTags;
  });
  const [filter, setFilter] = useState<'all' | 'com_nota' | 'operacional' | 'manutenção' | 'inativo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    tag_completo: '',
    nome_equipamento: '',
    localizacao_texto: '',
    status: 'operacional' as 'operacional' | 'manutenção' | 'inativo',
    foto_url: ''
  });

  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  const filteredTags = tags.filter(tag => {
    // Filtro de busca
    const matchesSearch = searchQuery.trim() === '' || 
      tag.tag_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.nome_equipamento.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro de status
    if (filter === 'all') return matchesSearch;
    if (filter === 'com_nota') return matchesSearch && !!tag.nota_manutencao;
    return matchesSearch && tag.status === filter;
  });

  const tagsComNota = tags.filter(t => t.nota_manutencao).length;
  const tagsOperacionais = tags.filter(t => t.status === 'operacional').length;
  const tagsManutencao = tags.filter(t => t.status === 'manutenção').length;
  const tagsInativos = tags.filter(t => t.status === 'inativo').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operacional':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'manutenção':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inativo':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente':
        return 'bg-red-600 text-white';
      case 'alta':
        return 'bg-orange-600 text-white';
      case 'média':
        return 'bg-yellow-600 text-white';
      case 'baixa':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();

    // Extrair últimos 4 dígitos do TAG
    const ultimos4Match = formData.tag_completo.match(/\d{4}$/);
    if (!ultimos4Match) {
      alert('O TAG deve terminar com 4 dígitos (ex: CAL-BOI-0001)');
      return;
    }

    const newTag: Tag = {
      id: Math.max(...tags.map(t => t.id)) + 1,
      tag_completo: formData.tag_completo,
      ultimos4: ultimos4Match[0],
      nome_equipamento: formData.nome_equipamento,
      localizacao_texto: formData.localizacao_texto,
      status: formData.status,
      foto_url: formData.foto_url || undefined,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      atualizado_por: user?.nome
    };

    setTags([...tags, newTag]);
    setShowCreateModal(false);
    setFormData({
      tag_completo: '',
      nome_equipamento: '',
      localizacao_texto: '',
      status: 'operacional',
      foto_url: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de TAGs</h1>
            <p className="text-gray-600 mt-1">Gerenciamento e monitoramento de equipamentos</p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Criar TAG
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <QrCode size={20} />
              Gerar QR Codes
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download size={20} />
              Exportar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Filter size={20} />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{tags.length}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <AlertTriangle size={20} />
              <span className="text-sm font-medium">Com Nota</span>
            </div>
            <p className="text-2xl font-bold text-red-900">{tagsComNota}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <span className="text-sm font-medium">Operacionais</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{tagsOperacionais}</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-700 mb-1">
              <Wrench size={20} />
              <span className="text-sm font-medium">Em Manutenção</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">{tagsManutencao}</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-700 mb-1">
              <span className="text-sm font-medium">Inativos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{tagsInativos}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por TAG ou nome do equipamento..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('com_nota')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'com_nota'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Com Nota
            </button>
            <button
              onClick={() => setFilter('operacional')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'operacional'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Operacional
            </button>
            <button
              onClick={() => setFilter('manutenção')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'manutenção'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manutenção
            </button>
            <button
              onClick={() => setFilter('inativo')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'inativo'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inativo
            </button>
          </div>
        </div>
      </div>

      {/* Tags Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TAG / Equipamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nota Manutenção
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Atualização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Filter className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>Nenhum equipamento encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag) => (
                  <tr 
                    key={tag.id}
                    className={`hover:bg-gray-50 ${tag.nota_manutencao ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          {tag.foto_url ? (
                            <img 
                              src={tag.foto_url} 
                              alt={tag.nome_equipamento}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Camera className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-600">{tag.tag_completo}</p>
                          <p className="text-sm text-gray-900">{tag.nome_equipamento}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{tag.localizacao_texto}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tag.status)}`}>
                        {tag.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {tag.nota_manutencao ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPrioridadeColor(tag.nota_manutencao.prioridade)}`}>
                              {tag.nota_manutencao.prioridade.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-900">{tag.nota_manutencao.numero_nota}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{tag.nota_manutencao.descricao}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{formatDate(tag.atualizado_em)}</p>
                      {tag.atualizado_por && (
                        <p className="text-xs text-gray-500">por {tag.atualizado_por}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/tag/${tag.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        <Edit size={14} />
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards for Tags with Notes */}
      {tagsComNota > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={20} />
            Equipamentos com Nota de Manutenção Aberta ({tagsComNota})
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.filter(t => t.nota_manutencao).map((tag) => (
              <Link
                key={tag.id}
                to={`/tag/${tag.id}`}
                className="block border-2 border-red-500 rounded-lg p-4 hover:shadow-lg transition-shadow bg-red-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">TAG</p>
                    <p className="font-semibold text-blue-600">{tag.tag_completo}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getPrioridadeColor(tag.nota_manutencao?.prioridade)}`}>
                    {tag.nota_manutencao?.prioridade.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{tag.nome_equipamento}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    <strong>Nota:</strong> {tag.nota_manutencao?.numero_nota}
                  </p>
                  <p className="text-gray-600 line-clamp-2">
                    {tag.nota_manutencao?.descricao}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Aberta em: {tag.nota_manutencao && formatDate(tag.nota_manutencao.data_abertura)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Criação de TAG */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Criar Novo TAG</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateTag} className="p-6 space-y-6">
              {/* TAG Completo */}
              <div>
                <label htmlFor="tag_completo" className="block text-sm font-medium text-gray-700 mb-2">
                  TAG Completo *
                </label>
                <input
                  id="tag_completo"
                  name="tag_completo"
                  type="text"
                  required
                  value={formData.tag_completo}
                  onChange={handleInputChange}
                  placeholder="Ex: CAL-BOI-0001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Deve terminar com 4 dígitos (ex: CAL-BOI-0001)
                </p>
              </div>

              {/* Nome do Equipamento */}
              <div>
                <label htmlFor="nome_equipamento" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Equipamento *
                </label>
                <input
                  id="nome_equipamento"
                  name="nome_equipamento"
                  type="text"
                  required
                  value={formData.nome_equipamento}
                  onChange={handleInputChange}
                  placeholder="Ex: Válvula de Alívio B01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Localização */}
              <div>
                <label htmlFor="localizacao_texto" className="block text-sm font-medium text-gray-700 mb-2">
                  Localização *
                </label>
                <textarea
                  id="localizacao_texto"
                  name="localizacao_texto"
                  required
                  value={formData.localizacao_texto}
                  onChange={handleInputChange}
                  placeholder="Ex: Casa de Máquinas - Tubulação 3"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="operacional">Operacional</option>
                  <option value="manutenção">Manutenção</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              {/* URL da Foto (Opcional) */}
              <div>
                <label htmlFor="foto_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Foto (Opcional)
                </label>
                <input
                  id="foto_url"
                  name="foto_url"
                  type="url"
                  value={formData.foto_url}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Insira uma URL de imagem válida ou deixe em branco
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
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
