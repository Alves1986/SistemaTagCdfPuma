import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Camera, QrCode, AlertTriangle, Wrench, Tag } from 'lucide-react';
import { Tag as TagType } from '../types';
import * as api from '../services/api';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);

    if (searchQuery.trim().length >= 2) {
      try {
        setLoading(true);
        const searchResults = await api.searchTags(searchQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Erro ao buscar TAGs:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'operacional': return { bg: '#D1FAE5', text: '#065F46', dot: '#00A551' };
      case 'manutenção': return { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' };
      case 'inativo': return { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' };
    }
  };

  const getPrioridadeBadge = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente': return { bg: '#DC2626', text: '#fff' };
      case 'alta': return { bg: '#EA580C', text: '#fff' };
      case 'média': return { bg: '#D97706', text: '#fff' };
      case 'baixa': return { bg: '#003865', text: '#fff' };
      default: return { bg: '#6B7280', text: '#fff' };
    }
  };

  return (
    <div className="space-y-5">
      {/* Search box */}
      <div
        className="bg-white rounded border p-5 shadow-sm"
        style={{ borderColor: '#D1D5DB' }}
      >
        <label
          className="block mb-2 text-sm font-medium"
          style={{ color: '#2D2D2D' }}
        >
          Buscar Equipamento
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#5A5A5A' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Últimos 4 dígitos do TAG ou nome do equipamento…"
            className="w-full pl-9 pr-4 py-2.5 rounded border text-sm outline-none transition-colors"
            style={{ borderColor: '#D1D5DB', backgroundColor: '#F9FAFB', color: '#2D2D2D' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#003865'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,56,101,0.1)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
        <p className="mt-2 text-xs" style={{ color: '#5A5A5A' }}>
          Ex: <span className="font-mono">0001</span> para buscar por código &nbsp;·&nbsp; "válvula" para buscar por nome
        </p>

        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: '#E8E8E8' }}>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm font-medium transition-colors"
            style={{ borderColor: '#003865', color: '#003865', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#003865'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#003865'; }}
          >
            <QrCode size={15} />
            Escanear QR Code
          </button>
        </div>
      </div>

      {/* Results */}
      {query && (
        <div
          className="bg-white rounded border p-5 shadow-sm"
          style={{ borderColor: '#D1D5DB' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: '#2D2D2D' }}>
              Resultados da Busca
            </h2>
            {results.length > 0 && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: '#E8E8E8', color: '#5A5A5A' }}
              >
                {results.length} encontrado{results.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#003865', borderTopColor: 'transparent' }}
              />
              <p className="text-sm" style={{ color: '#5A5A5A' }}>Buscando...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search size={40} className="mx-auto mb-3" style={{ color: '#D1D5DB' }} />
              <p className="text-sm font-medium" style={{ color: '#2D2D2D' }}>Nenhum resultado encontrado</p>
              <p className="text-xs mt-1" style={{ color: '#5A5A5A' }}>
                Tente buscar pelos últimos 4 dígitos do TAG ou pelo nome do equipamento
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((tag) => {
                const status = getStatusDot(tag.status);
                const prioridade = tag.nota_manutencao ? getPrioridadeBadge(tag.nota_manutencao.prioridade) : null;
                return (
                  <Link
                    key={tag.id}
                    to={`/tag/${tag.id}`}
                    className="block rounded border overflow-hidden transition-all duration-150 hover:shadow-md"
                    style={{
                      borderColor: tag.nota_manutencao ? '#DC2626' : '#D1D5DB',
                      borderWidth: tag.nota_manutencao ? '2px' : '1px',
                    }}
                  >
                    {/* Image */}
                    <div className="relative h-40" style={{ backgroundColor: '#E8E8E8' }}>
                      {tag.foto_url ? (
                        <img
                          src={tag.foto_url}
                          alt={tag.nome_equipamento}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera size={36} style={{ color: '#9CA3AF' }} />
                        </div>
                      )}
                      {prioridade && tag.nota_manutencao && (
                        <div
                          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold shadow"
                          style={{ backgroundColor: prioridade.bg, color: prioridade.text }}
                        >
                          <AlertTriangle size={11} />
                          {tag.nota_manutencao.prioridade.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      {tag.nota_manutencao && (
                        <div
                          className="mb-2.5 p-2 rounded flex items-start gap-1.5 text-xs"
                          style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}
                        >
                          <Wrench size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
                          <div className="min-w-0">
                            <p className="font-semibold" style={{ color: '#991B1B' }}>
                              Nota: {tag.nota_manutencao.numero_nota}
                            </p>
                            <p className="truncate" style={{ color: '#B91C1C' }}>
                              {tag.nota_manutencao.descricao}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#5A5A5A' }}>TAG</p>
                          <p className="text-sm font-bold font-mono" style={{ color: '#003865' }}>
                            {tag.tag_completo}
                          </p>
                        </div>
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: status.bg, color: status.text }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: status.dot }}
                          />
                          {tag.status}
                        </div>
                      </div>

                      <p className="text-sm font-medium mb-1" style={{ color: '#2D2D2D' }}>
                        {tag.nome_equipamento}
                      </p>
                      <p className="text-xs line-clamp-1" style={{ color: '#5A5A5A' }}>
                        {tag.localizacao_texto}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state helper */}
      {!query && (
        <div
          className="bg-white rounded border p-6 shadow-sm"
          style={{ borderColor: '#D1D5DB' }}
        >
          <h2 className="font-semibold mb-4" style={{ color: '#2D2D2D' }}>
            Como usar
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div
              className="p-4 rounded border"
              style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Tag size={18} style={{ color: '#003865' }} />
                <span className="text-sm font-semibold" style={{ color: '#003865' }}>
                  Buscar por Código
                </span>
              </div>
              <p className="text-xs" style={{ color: '#1E40AF' }}>
                Digite os últimos 4 dígitos do TAG — ex: <span className="font-mono font-bold">0001</span>, <span className="font-mono font-bold">2002</span>
              </p>
            </div>
            <div
              className="p-4 rounded border"
              style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <QrCode size={18} style={{ color: '#00A551' }} />
                <span className="text-sm font-semibold" style={{ color: '#065F46' }}>
                  Escanear QR Code
                </span>
              </div>
              <p className="text-xs" style={{ color: '#166534' }}>
                Use a câmera do dispositivo para escanear o QR Code fixado no equipamento
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
