import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Camera, Calendar, User, Upload, MessageSquare, Edit, Wrench, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { mockTags, mockPhotos, mockComentarios } from '../mockData';
import { useAuth } from '../contexts/AuthContext';
import { Comentario, NotaManutencao } from '../types';

export function TagDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const tag = mockTags.find((t) => t.id === Number(id));
  const photos = mockPhotos.filter((p) => p.tag_id === Number(id));
  
  const [comentarios, setComentarios] = useState<Comentario[]>(
    mockComentarios.filter((c) => c.tag_id === Number(id))
  );
  const [novoComentario, setNovoComentario] = useState('');
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  
  const [uploadNotes, setUploadNotes] = useState('');
  
  // Estados para edição
  const [editNomeEquipamento, setEditNomeEquipamento] = useState(tag?.nome_equipamento || '');
  const [editLocalizacao, setEditLocalizacao] = useState(tag?.localizacao_texto || '');
  
  // Estados para nota de manutenção
  const [numeroNota, setNumeroNota] = useState('');
  const [descricaoNota, setDescricaoNota] = useState('');
  const [prioridadeNota, setPrioridadeNota] = useState<'baixa' | 'média' | 'alta' | 'urgente'>('média');

  if (!tag) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">TAG não encontrado</h2>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft size={20} />
          Voltar para busca
        </Link>
      </div>
    );
  }

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
        return 'bg-red-600 text-white border-red-700';
      case 'alta':
        return 'bg-orange-600 text-white border-orange-700';
      case 'média':
        return 'bg-yellow-600 text-white border-yellow-700';
      case 'baixa':
        return 'bg-blue-600 text-white border-blue-700';
      default:
        return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddComentario = () => {
    if (!novoComentario.trim() || !user) return;
    
    const newComment: Comentario = {
      id: comentarios.length + 100,
      tag_id: tag.id,
      autor: user.nome,
      texto: novoComentario,
      criado_em: new Date().toISOString()
    };
    
    setComentarios([...comentarios, newComment]);
    setNovoComentario('');
  };

  const handleUploadPhoto = () => {
    alert('Foto enviada com sucesso!');
    setShowUploadModal(false);
    setUploadNotes('');
  };

  const handleSaveEdit = () => {
    alert(`Equipamento atualizado por ${user?.nome}`);
    setShowEditModal(false);
  };

  const handleAbrirNota = () => {
    if (!numeroNota.trim() || !descricaoNota.trim() || !user) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    alert(`Nota de manutenção ${numeroNota} aberta com sucesso por ${user.nome}`);
    setShowNotaModal(false);
    setNumeroNota('');
    setDescricaoNota('');
    setPrioridadeNota('média');
  };

  const handleFecharNota = () => {
    if (confirm('Deseja realmente fechar esta nota de manutenção?')) {
      alert('Nota de manutenção fechada com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar para busca
      </Link>

      {/* Alert para Nota de Manutenção */}
      {tag.nota_manutencao && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={24} />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-red-900 text-lg">Nota de Manutenção Aberta</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPrioridadeColor(tag.nota_manutencao.prioridade)}`}>
                    {tag.nota_manutencao.prioridade.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-red-800">
                  <p><strong>Nota:</strong> {tag.nota_manutencao.numero_nota}</p>
                  <p><strong>Descrição:</strong> {tag.nota_manutencao.descricao}</p>
                  <p><strong>Aberta por:</strong> {tag.nota_manutencao.aberta_por}</p>
                  <p><strong>Data de abertura:</strong> {formatDate(tag.nota_manutencao.data_abertura)}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleFecharNota}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={18} />
              Fechar Nota
            </button>
          </div>
        </div>
      )}

      {/* Main Info Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/2 bg-gray-100">
            {tag.foto_url ? (
              <img
                src={tag.foto_url}
                alt={tag.nome_equipamento}
                className="w-full h-full object-cover min-h-[300px]"
              />
            ) : (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                <Camera className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:w-1/2 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">TAG COMPLETO</p>
                <h1 className="text-3xl font-bold text-blue-600">{tag.tag_completo}</h1>
                <p className="text-sm text-gray-500 mt-1">Últimos 4 dígitos: {tag.ultimos4}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  tag.status
                )}`}
              >
                {tag.status}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {tag.nome_equipamento}
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p className="text-gray-900">{tag.localizacao_texto}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Última atualização</p>
                <p className="text-gray-900">{formatDate(tag.atualizado_em)}</p>
                {tag.atualizado_por && (
                  <p className="text-sm text-gray-600">por {tag.atualizado_por}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3 flex-wrap">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload size={20} />
                Adicionar Foto
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Edit size={20} />
                Editar
              </button>
              {!tag.nota_manutencao && (
                <button
                  onClick={() => setShowNotaModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Wrench size={20} />
                  Abrir Nota Manutenção
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comentários */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare size={20} />
          Comentários ({comentarios.length})
        </h2>

        {/* Add Comment */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Adicione um comentário sobre este equipamento..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
            rows={3}
          />
          <button
            onClick={handleAddComentario}
            disabled={!novoComentario.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Adicionar Comentário
          </button>
        </div>

        {/* Comments List */}
        {comentarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>Nenhum comentário ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{comentario.autor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>{formatDate(comentario.criado_em)}</span>
                  </div>
                </div>
                <p className="text-gray-700">{comentario.texto}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photos History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Camera size={20} />
          Histórico de Fotos ({photos.length})
        </h2>

        {photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Camera className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>Nenhuma foto enviada ainda</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={photo.file_path}
                    alt={`Foto ${photo.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-gray-400" />
                    <span className="text-gray-900">{photo.uploader}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-600">{formatDate(photo.criado_em)}</span>
                  </div>
                  {photo.notes && (
                    <p className="text-sm text-gray-600 italic">"{photo.notes}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload de Foto</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto do Equipamento
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Clique para selecionar ou arraste a foto</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG até 10MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Adicione observações sobre a foto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium">Enviado por: {user?.nome}</p>
                <p className="text-xs mt-1">A foto será registrada com seu nome e data/hora atual</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUploadPhoto}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Foto
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Equipamento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Equipamento
                </label>
                <input
                  type="text"
                  value={editNomeEquipamento}
                  onChange={(e) => setEditNomeEquipamento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização
                </label>
                <textarea
                  value={editLocalizacao}
                  onChange={(e) => setEditLocalizacao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium">Alteração será registrada</p>
                <p className="text-xs mt-1">Operador: {user?.nome}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nota Manutenção Modal */}
      {showNotaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench size={20} />
              Abrir Nota de Manutenção
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número da Nota *
                </label>
                <input
                  type="text"
                  value={numeroNota}
                  onChange={(e) => setNumeroNota(e.target.value)}
                  placeholder="Ex: MNT-2024-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade *
                </label>
                <select
                  value={prioridadeNota}
                  onChange={(e) => setPrioridadeNota(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Problema *
                </label>
                <textarea
                  value={descricaoNota}
                  onChange={(e) => setDescricaoNota(e.target.value)}
                  placeholder="Descreva o problema identificado..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>

              <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="font-medium text-orange-900">⚠️ Atenção</p>
                <p className="text-xs mt-1 text-orange-800">
                  A nota será aberta por: {user?.nome}
                  <br />
                  Data: {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAbrirNota}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Abrir Nota
              </button>
              <button
                onClick={() => setShowNotaModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
