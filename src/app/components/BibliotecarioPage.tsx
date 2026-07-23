import { useState } from 'react';
import { Sparkles, Send, Search, BookOpen, AlertCircle, X } from 'lucide-react';
import * as api from '../services/api';
import { TechLabel } from './ui/TechLabel';
import { Panel } from './ui/Panel';
import { Tag, TagType } from '../types';

/**
 * BibliotecarioPage — dedicated KOS AI assistant flow (Fase 2 / Fase 6).
 * Optional TAG selector + free-form question across the whole Base KOS.
 */
export function BibliotecarioPage() {
  const [queryTag, setQueryTag] = useState('');
  const [tagResults, setTagResults] = useState<TagType[]>([]);
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [fontes, setFontes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [erro, setErro] = useState('');

  // B1-B4: histórico + sugestões + copiar + status IA
  interface Turno { pergunta: string; resposta: string; fontes: string[]; fallback: boolean; tag?: string | null; }
  const [historico, setHistorico] = useState<Turno[]>([]);
  const [copiado, setCopiado] = useState(false);

  const SUGESTOES = [
    'Qual a função do economizador?',
    'O que fazer se a válvula de segurança abrir?',
    'Como atuar no steam drum?',
    'Qual o procedimento de partida da caldeira?',
  ];

  const handleTagSearch = async (q: string) => {
    setQueryTag(q);
    if (q.trim().length >= 2) {
      const r = await api.searchTags(q);
      setTagResults(r.slice(0, 8));
    } else {
      setTagResults([]);
    }
  };

  const handlePerguntar = async () => {
    if (!pergunta.trim()) return;
    setLoading(true);
    setErro('');
    setResposta('');
    setFontes([]);
    try {
      const data = selectedTag
        ? await api.perguntarBibliotecario(selectedTag.tag_completo, pergunta)
        : await api.perguntarBibliotecarioGeral(pergunta);
      if (data.success) {
        setResposta(data.resposta || '');
        setFontes(data.fontes || []);
        setFallback(!!data.fallback);
        setHistorico(h => [...h, {
          pergunta,
          resposta: data.resposta || '',
          fontes: data.fontes || [],
          fallback: !!data.fallback,
          tag: selectedTag?.tag_completo ?? null,
        }]);
      } else {
        setErro(data.resposta || 'Erro ao consultar o Bibliotecário.');
      }
    } catch (e: any) {
      setErro(e?.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Panel title="BIBLIOTECÁRIO // IA KOS" icon={<Sparkles size={14} />}>
        <p className="text-sm text-muted-foreground">
          Assistente da Base KOS. Selecione um TAG (opcional) para contextualizar, ou faça uma
          pergunta livre sobre a planta. A resposta usa <span className="font-semibold text-foreground">exclusivamente</span> a Base KOS.
        </p>

        {/* TAG selector */}
        <div className="mt-4 relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={queryTag}
                onChange={(e) => handleTagSearch(e.target.value)}
                placeholder="Selecionar TAG (opcional) — ex: 0001 ou Caldeira"
                className="w-full pl-9 pr-4 py-2.5 border-2 border-border bg-background text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            {selectedTag && (
              <button onClick={() => { setSelectedTag(null); setQueryTag(''); setTagResults([]); }}
                className="px-2 py-2 border border-destructive/40 text-destructive hover:bg-destructive/10">
                <X size={14} />
              </button>
            )}
          </div>
          {tagResults.length > 0 && !selectedTag && (
            <div className="absolute z-20 mt-1 w-full bg-card border-2 border-border shadow-[var(--shadow-hard)] max-h-60 overflow-y-auto">
              {tagResults.map(t => (
                <button key={t.id} onClick={() => { setSelectedTag(t); setQueryTag(t.tag_completo); setTagResults([]); }}
                  className="w-full text-left px-3 py-2 border-b border-border/50 hover:bg-primary/5 last:border-0">
                  <span className="font-mono text-xs font-bold text-primary">{t.tag_completo}</span>
                  <span className="text-sm text-foreground ml-2">{t.nome_equipamento}</span>
                </button>
              ))}
            </div>
          )}
          {selectedTag && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30">
              <BookOpen size={13} className="text-primary" />
              <span className="font-mono text-xs font-bold text-primary">{selectedTag.tag_completo}</span>
              <span className="text-xs text-muted-foreground">{selectedTag.nome_equipamento}</span>
            </div>
          )}
        </div>

        {/* Pergunta */}
        <textarea
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePerguntar(); }}
          placeholder="Ex: O que fazer se a válvula de segurança da caldeira abrir? Qual a função do economizador?"
          className="w-full mt-4 bg-background border-2 border-border px-3 py-3 text-sm text-foreground min-h-[100px] outline-none focus:border-primary"
          rows={4}
        />

        {/* B2: sugestões de perguntas rápidas */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SUGESTOES.map(s => (
            <button key={s} onClick={() => setPergunta(s)}
              className="text-[11px] px-2 py-1 border border-border bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={handlePerguntar}
          disabled={loading || !pergunta.trim()}
          className="mt-3 flex items-center gap-1.5 px-5 py-2.5 border-2 border-primary bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
          {loading ? 'Consultando…' : 'Perguntar à Base KOS'}
        </button>
        <TechLabel className="ml-3">CTRL+ENTER p/ enviar</TechLabel>
      </Panel>

      {erro && (
        <div className="text-sm text-destructive bg-destructive/10 border-2 border-destructive/30 p-3 flex items-start gap-2">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {resposta && (
        <Panel title={fallback ? 'RESPOSTA // MODO BUSCA (SEM IA)' : 'RESPOSTA // BIBLIOTECÁRIO'} icon={<Sparkles size={14} />}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <TechLabel>{fallback ? 'Fallback full-text' : 'IA KOS ativa'}</TechLabel>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(resposta + (fontes.length ? '\n\nFontes: ' + fontes.join('\n') : ''));
                  setCopiado(true);
                  setTimeout(() => setCopiado(false), 1500);
                } catch { /* ignore */ }
              }}
              className="text-[11px] px-2 py-1 border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <div className="text-sm text-foreground/90 bg-background/60 border border-border p-4 whitespace-pre-wrap max-h-[480px] overflow-y-auto">
            {resposta}
          </div>
          {fontes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {fontes.slice(0, 8).map((f, i) => (
                <span key={i} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 flex items-center gap-1 border border-border">
                  <BookOpen size={10} /> {f.slice(0, 44)}
                </span>
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* B1: histórico da conversa */}
      {historico.length > 0 && (
        <Panel title={`HISTÓRICO // ${historico.length} CONSULTA(S)`} icon={<BookOpen size={14} />}>
          <div className="space-y-3">
            {historico.slice().reverse().map((t, i) => (
              <div key={i} className="border border-border p-3 bg-background/40">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-1.5 py-0.5">Pergunta</span>
                  {t.tag && <span className="font-mono text-[10px] text-muted-foreground">{t.tag}</span>}
                  {t.fallback && <span className="text-[10px] text-amber-600">busca</span>}
                </div>
                <p className="text-xs font-medium text-foreground mb-1.5">{t.pergunta}</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">{t.resposta}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
