import { useState } from 'react';
import { BookOpen, Search, FileText, Network, Link as LinkIcon } from 'lucide-react';
import * as api from '../services/api';
import { TechLabel } from './ui/TechLabel';
import { Panel } from './ui/Panel';

/**
 * BaseKosPage — dedicated KOS knowledge base consultation flow (Fase 1).
 * Global search across manual_documentos + mentions; results grouped by Sistema.
 */
export function BaseKosPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // K1-K4: filtro tipo + highlight + ordenação + contagem
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'KOS' | 'Manual' | 'PIC'>('todos');
  const [sortBy, setSortBy] = useState<'relevancia' | 'sistema' | 'titulo'>('relevancia');

  const resultadosVisiveis = (() => {
    let lista = [...results];
    if (filtroTipo !== 'todos') {
      lista = lista.filter(r => (r.origem_tipo || 'KOS').toUpperCase() === filtroTipo.toUpperCase());
    }
    if (sortBy === 'titulo') lista.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
    else if (sortBy === 'sistema') lista.sort((a, b) => (a.sistema || '').localeCompare(b.sistema || ''));
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

  const bySistema = resultadosVisiveis.reduce((acc: Record<string, any[]>, r: any) => {
    const sys = r.sistema || 'Geral';
    if (!acc[sys]) acc[sys] = [];
    acc[sys].push(r);
    return acc;
  }, {} as Record<string, any[]>);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    const data = await api.searchManual(q);
    if (data.success) setResults(data.resultados || []);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <Panel title="CONSULTA // BASE KOS" icon={<BookOpen size={14} />}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter'}
              placeholder="Buscar na Base KOS (ex: Caldeira, válvula de segurança, PIC-123)…"
              className="w-full pl-10 pr-4 py-3 border-2 border-border bg-muted/20 text-sm text-foreground outline-none transition-all focus:border-primary focus:bg-background"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground mono">
          SYS // busca textual em {`{manual_documentos}`} e trechos vinculados
        </p>
      </Panel>

      {/* Results */}
      {searched && (
        <Panel
          title={loading ? 'PROCESSANDO' : `RESULTADOS // ${resultadosVisiveis.length}`}
          icon={<Network size={14} />}
        >
          {/* K1+K3: filtro tipo + ordenação */}
          {!loading && resultadosVisiveis.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              {(['todos','KOS','Manual','PIC'] as const).map(t => (
                <button key={t} onClick={() => setFiltroTipo(t)}
                  className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-none border transition-colors ${filtroTipo===t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                  {t === 'todos' ? 'Todos' : t}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">Ordenar:</span>
              {(['relevancia','sistema','titulo'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-2 py-1 text-xs rounded-none border transition-colors ${sortBy===s ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                  {s === 'relevancia' ? 'Relev.' : s === 'sistema' ? 'Sistema' : 'Título'}
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <TechLabel>buscando na base…</TechLabel>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">Nenhum documento encontrado</p>
              <p className="text-xs mt-1 text-muted-foreground">Tente outro termo ou TAG</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.keys(bySistema).map(sistema => (
                <div key={sistema}>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b-2 border-border">
                    <TechLabel>{sistema}</TechLabel>
                    <span className="text-[0.65rem] mono text-muted-foreground">({bySistema[sistema].length})</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {bySistema[sistema].map((r: any) => (
                      <div key={r.id} className="bg-background/50 border border-border p-3 hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <FileText size={13} className="text-primary flex-shrink-0 mt-0.5" />
                            {highlight(r.titulo)}
                          </span>
                          <span className="text-[0.6rem] mono bg-primary/10 text-primary px-1.5 py-0.5 flex-shrink-0">
                            {r.origem_tipo || 'KOS'}
                          </span>
                        </div>
                        {r.trecho && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 whitespace-pre-wrap">{highlight(r.trecho)}</p>
                        )}
                        <div className="mt-2 flex items-center gap-1 text-[0.65rem] mono text-muted-foreground">
                          <LinkIcon size={11} /> {r.tag_referencia || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {!searched && (
        <Panel title="ÍNDICE // BASE KOS" icon={<Network size={14} />}>
          <p className="text-sm text-muted-foreground">
            A Base KOS reúne o conhecimento técnico da planta: instruções, procedimentos, treinamentos,
            alarmes e intertravamentos vinculados aos equipamentos. Use a busca acima para localizar
            trechos por equipamento, sistema ou TAG.
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Caldeira', 'Turbina', 'Gerador', 'Válvula'].map(s => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="px-3 py-2 border border-border text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
