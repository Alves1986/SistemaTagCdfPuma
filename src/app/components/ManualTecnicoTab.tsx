import React, { useState, useEffect } from 'react';
import { BookOpen, Search, CheckCircle, Link as LinkIcon, ExternalLink, MapPin, FileText, Network } from 'lucide-react';
import { fetchManualForTag, searchManual, vincularManual, desvincularManual } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ManualTecnicoTabProps {
  tagId: string;
  tagCompleto: string;
}

export function ManualTecnicoTab({ tagId, tagCompleto }: ManualTecnicoTabProps) {
  const { user } = useAuth();
  const [vinculos, setVinculos] = useState<any[]>([]);
  const [mentions, setMentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // É Gestor se for Coordenador ou Líder
  const isGestor = user?.cargo === 'Coordenador' || user?.cargo === 'Líder';

  useEffect(() => {
    loadManualData();
  }, [tagId]);

  const loadManualData = async () => {
    setLoading(true);
    try {
      const data = await fetchManualForTag(tagId);
      if (data.success) {
        setVinculos(data.vinculos || []);
        setMentions(data.mentions || []);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    const data = await searchManual(searchQuery);
    if (data.success) {
      setSearchResults(data.resultados || []);
    }
    setSearching(false);
  };

  const handleVincular = async (tagRefId: string) => {
    if (!user) return;
    const res = await vincularManual(tagId, tagRefId, 'confirmado', user.nome);
    if (res.success) {
      loadManualData();
    }
  };

  const handleDesvincular = async (vinculoId: string) => {
    const res = await desvincularManual(tagId, vinculoId);
    if (res.success) {
      loadManualData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Agrupamento por Sistema
  const mentionsBySistema = mentions.reduce((acc, m) => {
    const doc = m.manual_documentos;
    if (!doc) return acc;
    const sys = doc.sistema || doc.pasta || 'Geral';
    if (!acc[sys]) acc[sys] = [];
    acc[sys].push({
      ...m,
      titulo: doc.titulo,
      origem: doc.origem_tipo
    });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {/* Identificação do equipamento na Base KOS */}
      {vinculos.length > 0 && (
        <div className="space-y-3">
          {vinculos.map((v: any) => {
            const eq = v.equipamentos_referencia;
            if (!eq) return null;
            return (
              <div key={v.id} className="bg-background/50 border border-border rounded-none p-3 panel">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-semibold text-foreground font-mono text-sm break-all">
                      {eq.tag_completo}
                    </span>
                    {eq.tipo_instrumento && (
                      <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-none ml-2">
                        {eq.tipo_instrumento}
                      </span>
                    )}
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-none ml-1 mono">
                      {v.confianca}
                    </span>
                  </div>
                  {isGestor && (
                    <button
                      onClick={() => handleDesvincular(v.id)}
                      className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      title="Desvincular"
                    >
                      desvincular
                    </button>
                  )}
                </div>

                {eq.descricao && (
                  <p className="text-xs text-foreground/90 mt-1 flex items-start gap-1.5">
                    <FileText size={13} className="flex-shrink-0 mt-0.5" />
                    <span>{eq.descricao}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pesquisa na Base KOS (Gestores) */}
      {isGestor && (
        <div className="bg-card border border-border rounded-none p-4 space-y-3 panel">
          <h3 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wide">
            <Search className="w-4 h-4" /> Buscar na Base KOS (Vínculo)
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Digite o texto para buscar (ex: PIC-123)"
              className="flex-1 bg-background border border-border rounded-none px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-none text-sm font-semibold border border-primary disabled:opacity-50"
            >
              Buscar
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((res: any) => (
                <div key={res.id} className="text-sm bg-background/50 border border-border rounded-none p-3 flex justify-between items-center hover:bg-background/80 transition-colors">
                  <div>
                    <span className="font-semibold text-foreground">{res.titulo}</span>
                    <span className="text-xs text-muted-foreground ml-2">({res.sistema})</span>
                  </div>
                  <button
                    onClick={() => handleVincular(res.titulo)}
                    className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded-none hover:bg-primary/90 font-semibold"
                    title="Vincular este documento ao TAG"
                  >
                    vincular
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tudo relacionado (botões de navegação por tipo) */}
      {mentions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Network className="w-4 h-4" /> Ver Relacionados
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(mentionsBySistema).map(sistema => (
              <span
                key={sistema}
                className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-none mono"
                title={`${mentionsBySistema[sistema].length} trecho(s) no sistema ${sistema}`}
              >
                {sistema} ({mentionsBySistema[sistema].length})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trechos Relacionados (Acordeão por Sistema) */}
      <div className="space-y-4 mt-6">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Trechos da Base KOS
        </h3>

        {Object.keys(mentionsBySistema).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma menção encontrada na Base KOS para este TAG.
          </p>
        ) : (
          Object.keys(mentionsBySistema).map(sistema => (
            <div key={sistema} className="border border-border rounded-none overflow-hidden panel">
              <div className="bg-card px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b border-border text-foreground uppercase tracking-wide">
                {sistema}
              </div>
              <div className="divide-y divide-border bg-background">
                {mentionsBySistema[sistema].map((m: any) => (
                  <div key={m.id} className="p-4 hover:bg-accent/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-primary">{m.titulo}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-none mono">
                        {m.origem === 'kos_conhecimento' ? 'KOS' : m.origem}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {m.trecho}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
