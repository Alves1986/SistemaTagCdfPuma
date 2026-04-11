import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Camera, QrCode, AlertTriangle, Wrench } from 'lucide-react';
import { searchTags } from '../mockData';
import { Tag } from '../types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tag[]>([]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim().length >= 2) {
      const searchResults = searchTags(searchQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operacional':
        return 'bg-green-100 text-green-800';
      case 'manutenção':
        return 'bg-yellow-100 text-yellow-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
          <div className="flex-1 w-full">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar TAG
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Digite últimos 4 dígitos ou nome do equipamento"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Exemplos: "0001" (últimos 4 dígitos) ou "válvula" (nome do equipamento)
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <QrCode size={20} />
            <span>Escanear QR</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {query && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resultados da Busca {results.length > 0 && `(${results.length})`}
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente buscar por outros termos ou pelos últimos 4 dígitos do TAG
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/tag/${tag.id}`}
                  className={`block bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                    tag.nota_manutencao 
                      ? 'border-red-500 ring-2 ring-red-200' 
                      : 'border-gray-200'
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    {tag.foto_url ? (
                      <img
                        src={tag.foto_url}
                        alt={tag.nome_equipamento}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    {tag.nota_manutencao && (
                      <div className="absolute top-2 right-2">
                        <div className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-lg ${getPrioridadeColor(tag.nota_manutencao.prioridade)}`}>
                          <AlertTriangle size={16} />
                          {tag.nota_manutencao.prioridade.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {tag.nota_manutencao && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                        <Wrench size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-red-800">
                            Nota: {tag.nota_manutencao.numero_nota}
                          </p>
                          <p className="text-xs text-red-700 truncate">
                            {tag.nota_manutencao.descricao}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">TAG</p>
                        <p className="text-sm font-bold text-blue-600">{tag.tag_completo}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          tag.status
                        )}`}
                      >
                        {tag.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">
                      {tag.nome_equipamento}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {tag.localizacao_texto}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Helper Section */}
      {!query && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Como usar</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
              <Search className="h-10 w-10 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Buscar por Código</h3>
              <p className="text-sm text-gray-600">
                Digite os últimos 4 dígitos do TAG (ex: 0001, 2002)
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg">
              <QrCode className="h-10 w-10 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Escanear QR Code</h3>
              <p className="text-sm text-gray-600">
                Use a câmera para escanear o código do equipamento
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
