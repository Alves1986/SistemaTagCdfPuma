import React, { useState } from 'react';
import { BookOpen, Send, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { perguntarBibliotecario } from '../services/api';

interface BibliotecarioTabProps {
  tagCompleto: string;
}

export function BibliotecarioTab({ tagCompleto }: BibliotecarioTabProps) {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [fontes, setFontes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [erro, setErro] = useState('');

  const handlePerguntar = async () => {
    if (!pergunta.trim()) return;
    setLoading(true);
    setErro('');
    setResposta('');
    setFontes([]);
    try {
      const data = await perguntarBibliotecario(tagCompleto, pergunta);
      if (data.success) {
        setResposta(data.resposta || '');
        setFontes(data.fontes || []);
        setFallback(!!data.fallback);
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="mono uppercase tracking-wider">Bibliotecário KOS</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Pergunte sobre o TAG <span className="font-mono font-medium text-foreground">{tagCompleto}</span>.
        A resposta é gerada com base exclusiva na Base KOS.
      </p>

      <textarea
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePerguntar();
        }}
        placeholder="Ex: O que fazer se este sensor falhar? Qual sua função?"
        className="w-full bg-background border border-border rounded-none px-3 py-2 text-sm text-foreground min-h-[80px] outline-none focus:border-primary"
        rows={3}
      />

      <button
        onClick={handlePerguntar}
        disabled={loading || !pergunta.trim()}
        className="flex items-center gap-1.5 px-4 py-2 rounded-none border border-primary bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send size={14} />
        )}
        Perguntar
      </button>

      {erro && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-none p-3 flex items-start gap-2">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {resposta && (
        <div className="space-y-2">
          {fallback && (
            <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-none px-2 py-1 flex items-center gap-1.5">
              <AlertCircle size={12} /> Modo busca (sem IA): trechos brutos da Base KOS
            </div>
          )}
          <div className="text-sm text-foreground/90 bg-background/60 border border-border rounded-none p-3 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {resposta}
          </div>
          {fontes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {fontes.slice(0, 6).map((f, i) => (
                <span key={i} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-none flex items-center gap-1">
                  <BookOpen size={10} /> {f.slice(0, 40)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
