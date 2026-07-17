type HierarchyData = {
  areas: string[];
  cargos: string[];
  coordenacoes?: Record<string, string[]>;
};

export const HIERARQUIA: Record<string, HierarchyData> = {
  "Fibras": {
    areas: ["Produção Fibras", "Preparo de Madeira"],
    cargos: [
      "Aprendiz", "Operador I", "Operador II", "Operador III", "Operador Lider",
      "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
    ]
  },
  "Papel e Celulose": {
    areas: ["MC25", "MC26", "MP27", "MP28", "Cozinha Couche"],
    cargos: [
      "Aprendiz", "Operador I", "Operador II", "Operador III", "Operador Lider",
      "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
    ]
  },
  "Recuperação e Utilidades": {
    coordenacoes: {
      "Recuperação": ["CDR1/EVAP1", "CDR2/EVAP2", "Planta Quimica (PQ)", "Gaseificação", "Caustificação"],
      "Utilidades": ["CDF1/ETAC1", "CDF2/ETAC2", "ETA/ETE", "ENERGIA (TG)"]
    },
    areas: ["CDR1/EVAP1", "CDR2/EVAP2", "Planta Quimica (PQ)", "Gaseificação", "Caustificação", "CDF1/ETAC1", "CDF2/ETAC2", "ETA/ETE", "ENERGIA (TG)"],
    cargos: [
      "Aprendiz", "Operador II", "Operador III", "Operador Lider",
      "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
    ]
  },
  "Manutenção": {
    areas: ["CDR1/EVAP1", "CDR2/EVAP2", "Planta Quimica (PQ)", "Gaseificação", "Caustificação", "CDF1/ETAC1", "CDF2/ETAC2", "ETA/ETE", "ENERGIA (TG)",
            "Produção Fibras", "Preparo de Madeira",
            "MC25", "MC26", "MP27", "MP28", "Cozinha Couche"],
    cargos: ["Aprendiz", "Gestor de Manutenção", "Engenheiro", "Especialista", "Técnico"]
  }
};

export const GERENCIAS = Object.keys(HIERARQUIA);

// Retorna todas as áreas operacionais (todas as gerências exceto Manutenção)
export function getAllOperationalAreas(): string[] {
  return Object.entries(HIERARQUIA)
    .filter(([key]) => key !== 'Manutenção')
    .flatMap(([, val]) => val.areas);
}

export function getAreasByGerencia(gerencia: string): string[] {
  return HIERARQUIA[gerencia as keyof typeof HIERARQUIA]?.areas || ["A Definir"];
}

export function getCoordenacoesByGerencia(gerencia: string): Record<string, string[]> | undefined {
  return HIERARQUIA[gerencia as keyof typeof HIERARQUIA]?.coordenacoes;
}

export function getAreasByCoordenacao(gerencia: string, coordenacao: string): string[] {
  const coord = getCoordenacoesByGerencia(gerencia);
  if (coord && coord[coordenacao]) {
    return coord[coordenacao];
  }
  return getAreasByGerencia(gerencia);
}

export function getCargosByGerencia(gerencia: string): string[] {
  return HIERARQUIA[gerencia as keyof typeof HIERARQUIA]?.cargos || [
    "Aprendiz", "Operador I", "Operador II", "Operador III", "Operador Lider",
    "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
  ];
}

// Converte nome da área do dropdown para localizacao_texto armazenado nas TAGs
// Com as novas áreas, o nome já é o localizacao_texto (sem tradução)
// Mantemos retrocompatibilidade com áreas antigas
export function getLocalizacaoFromArea(area: string): string {
  // Retrocompatibilidade com dados antigos
  const legacyMap: Record<string, string> = {
    'ETAC II': 'ETAC 2',
    'CDF II': 'Caldeira 2',
    'ETAC I': 'ETAC 1',
    'CDF I': 'Caldeira 1',
  };
  return legacyMap[area] ?? area;
}

// Normaliza nomes de gerência que podem estar salvos com variações no banco
const GERENCIA_ALIAS: Record<string, string> = {
  'Utilidades': 'Recuperação e Utilidades',
  'Recuperacao e Utilidades': 'Recuperação e Utilidades',
  'Recuperação': 'Recuperação e Utilidades',
  'Producao de Papeis': 'Papel e Celulose',
  'Produção de Papéis': 'Papel e Celulose',
  'Producao de Celulose': 'Papel e Celulose',
  'Produção de Celulose': 'Papel e Celulose',
  'Fibra': 'Fibras',
  'Manutencao': 'Manutenção',
};

export function normalizeGerencia(gerencia: string): string {
  if (!gerencia) return 'Recuperação e Utilidades';
  // Já é uma chave válida?
  if (gerencia in HIERARQUIA) return gerencia;
  // Tenta alias direto
  if (gerencia in GERENCIA_ALIAS) return GERENCIA_ALIAS[gerencia];
  // Busca case-insensitive parcial
  const lower = gerencia.toLowerCase();
  if (lower.includes('utilidad')) return 'Recuperação e Utilidades';
  if (lower.includes('papel') || lower.includes('celulose')) return 'Papel e Celulose';
  if (lower.includes('fibra')) return 'Fibras';
  if (lower.includes('manuten')) return 'Manutenção';
  return gerencia;
}
