import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Camera, QrCode, AlertTriangle, Wrench, Tag, X, Clock, Scan } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Tag as TagType } from '../types';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RECENT_TAGS_KEY = 'klabin_recent_tags';
const MAX_RECENT = 5;

interface RecentTag {
  id: number;
  tag_completo: string;
  nome_equipamento: string;
  status: string;
  acessado_em: string;
}

function saveRecentTag(tag: TagType) {
  try {
    const raw = localStorage.getItem(RECENT_TAGS_KEY);
    const recentes: RecentTag[] = raw ? JSON.parse(raw) : [];
    const filtered = recentes.filter(r => r.id !== tag.id);
    const updated: RecentTag[] = [
      { id: tag.id, tag_completo: tag.tag_completo, nome_equipamento: tag.nome_equipamento, status: tag.status, acessado_em: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_TAGS_KEY, JSON.stringify(updated));
  } catch {}
}

export { saveRecentTag };

export function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentTags, setRecentTags] = useState<RecentTag[]>([]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStatus, setQrStatus] = useState<'scanning' | 'not_found' | 'found'>('scanning');

  // C1-C4: filtro rápido de status + ordenação + highlight + limpar
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'operacional' | 'manutenção' | 'inativo'>('todos');
  const [sortBy, setSortBy] = useState<'tag' | 'nome' | 'nota'>('tag');

  const resultadosVisiveis = (() => {
    let lista = [...results];
    if (filtroStatus !== 'todos') lista = lista.filter(t => t.status === filtroStatus);
    if (sortBy === 'tag') lista.sort((a, b) => a.tag_completo.localeCompare(b.tag_completo));
    else if (sortBy === 'nome') lista.sort((a, b) => a.nome_equipamento.localeCompare(b.nome_equipamento));
    else lista.sort((a, b) => (b.nota_manutencao ? 1 : 0) - (a.nota_manutencao ? 1 : 0));
    return lista;
  })();

  const highlight = (text: string) => {
    const q = query.trim();
    if (!q || q.length < 2) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>{text.slice(0, idx)}<mark className="bg-accent/30 text-foreground">{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>
    );
  };

  useEffect(() => {
    if (user?.gerencia === 'Manutenção') {
      navigate('/admin/manutencao');
    }
  }, [user, navigate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_TAGS_KEY);
      if (raw) setRecentTags(JSON.parse(raw));
    } catch {}
  }, []);

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

  const openQrModal = () => {
    setQrStatus('scanning');
    setShowQrModal(true);
  };

  const closeQrModal = useCallback(() => {
    setShowQrModal(false);
    setQrStatus('scanning');
  }, []);

  const retryQrScan = () => {
    setQrStatus('scanning');
  };

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const scannedValue = result[0].rawValue;
      const match = scannedValue.match(/\/tag\/(\d+)/);
      if (match) {
        setQrStatus('found');
        setTimeout(() => {
          setShowQrModal(false);
          navigate(`/tag/${match[1]}`);
        }, 800);
      } else {
        const id = parseInt(scannedValue);
        if (!isNaN(id)) {
          setQrStatus('found');
          setTimeout(() => {
            setShowQrModal(false);
            navigate(`/tag/${id}`);
          }, 800);
        } else {
          setQrStatus('not_found');
        }
      }
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'operacional': return { container: 'bg-accent/10 text-accent', dot: 'bg-accent' };
      case 'manutenção': return { container: 'bg-amber-100 text-amber-800', dot: 'bg-amber-600' };
      case 'inativo': return { container: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' };
      default: return { container: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' };
    }
  };

  const getPrioridadeBadge = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-destructive text-destructive-foreground';
      case 'alta': return 'bg-orange-600 text-white';
      case 'média': return 'bg-amber-600 text-white';
      case 'baixa': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted-foreground text-white';
    }
  };

  return (
    <div className="space-y-5">
      {/* Search box */}
      <section className="bg-card border-2 border-border shadow-[var(--shadow-hard)]">
        <header className="flex items-center gap-2 px-4 py-2.5 border-b-2 border-border bg-primary/5">
          <Search size={14} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] mono text-primary">CONSULTA // EQUIPAMENTO</span>
        </header>
        <div className="p-5">
        <label className="block mb-2 text-sm font-semibold text-foreground">
          Buscar Equipamento
        </label>
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Últimos 4 dígitos do TAG ou nome do equipamento…"
            className="w-full pl-10 pr-10 py-3 rounded-none border-2 border-border/60 bg-muted/20 text-sm text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:shadow-[0_0_15px_rgba(0,165,81,0.15)]"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setFiltroStatus('todos'); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
              title="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground mono">
          Ex: <span className="font-bold text-foreground/80">0001</span> código &nbsp;·&nbsp; "válvula" nome
        </p>

        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t-2 border-border">
          <button
            onClick={openQrModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border-2 border-primary text-sm font-bold uppercase tracking-wider text-primary bg-transparent transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <QrCode size={15} />
            Escanear QR Code
          </button>
        </div>
        </div>
      </section>

      {/* Results */}
      {query && (
        <section className="bg-card border-2 border-border shadow-[var(--shadow-hard)]">
          <header className="flex items-center justify-between px-4 py-2.5 border-b-2 border-border bg-primary/5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] mono text-primary">RESULTADOS // BUSCA</span>
            {results.length > 0 && (
              <span className="text-[0.65rem] font-bold px-2 py-0.5 bg-primary text-primary-foreground mono">
                {resultadosVisiveis.length}
              </span>
            )}
          </header>
          <div className="p-5">

          {/* C1+C3: filtro status + ordenação */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            {(['todos','operacional','manutenção','inativo'] as const).map(s => (
              <button key={s} onClick={() => setFiltroStatus(s)}
                className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-none border transition-colors ${filtroStatus===s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                {s === 'todos' ? 'Todos' : s}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">Ordenar:</span>
            {(['tag','nome','nota'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2 py-1 text-xs rounded-none border transition-colors ${sortBy===s ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                {s === 'tag' ? 'TAG' : s === 'nome' ? 'Nome' : 'Nota'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Buscando...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search size={40} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">Nenhum resultado encontrado</p>
              <p className="text-xs mt-1 text-muted-foreground">
                Tente buscar pelos últimos 4 dígitos do TAG ou pelo nome do equipamento
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resultadosVisiveis.map((tag) => {
                const status = getStatusDot(tag.status);
                const prioridade = tag.nota_manutencao ? getPrioridadeBadge(tag.nota_manutencao.prioridade) : null;
                return (
                  <Link
                    key={tag.id}
                    to={`/tag/${tag.id}`}
                    className={`block rounded-none overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-card ${
                      tag.nota_manutencao ? 'border-2 border-destructive shadow-sm shadow-destructive/20' : 'border border-border/50 shadow-sm'
                    }`}
                  >
                    <div className="relative h-40 bg-muted">
                      {tag.foto_url ? (
                        <img src={tag.foto_url} alt={tag.nome_equipamento} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera size={36} className="text-muted-foreground/30" />
                        </div>
                      )}
                      {prioridade && tag.nota_manutencao && (
                        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold shadow ${prioridade}`}>
                          <AlertTriangle size={11} />
                          {tag.nota_manutencao.prioridade.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-card">
                      {tag.nota_manutencao && (
                        <div className="mb-2.5 p-2 rounded flex items-start gap-1.5 text-xs bg-destructive/5 border-l-4 border-destructive">
                          <Wrench size={12} className="flex-shrink-0 mt-0.5 text-destructive" />
                          <div className="min-w-0">
                            <p className="font-semibold text-destructive">Nota: {tag.nota_manutencao.numero_nota}</p>
                            <p className="truncate text-destructive/80">{tag.nota_manutencao.descricao}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-0.5 text-muted-foreground">TAG</p>
                          <p className="text-sm font-bold font-mono text-primary">{highlight(tag.tag_completo)}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 mt-0.5 ${status.container}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                          {tag.status}
                        </div>
                      </div>

                      <p className="text-sm font-medium mb-1 text-foreground">{highlight(tag.nome_equipamento)}</p>
                      <p className="text-xs line-clamp-1 text-muted-foreground">{tag.localizacao_texto}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          </div>
        </section>
      )}

      {/* Empty state: recent tags or how-to */}
      {!query && (
        <>
          {recentTags.length > 0 ? (
            <section className="bg-card border-2 border-border shadow-[var(--shadow-hard)]">
              <header className="flex items-center gap-2 px-4 py-2.5 border-b-2 border-border bg-primary/5">
                <Clock size={14} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.14em] mono text-primary">RECENTES // ACESSOS</span>
              </header>
              <div className="p-5">
              <div className="space-y-2">
                {recentTags.map((r) => {
                  const status = getStatusDot(r.status);
                  return (
                    <Link
                      key={r.id}
                      to={`/tag/${r.id}`}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 border-2 border-border hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold font-mono text-primary flex-shrink-0">
                          {r.tag_completo}
                        </span>
                        <span className="text-sm text-foreground truncate">{r.nome_equipamento}</span>
                      </div>
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium flex-shrink-0 ${status.container}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {r.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
              </div>
            </section>
          ) : (
            <section className="bg-card border-2 border-border shadow-[var(--shadow-hard)]">
              <header className="flex items-center gap-2 px-4 py-2.5 border-b-2 border-border bg-primary/5">
                <Tag size={14} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.14em] mono text-primary">PROTOCOLO // CONSULTA</span>
              </header>
              <div className="p-5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-4 border-2 border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={18} className="text-primary" />
                    <span className="text-sm font-bold uppercase tracking-wider text-primary">Buscar Código</span>
                  </div>
                  <p className="text-xs text-primary/80">
                    Últimos 4 dígitos — ex: <span className="font-mono font-bold">0001</span>, <span className="font-mono font-bold">2002</span>
                  </p>
                </div>
                <div className="p-4 border-2 border-accent/30 bg-accent/5">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode size={18} className="text-accent" />
                    <span className="text-sm font-bold uppercase tracking-wider text-accent">Escanear QR</span>
                  </div>
                  <p className="text-xs text-accent/80">
                    Câmera do dispositivo no QR fixado no equipamento
                  </p>
                </div>
              </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* QR Scanner Modal */}
      {showQrModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50">
          <div className="bg-card rounded shadow-2xl w-full max-w-sm border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <QrCode size={16} className="text-primary" />
                Escanear QR Code
              </h3>
              <button
                onClick={closeQrModal}
                className="p-1 rounded transition-colors text-muted-foreground hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {/* Camera view */}
              <div className="relative w-full aspect-square bg-gray-900 rounded overflow-hidden mb-4 flex items-center justify-center">
                {qrStatus === 'found' ? (
                  <div className="flex flex-col items-center gap-2 z-10 bg-gray-900/80 p-4 rounded-none">
                    <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                      <Scan size={28} className="text-accent" />
                    </div>
                    <p className="text-accent text-sm font-medium">QR Code detectado!</p>
                  </div>
                ) : qrStatus === 'scanning' ? (
                  <Scanner onScan={handleScan} />
                ) : (
                  <div className="text-gray-600 text-xs">A câmera foi pausada</div>
                )}
              </div>

              {/* Status message */}
              {qrStatus === 'scanning' && (
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Aponte para o QR Code do equipamento
                </p>
              )}
              {qrStatus === 'not_found' && (
                <div className="mb-4 p-3 rounded border border-destructive/30 bg-destructive/5 text-center">
                  <p className="text-sm text-destructive">QR Code não reconhecido. Tente novamente.</p>
                </div>
              )}
              {qrStatus === 'found' && (
                <p className="text-center text-sm text-accent font-medium mb-4">
                  Redirecionando para o equipamento…
                </p>
              )}

              <div className="flex gap-3">
                {qrStatus === 'not_found' && (
                  <button
                    onClick={retryQrScan}
                    className="flex-1 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Tentar novamente
                  </button>
                )}
                <button
                  onClick={closeQrModal}
                  className="flex-1 py-2.5 rounded border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(-60px); opacity: 0.3; }
          50% { transform: translateY(60px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
