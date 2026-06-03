import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft, Camera, Calendar, User, Upload, MessageSquare,
  Edit, Wrench, AlertTriangle, CheckCircle, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Comentario, NotaManutencao, Tag, Photo } from '../types';
import * as api from '../services/api';

export function TagDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [tag, setTag] = useState<Tag | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);

  const [novoComentario, setNovoComentario] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);

  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [editNomeEquipamento, setEditNomeEquipamento] = useState('');
  const [editLocalizacao, setEditLocalizacao] = useState('');
  const [numeroNota, setNumeroNota] = useState('');
  const [descricaoNota, setDescricaoNota] = useState('');
  const [prioridadeNota, setPrioridadeNota] = useState<'baixa' | 'média' | 'alta' | 'urgente'>('média');

  useEffect(() => { loadTagData(); }, [id]);

  const loadTagData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [tagData, fotosData, comentariosData] = await Promise.all([
        api.getTagById(Number(id)),
        api.getFotos(Number(id)),
        api.getComentarios(Number(id))
      ]);
      setTag(tagData);
      setPhotos(fotosData);
      setComentarios(comentariosData);
      setEditNomeEquipamento(tagData.nome_equipamento);
      setEditLocalizacao(tagData.localizacao_texto);
    } catch (error) {
      console.error('Erro ao carregar dados do TAG:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'operacional': return { bg: '#D1FAE5', text: '#065F46', dot: '#00A551' };
      case 'manutenção': return { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' };
      case 'inativo': return { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' };
    }
  };

  const getPriorStyle = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente': return { bg: '#DC2626', text: '#fff' };
      case 'alta': return { bg: '#EA580C', text: '#fff' };
      case 'média': return { bg: '#D97706', text: '#fff' };
      case 'baixa': return { bg: '#003865', text: '#fff' };
      default: return { bg: '#6B7280', text: '#fff' };
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  const handleAddComentario = async () => {
    if (!novoComentario.trim() || !user || !tag) return;
    try {
      const newComment = await api.addComentario(tag.id, user.nome, novoComentario);
      setComentarios([newComment, ...comentarios]);
      setNovoComentario('');
    } catch { alert('Erro ao adicionar comentário'); }
  };

  const handleUploadPhoto = async () => {
    if (!uploadUrl.trim() || !user || !tag) return;
    try {
      const newPhoto = await api.addFoto(tag.id, user.nome, uploadUrl, uploadNotes);
      setPhotos([newPhoto, ...photos]);
      setShowUploadModal(false);
      setUploadNotes(''); setUploadUrl('');
    } catch { alert('Erro ao enviar foto'); }
  };

  const handleSaveEdit = async () => {
    if (!tag || !user) return;
    try {
      const updatedTag = await api.updateTag(tag.id, {
        nome_equipamento: editNomeEquipamento,
        localizacao_texto: editLocalizacao,
        atualizado_por: user.nome
      });
      setTag(updatedTag);
      setShowEditModal(false);
    } catch { alert('Erro ao atualizar equipamento'); }
  };

  const handleAbrirNota = async () => {
    if (!numeroNota.trim() || !descricaoNota.trim() || !user || !tag) {
      alert('Por favor, preencha todos os campos'); return;
    }
    try {
      const updatedTag = await api.addNotaManutencao(tag.id, {
        numero_nota: numeroNota, descricao: descricaoNota,
        prioridade: prioridadeNota, aberta_por: user.nome
      });
      setTag(updatedTag);
      setShowNotaModal(false);
      setNumeroNota(''); setDescricaoNota(''); setPrioridadeNota('média');
    } catch { alert('Erro ao abrir nota de manutenção'); }
  };

  const handleFecharNota = async () => {
    if (!tag) return;
    if (confirm('Deseja realmente fechar esta nota de manutenção?')) {
      try {
        const updatedTag = await api.removeNotaManutencao(tag.id);
        setTag(updatedTag);
      } catch { alert('Erro ao fechar nota de manutenção'); }
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors";
  const inputStyle = { borderColor: '#D1D5DB', color: '#2D2D2D', backgroundColor: '#F9FAFB' };
  const focusFn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#003865';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,56,101,0.1)';
  };
  const blurFn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#D1D5DB';
    e.currentTarget.style.boxShadow = 'none';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#003865', borderTopColor: 'transparent' }}
        />
        <p className="text-sm" style={{ color: '#5A5A5A' }}>Carregando…</p>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="text-center py-16">
        <h2 className="font-semibold mb-4" style={{ color: '#2D2D2D' }}>TAG não encontrado</h2>
        <Link to="/" className="inline-flex items-center gap-2 text-sm" style={{ color: '#003865' }}>
          <ArrowLeft size={16} /> Voltar para busca
        </Link>
      </div>
    );
  }

  const statusStyle = getStatusStyle(tag.status);

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: '#5A5A5A' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#003865'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#5A5A5A'; }}
      >
        <ArrowLeft size={15} />
        Voltar para busca
      </Link>

      {/* Maintenance alert */}
      {tag.nota_manutencao && (
        <div
          className="rounded border-2 p-4"
          style={{ backgroundColor: '#FFF5F5', borderColor: '#DC2626' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold" style={{ color: '#991B1B' }}>Nota de Manutenção Aberta</h3>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{ ...getPriorStyle(tag.nota_manutencao.prioridade) }}
                  >
                    {tag.nota_manutencao.prioridade.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm space-y-0.5" style={{ color: '#7F1D1D' }}>
                  <p><span className="font-medium">Nota:</span> {tag.nota_manutencao.numero_nota}</p>
                  <p><span className="font-medium">Descrição:</span> {tag.nota_manutencao.descricao}</p>
                  <p><span className="font-medium">Aberta por:</span> {tag.nota_manutencao.aberta_por}</p>
                  <p><span className="font-medium">Data:</span> {formatDate(tag.nota_manutencao.data_abertura)}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleFecharNota}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-white text-sm font-medium flex-shrink-0 transition-colors"
              style={{ backgroundColor: '#00A551' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#008a43'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#00A551'; }}
            >
              <CheckCircle size={15} />
              Fechar Nota
            </button>
          </div>
        </div>
      )}

      {/* Main info */}
      <div
        className="bg-white rounded border shadow-sm overflow-hidden"
        style={{ borderColor: '#D1D5DB' }}
      >
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-2/5" style={{ backgroundColor: '#E8E8E8', minHeight: '280px' }}>
            {tag.foto_url ? (
              <img src={tag.foto_url} alt={tag.nome_equipamento} className="w-full h-full object-cover" style={{ minHeight: '280px' }} />
            ) : (
              <div className="w-full flex items-center justify-center" style={{ minHeight: '280px' }}>
                <Camera size={48} style={{ color: '#9CA3AF' }} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:w-3/5 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#5A5A5A' }}>TAG Completo</p>
                <h1 className="font-bold font-mono" style={{ color: '#003865', fontSize: '1.6rem', lineHeight: 1.1 }}>
                  {tag.tag_completo}
                </h1>
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  Últimos 4 dígitos: <span className="font-mono font-medium">{tag.ultimos4}</span>
                </p>
              </div>
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium flex-shrink-0"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
                {tag.status}
              </span>
            </div>

            <h2 className="font-semibold mb-4" style={{ color: '#2D2D2D', fontSize: '1.05rem' }}>
              {tag.nome_equipamento}
            </h2>

            <div
              className="grid gap-3 mb-5 text-sm border-t pt-4"
              style={{ borderColor: '#E8E8E8' }}
            >
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#5A5A5A' }}>Localização</p>
                <p style={{ color: '#2D2D2D' }}>{tag.localizacao_texto}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#5A5A5A' }}>Última atualização</p>
                <p style={{ color: '#2D2D2D' }}>{formatDate(tag.atualizado_em)}</p>
                {tag.atualizado_por && (
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>por {tag.atualizado_por}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: '#003865' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#002850'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#003865'; }}
              >
                <Upload size={14} />
                Adicionar Foto
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded border text-sm font-medium transition-colors"
                style={{ borderColor: '#D1D5DB', color: '#5A5A5A', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F4F5F7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Edit size={14} />
                Editar
              </button>
              {!tag.nota_manutencao && (
                <button
                  onClick={() => setShowNotaModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-white text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#EA580C' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C2410C'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EA580C'; }}
                >
                  <Wrench size={14} />
                  Abrir Nota Manutenção
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div
        className="bg-white rounded border p-5 shadow-sm"
        style={{ borderColor: '#D1D5DB' }}
      >
        <h2
          className="font-semibold mb-4 flex items-center gap-2"
          style={{ color: '#2D2D2D' }}
        >
          <MessageSquare size={16} style={{ color: '#003865' }} />
          Comentários
          <span
            className="ml-1 px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: '#E8E8E8', color: '#5A5A5A' }}
          >
            {comentarios.length}
          </span>
        </h2>

        {/* Add comment */}
        <div
          className="mb-5 p-4 rounded border"
          style={{ backgroundColor: '#F9FAFB', borderColor: '#E8E8E8' }}
        >
          <textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Adicione um comentário sobre este equipamento…"
            className={inputClass}
            style={inputStyle}
            rows={3}
            onFocus={focusFn}
            onBlur={blurFn}
          />
          <button
            onClick={handleAddComentario}
            disabled={!novoComentario.trim()}
            className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#003865' }}
            onMouseEnter={(e) => { if (novoComentario.trim()) e.currentTarget.style.backgroundColor = '#002850'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#003865'; }}
          >
            Adicionar Comentário
          </button>
        </div>

        {/* Comment list */}
        {comentarios.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto mb-2" style={{ color: '#D1D5DB' }} />
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Nenhum comentário ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comentarios.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded border"
                style={{ borderColor: '#E8E8E8', borderLeft: '3px solid #003865' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User size={14} style={{ color: '#003865' }} />
                    <span className="text-sm font-medium" style={{ color: '#2D2D2D' }}>{c.autor}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9CA3AF' }}>
                    <Calendar size={12} />
                    {formatDate(c.criado_em)}
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>{c.texto}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo history */}
      <div
        className="bg-white rounded border p-5 shadow-sm"
        style={{ borderColor: '#D1D5DB' }}
      >
        <h2
          className="font-semibold mb-4 flex items-center gap-2"
          style={{ color: '#2D2D2D' }}
        >
          <Camera size={16} style={{ color: '#003865' }} />
          Histórico de Fotos
          <span
            className="ml-1 px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: '#E8E8E8', color: '#5A5A5A' }}
          >
            {photos.length}
          </span>
        </h2>

        {photos.length === 0 ? (
          <div className="text-center py-8">
            <Camera size={32} className="mx-auto mb-2" style={{ color: '#D1D5DB' }} />
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Nenhuma foto enviada ainda</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="rounded border overflow-hidden"
                style={{ borderColor: '#E8E8E8' }}
              >
                <div className="h-40" style={{ backgroundColor: '#E8E8E8' }}>
                  <img src={photo.file_path} alt={`Foto ${photo.id}`} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <User size={12} style={{ color: '#003865' }} />
                    <span style={{ color: '#2D2D2D' }}>{photo.uploader}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar size={12} style={{ color: '#9CA3AF' }} />
                    <span style={{ color: '#5A5A5A' }}>{formatDate(photo.criado_em)}</span>
                  </div>
                  {photo.notes && (
                    <p className="text-xs italic" style={{ color: '#5A5A5A' }}>"{photo.notes}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {/* Upload photo */}
      {showUploadModal && (
        <Modal title="Adicionar Foto" onClose={() => setShowUploadModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>URL da Foto *</label>
              <input
                type="url"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                className={inputClass}
                style={inputStyle}
                onFocus={focusFn}
                onBlur={blurFn}
              />
              <p className="mt-1 text-xs" style={{ color: '#5A5A5A' }}>Insira a URL completa da imagem</p>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>Observações (opcional)</label>
              <textarea
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Observações sobre a foto…"
                className={inputClass}
                style={inputStyle}
                rows={3}
                onFocus={focusFn}
                onBlur={blurFn}
              />
            </div>
            <div className="p-3 rounded text-xs" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF' }}>
              Enviado por: <span className="font-medium">{user?.nome}</span>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleUploadPhoto} className="flex-1 py-2.5 rounded text-white text-sm font-medium" style={{ backgroundColor: '#003865' }}>
              Enviar Foto
            </button>
            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2.5 rounded border text-sm" style={{ borderColor: '#D1D5DB', color: '#5A5A5A' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* Edit */}
      {showEditModal && (
        <Modal title="Editar Equipamento" onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>Nome do Equipamento</label>
              <input
                type="text"
                value={editNomeEquipamento}
                onChange={(e) => setEditNomeEquipamento(e.target.value)}
                className={inputClass}
                style={inputStyle}
                onFocus={focusFn}
                onBlur={blurFn}
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>Localização</label>
              <textarea
                value={editLocalizacao}
                onChange={(e) => setEditLocalizacao(e.target.value)}
                className={inputClass}
                style={inputStyle}
                rows={3}
                onFocus={focusFn}
                onBlur={blurFn}
              />
            </div>
            <div className="p-3 rounded text-xs" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF' }}>
              Alteração registrada por: <span className="font-medium">{user?.nome}</span>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded text-white text-sm font-medium" style={{ backgroundColor: '#003865' }}>
              Salvar Alterações
            </button>
            <button onClick={() => setShowEditModal(false)} className="px-4 py-2.5 rounded border text-sm" style={{ borderColor: '#D1D5DB', color: '#5A5A5A' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* Open maintenance note */}
      {showNotaModal && (
        <Modal title="Abrir Nota de Manutenção" onClose={() => setShowNotaModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>Número da Nota *</label>
              <input
                type="text"
                value={numeroNota}
                onChange={(e) => setNumeroNota(e.target.value)}
                placeholder="Ex: MNT-2024-001"
                className={inputClass}
                style={inputStyle}
                onFocus={focusFn}
                onBlur={blurFn}
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>Prioridade *</label>
              <select
                value={prioridadeNota}
                onChange={(e) => setPrioridadeNota(e.target.value as any)}
                className={inputClass}
                style={inputStyle}
                onFocus={focusFn}
                onBlur={blurFn}
              >
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>Descrição do Problema *</label>
              <textarea
                value={descricaoNota}
                onChange={(e) => setDescricaoNota(e.target.value)}
                placeholder="Descreva o problema identificado…"
                className={inputClass}
                style={inputStyle}
                rows={4}
                onFocus={focusFn}
                onBlur={blurFn}
              />
            </div>
            <div className="p-3 rounded border text-xs" style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA', color: '#92400E' }}>
              <p className="font-medium mb-0.5">⚠️ Atenção</p>
              <p>Nota será aberta por: <span className="font-medium">{user?.nome}</span></p>
              <p>Data: {new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleAbrirNota} className="flex-1 py-2.5 rounded text-white text-sm font-medium" style={{ backgroundColor: '#EA580C' }}>
              Abrir Nota
            </button>
            <button onClick={() => setShowNotaModal(false)} className="px-4 py-2.5 rounded border text-sm" style={{ borderColor: '#D1D5DB', color: '#5A5A5A' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded shadow-2xl w-full max-w-md" style={{ border: '1px solid #D1D5DB' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#E8E8E8' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#2D2D2D' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: '#5A5A5A' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E8E8E8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
