import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft, Camera, Calendar, User, Upload, MessageSquare,
  Edit, Wrench, AlertTriangle, CheckCircle, X, Activity,
  Clock, QrCode, Printer, BookOpen, Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { Comentario, NotaManutencao, Tag, Photo } from '../types';
import * as api from '../services/api';
import { saveRecentTag } from './SearchPage';
import { supabase } from '../lib/supabase';
import { ManualTecnicoTab } from './ManualTecnicoTab';
import { BibliotecarioTab } from './BibliotecarioTab';

const CARGO_BADGE: Record<string, { label: string; style: string }> = {
  'Operador Lider': { label: 'Líder', style: 'bg-primary text-primary-foreground' },
  'Operador III': { label: 'Op. III', style: 'bg-teal-600 text-white' },
  'Operador II': { label: 'Op. II', style: 'bg-muted-foreground text-white' },
  'Coordenador': { label: 'Coord.', style: 'bg-purple-600 text-white' },
  'Especialista': { label: 'Espec.', style: 'bg-indigo-600 text-white' },
  'Engenheiro': { label: 'Eng.', style: 'bg-blue-600 text-white' },
  'Assistente Tecnico': { label: 'Ass. Téc.', style: 'bg-cyan-600 text-white' },
};

const getCargoBadge = (index: number) => {
  const cargos = Object.values(CARGO_BADGE);
  return cargos[index % cargos.length];
};

interface AuditEntry {
  tipo: 'nota_aberta' | 'nota_fechada' | 'status_alterado' | 'foto_adicionada' | 'dados_editados';
  descricao: string;
  autor: string;
  data: string;
}

function buildAuditLog(tag: Tag, photos: Photo[]): AuditEntry[] {
  const entries: AuditEntry[] = [];

  if (tag.notas_manutencao) {
    tag.notas_manutencao.forEach(nota => {
      entries.push({
        tipo: 'nota_aberta',
        descricao: `Nota ${nota.numero_nota} aberta — ${nota.descricao}`,
        autor: nota.aberta_por,
        data: nota.data_abertura,
      });
    });
  }

  photos.forEach(p => {
    entries.push({
      tipo: 'foto_adicionada',
      descricao: p.notes ? `Foto adicionada: "${p.notes}"` : 'Foto adicionada ao equipamento',
      autor: p.uploader,
      data: p.criado_em,
    });
  });

  if (tag.atualizado_por) {
    entries.push({
      tipo: 'dados_editados',
      descricao: `Dados do equipamento atualizados`,
      autor: tag.atualizado_por,
      data: tag.atualizado_em,
    });
  }

  entries.push({
    tipo: 'status_alterado',
    descricao: `Status definido como "${tag.status}"`,
    autor: tag.atualizado_por ?? 'Sistema',
    data: tag.criado_em,
  });

  return entries.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

const AUDIT_CONFIG: Record<AuditEntry['tipo'], { icon: React.ReactNode; color: string; dot: string }> = {
  nota_aberta: { icon: <AlertTriangle size={14} />, color: 'text-destructive', dot: 'bg-destructive' },
  nota_fechada: { icon: <CheckCircle size={14} />, color: 'text-accent', dot: 'bg-accent' },
  status_alterado: { icon: <Activity size={14} />, color: 'text-primary', dot: 'bg-primary' },
  foto_adicionada: { icon: <Camera size={14} />, color: 'text-purple-600', dot: 'bg-purple-500' },
  dados_editados: { icon: <Edit size={14} />, color: 'text-amber-600', dot: 'bg-amber-500' },
};

export function TagDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const isCoordenador = user?.cargo === 'Coordenador';

  const [tag, setTag] = useState<Tag | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);

  const [novoComentario, setNovoComentario] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);

  const [uploadNotes, setUploadNotes] = useState('');
  const [isCapa, setIsCapa] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editTagCompleto, setEditTagCompleto] = useState('');
  const [editNomeEquipamento, setEditNomeEquipamento] = useState('');
  const [editLocalizacao, setEditLocalizacao] = useState('');
  const [editStatus, setEditStatus] = useState<'operacional' | 'manutenção' | 'inativo'>('operacional');
  const [numeroNota, setNumeroNota] = useState('');
  const [descricaoNota, setDescricaoNota] = useState('');
  const [prioridadeNota, setPrioridadeNota] = useState<'baixa' | 'média' | 'alta' | 'urgente'>('média');
  const [especialidadeNota, setEspecialidadeNota] = useState<'Mecânica' | 'Elétrica' | 'Instrumentação' | 'Automação'>('Mecânica');
  const [mudarParaManutencao, setMudarParaManutencao] = useState(false);

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
      setEditTagCompleto(tagData.tag_completo);
      setEditNomeEquipamento(tagData.nome_equipamento);
      setEditLocalizacao(tagData.localizacao_texto);
      setEditStatus(tagData.status);
      saveRecentTag(tagData);
    } catch (error) {
      console.error('Erro ao carregar dados do TAG:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'operacional': return { container: 'bg-accent/10 text-accent', dot: 'bg-accent' };
      case 'manutenção': return { container: 'bg-amber-100 text-amber-800', dot: 'bg-amber-600' };
      case 'inativo': return { container: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' };
      default: return { container: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' };
    }
  };

  const getPriorStyle = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-destructive text-destructive-foreground';
      case 'alta': return 'bg-orange-600 text-white';
      case 'média': return 'bg-amber-600 text-white';
      case 'baixa': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted-foreground text-white';
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
    if (!uploadFile || !user || !tag) return;
    try {
      setIsUploading(true);
      
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${tag.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('equipamentos')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('equipamentos')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const newPhoto = await api.addFoto(tag.id, user.nome, publicUrl, uploadNotes);
      setPhotos([newPhoto, ...photos]);
      
      if (!tag.foto_url || isCapa) {
        const updatedTag = await api.updateTag(tag.id, { foto_url: publicUrl });
        setTag(updatedTag);
      }
      
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadNotes('');
      setIsCapa(false);
    } catch (error) { 
      console.error(error);
      alert('Erro ao enviar foto. Verifique se o bucket "equipamentos" foi criado no Supabase.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!tag || !user) return;
    
    const ultimos4Match = editTagCompleto.match(/\d{4}$/);
    if (!ultimos4Match) {
      alert('O TAG deve terminar com 4 dígitos (ex: CAL-BOI-0001)');
      return;
    }

    try {
      const updatedTag = await api.updateTag(tag.id, {
        tag_completo: editTagCompleto,
        nome_equipamento: editNomeEquipamento,
        localizacao_texto: editLocalizacao,
        status: editStatus,
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
      let updatedTag = await api.addNotaManutencao(tag.id, {
        numero_nota: numeroNota, descricao: descricaoNota,
        prioridade: prioridadeNota, aberta_por: user.nome,
        especialidade: especialidadeNota
      });

      if (mudarParaManutencao && updatedTag.status !== 'manutenção') {
        updatedTag = await api.updateTag(tag.id, { status: 'manutenção', atualizado_por: user.nome });
      }

      setTag(updatedTag);
      setShowNotaModal(false);
      setNumeroNota(''); setDescricaoNota(''); setPrioridadeNota('média'); setEspecialidadeNota('Mecânica');
      setMudarParaManutencao(false);
    } catch { alert('Erro ao abrir nota de manutenção'); }
  };

  // Operador valida: nota vai para o histórico antes de ser removida
  const handleValidarNota = async (notaId: string) => {
    if (!tag || !user) return;
    if (confirm('Confirmar validação e encerramento desta nota de manutenção?')) {
      try {
        const updatedTag = await api.finalizarNota(tag.id, notaId, user.nome);
        setTag(updatedTag);
      } catch { alert('Erro ao validar nota de manutenção'); }
    }
  };

  // Cancelar/fechar sem registrar histórico (remoção simples)
  const handleCancelarNota = async (notaId: string) => {
    if (!tag) return;
    if (confirm('Deseja cancelar/fechar esta nota sem registrar no histórico?')) {
      try {
        const updatedTag = await api.removeNotaManutencao(tag.id, notaId);
        setTag(updatedTag);
      } catch { alert('Erro ao fechar nota de manutenção'); }
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded border border-border bg-muted/30 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";
  const [activeKosTab, setActiveKosTab] = useState<'kos' | 'biblio'>('kos');

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="text-center py-16">
        <h2 className="font-semibold mb-4 text-foreground">TAG não encontrado</h2>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft size={16} /> Voltar para busca
        </Link>
      </div>
    );
  }

  const statusStyle = getStatusStyle(tag.status);
  const auditLog = buildAuditLog(tag, photos);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* Coluna Esquerda */}
      <div className="flex-1 space-y-5 min-w-0 w-full">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft size={15} />
        Voltar para busca
      </Link>

      {/* Maintenance alert */}
      {tag.notas_manutencao && tag.notas_manutencao.length > 0 && (
        <div className="space-y-3">
          {tag.notas_manutencao.map(nota => (
            <div key={nota.id} className="rounded border-2 p-4 bg-destructive/5 border-destructive">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle size={20} className="flex-shrink-0 mt-0.5 text-destructive" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-destructive">Nota de Manutenção Aberta</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorStyle(nota.prioridade)}`}>
                        {nota.prioridade.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm space-y-0.5 text-destructive/90">
                      <p><span className="font-medium">Nota:</span> {nota.numero_nota}</p>
                      <p><span className="font-medium">Descrição:</span> {nota.descricao}</p>
                      <p><span className="font-medium">Aberta por:</span> {nota.aberta_por}</p>
                      <p><span className="font-medium">Data:</span> {formatDate(nota.data_abertura)}</p>
                      {nota.especialidade && (
                        <p><span className="font-medium">Especialidade:</span> {nota.especialidade}</p>
                      )}
                      {nota.status_manutencao && (
                        <p><span className="font-medium">Status da Manutenção:</span> <span className="uppercase tracking-wider font-semibold text-xs ml-1 bg-destructive/10 px-1.5 py-0.5 rounded">{nota.status_manutencao.replace('_', ' ')}</span></p>
                      )}
                    </div>
                  </div>
                </div>
                
                {!isCoordenador && (
                  nota.status_manutencao === 'finalizada_manutencao' && user?.cargo !== 'Gestor de Manutenção' ? (
                    <button
                      onClick={() => handleValidarNota(nota.id!)}
                      className="p-2 bg-green-600 text-white hover:bg-green-700 rounded-none transition-colors text-sm font-medium flex items-center gap-2"
                      title="Validar e Encerrar Nota — registra no histórico"
                    >
                      <CheckCircle size={16} /> Validar e Encerrar Nota
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCancelarNota(nota.id!)}
                      className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-none transition-colors"
                      title="Fechar/Cancelar nota (sem histórico)"
                    >
                      <X size={18} />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main info */}
      <div className="bg-card rounded-none border-2 border-border shadow-[var(--shadow-hard)] overflow-hidden panel">
        <div className="md:flex">
          <div className="md:w-2/5 bg-muted min-h-[280px]">
            {tag.foto_url ? (
              <img src={tag.foto_url} alt={tag.nome_equipamento} className="w-full h-full object-cover min-h-[280px]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[280px]">
                <Camera size={48} className="text-muted-foreground/30" />
              </div>
            )}
          </div>

          <div className="md:w-3/5 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5 text-muted-foreground font-semibold mono">TAG // COMPLETO</p>
                <h1 className="font-bold font-mono text-primary text-[1.6rem] leading-tight">{tag.tag_completo}</h1>
                <p className="text-xs mt-1 text-muted-foreground">
                  Últimos 4 dígitos: <span className="font-mono font-medium">{tag.ultimos4}</span>
                </p>
              </div>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-semibold flex-shrink-0 ${statusStyle.container}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {tag.status}
              </span>
            </div>

            <h2 className="font-semibold mb-4 text-foreground text-[1.05rem]">{tag.nome_equipamento}</h2>

            <div className="grid gap-3 mb-5 text-sm border-t border-border pt-4">
              <div>
                <p className="text-xs mb-0.5 text-muted-foreground">Localização</p>
                <p className="text-foreground">{tag.localizacao_texto}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5 text-muted-foreground">Última atualização</p>
                <p className="text-foreground">{formatDate(tag.atualizado_em)}</p>
                {tag.atualizado_por && (
                  <p className="text-xs mt-0.5 text-muted-foreground">por {tag.atualizado_por}</p>
                )}
              </div>
            </div>



            {!isCoordenador && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-none bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Upload size={14} />
                  Adicionar Foto
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-none border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors bg-transparent"
                >
                  <Edit size={14} />
                  Editar
                </button>
                <button
                  onClick={() => setShowQrCodeModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-none border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors bg-transparent"
                >
                  <QrCode size={14} />
                  Gerar QR
                </button>
                <button
                  onClick={() => setShowNotaModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-none bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  <Wrench size={14} />
                  Abrir Nota Manutenção
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Comments */}
      <div className="bg-card rounded border border-border p-5 shadow-sm">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
          <MessageSquare size={16} className="text-primary" />
          Comentários
          <span className="ml-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
            {comentarios.length}
          </span>
        </h2>

        <div className="mb-5 p-4 rounded border border-border bg-muted/30">
          <textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Adicione um comentário sobre este equipamento…"
            className={inputClass}
            rows={3}
          />
          <button
            onClick={handleAddComentario}
            disabled={!novoComentario.trim()}
            className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            Adicionar Comentário
          </button>
        </div>

        {comentarios.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground/70">Nenhum comentário ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comentarios.map((c, i) => {
              const isCurrentUser = c.autor === user?.nome;
              const cargo = isCurrentUser
                ? CARGO_BADGE[user?.cargo ?? ''] ?? getCargoBadge(i)
                : getCargoBadge(i);
              return (
                <div key={c.id} className="p-4 rounded border border-border border-l-[3px] border-l-primary bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <User size={14} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">{c.autor}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-semibold tracking-wide ${cargo.style}`}>
                        {cargo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                      <Calendar size={12} />
                      {formatDate(c.criado_em)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.texto}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Photo history */}
      <div className="bg-card rounded border border-border p-5 shadow-sm">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Camera size={16} className="text-primary" />
          Histórico de Fotos
          <span className="ml-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
            {photos.length}
          </span>
        </h2>

        {photos.length === 0 ? (
          <div className="text-center py-8">
            <Camera size={32} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground/70">Nenhuma foto enviada ainda</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded border border-border overflow-hidden bg-card">
                <div className="h-40 bg-muted">
                  <img src={photo.file_path} alt={`Foto ${photo.id}`} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <User size={12} className="text-primary" />
                    <span className="text-foreground">{photo.uploader}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar size={12} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{formatDate(photo.criado_em)}</span>
                  </div>
                  {photo.notes && <p className="text-xs italic text-muted-foreground">"{photo.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit log */}
      <div className="bg-card rounded border border-border p-5 shadow-sm">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Clock size={16} className="text-primary" />
          Histórico de Alterações
          <span className="ml-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
            {auditLog.length}
          </span>
        </h2>

        {auditLog.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={32} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground/70">Nenhuma alteração registrada</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-4">
              {auditLog.map((entry, i) => {
                const cfg = AUDIT_CONFIG[entry.tipo];
                return (
                  <div key={i} className="flex gap-4">
                    <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 border-card flex items-center justify-center ${cfg.dot} bg-opacity-10`}>
                      <div className={`${cfg.color}`}>{cfg.icon}</div>
                      <div className={`absolute inset-0 rounded-full opacity-15 ${cfg.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className="text-sm text-foreground leading-snug">{entry.descricao}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <User size={11} />
                        <span>{entry.autor}</span>
                        <span>·</span>
                        <Calendar size={11} />
                        <span>{formatDate(entry.data)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showUploadModal && (
        <Modal title="Adicionar Foto" onClose={() => setShowUploadModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">Arquivo de Imagem *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors cursor-pointer"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">Observações (opcional)</label>
              <textarea
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Observações sobre a foto…"
                className={inputClass}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isCapa"
                checked={isCapa}
                onChange={(e) => setIsCapa(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
              />
              <label htmlFor="isCapa" className="text-sm font-medium text-foreground cursor-pointer">
                Definir como foto principal (Substituir atual)
              </label>
            </div>
            <div className="p-3 rounded text-xs bg-primary/5 text-primary/80">
              Enviado por: <span className="font-medium">{user?.nome}</span>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button 
              onClick={handleUploadPhoto} 
              disabled={isUploading || !uploadFile}
              className="flex-1 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Enviando...' : 'Enviar Foto'}
            </button>
            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2.5 rounded border border-border text-muted-foreground hover:bg-muted text-sm">
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Editar Equipamento" onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">TAG (Código)</label>
              <input type="text" value={editTagCompleto} onChange={(e) => setEditTagCompleto(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">Nome do Equipamento</label>
              <input type="text" value={editNomeEquipamento} onChange={(e) => setEditNomeEquipamento(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">Localização</label>
              <textarea value={editLocalizacao} onChange={(e) => setEditLocalizacao(e.target.value)} className={inputClass} rows={3} />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as any)} className={inputClass}>
                <option value="operacional">Operacional</option>
                <option value="manutenção">Manutenção</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div className="p-3 rounded text-xs bg-primary/5 text-primary/80">
              Alteração registrada por: <span className="font-medium">{user?.nome}</span>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
              Salvar Alterações
            </button>
            <button onClick={() => setShowEditModal(false)} className="px-4 py-2.5 rounded border border-border text-muted-foreground hover:bg-muted text-sm">
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {showNotaModal && (
        <Modal title="Abrir Nota de Manutenção" onClose={() => setShowNotaModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">Número da Nota *</label>
              <input
                type="text"
                value={numeroNota}
                onChange={(e) => setNumeroNota(e.target.value)}
                placeholder="Ex: MNT-2024-001"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">Prioridade *</label>
              <select value={prioridadeNota} onChange={(e) => setPrioridadeNota(e.target.value as any)} className={inputClass}>
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">Especialidade *</label>
              <select value={especialidadeNota} onChange={(e) => setEspecialidadeNota(e.target.value as any)} className={inputClass}>
                <option value="Mecânica">Mecânica</option>
                <option value="Elétrica">Elétrica</option>
                <option value="Instrumentação">Instrumentação</option>
                <option value="Automação">Automação</option>
                <option value="Civil">Civil</option>
                <option value="Iluminação">Iluminação</option>
                <option value="Lubrificação">Lubrificação</option>
                <option value="Isolamento">Isolamento</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">Descrição do Problema *</label>
              <textarea
                value={descricaoNota}
                onChange={(e) => setDescricaoNota(e.target.value)}
                placeholder="Descreva o problema identificado…"
                className={inputClass}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2 mt-2 bg-amber-50 p-3 rounded-none border border-amber-200">
              <input
                type="checkbox"
                id="mudarManutencao"
                checked={mudarParaManutencao}
                onChange={(e) => setMudarParaManutencao(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
              />
              <label htmlFor="mudarManutencao" className="text-sm font-medium text-amber-900 cursor-pointer">
                Equipamento removido para conserto (Mudar status para Manutenção)
              </label>
            </div>
            <div className="p-3 rounded border text-xs bg-amber-50 border-amber-200 text-amber-800">
              <p className="font-medium mb-0.5">⚠️ Atenção</p>
              <p>Nota será aberta por: <span className="font-medium">{user?.nome}</span></p>
              <p>Data: {new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleAbrirNota} className="flex-1 py-2.5 rounded bg-orange-600 text-white text-sm font-medium hover:bg-orange-700">
              Abrir Nota
            </button>
            <button onClick={() => setShowNotaModal(false)} className="px-4 py-2.5 rounded border border-border text-muted-foreground hover:bg-muted text-sm">
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* QR Code Modal */}
      {showQrCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded shadow-lg border border-border overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <QrCode size={18} className="text-primary" />
                QR Code do Equipamento
              </h3>
              <button onClick={() => setShowQrCodeModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center text-center bg-white" id="print-qr-area">
              <QRCodeSVG 
                value={`${window.location.origin}/tag/${tag.id}`} 
                size={220} 
                level="Q"
                includeMargin={true}
              />
              <p className="mt-4 font-mono font-bold text-lg text-black">{tag.tag_completo}</p>
              <p className="text-sm text-gray-600 font-medium">{tag.nome_equipamento}</p>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/30">
              <button onClick={() => setShowQrCodeModal(false)} className="px-4 py-2 rounded border border-border text-sm font-medium text-foreground hover:bg-muted">
                Fechar
              </button>
              <button onClick={() => window.print()} className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
                <Printer size={16} />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
      </div> {/* fim coluna esquerda */}

      {/* Coluna Direita: Base KOS / Bibliotecário (abas industriais) */}
      <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 sticky top-6">
        <div className="bg-card border-2 border-border shadow-[var(--shadow-hard)]">
          {/* Tab strip */}
          <div className="flex border-b-2 border-border">
            <button
              onClick={() => setActiveKosTab('kos')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.1em] border-r-2 border-border transition-colors ${
                activeKosTab === 'kos'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted'
              }`}
            >
              <BookOpen size={14} /> Base KOS
            </button>
            <button
              onClick={() => setActiveKosTab('biblio')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                activeKosTab === 'biblio'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Sparkles size={14} /> Bibliotecário
            </button>
          </div>
          <div className="p-4">
            {activeKosTab === 'kos' ? (
              <ManualTecnicoTab tagId={tag.id.toString()} tagCompleto={tag.tag_completo} />
            ) : (
              <BibliotecarioTab tagCompleto={tag.tag_completo} />
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/40 backdrop-blur-md transition-all">
      <div className="bg-card rounded-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md border border-border/40 transform transition-all">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-none transition-colors text-muted-foreground hover:bg-muted hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
