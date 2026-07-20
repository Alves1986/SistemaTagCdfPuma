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

export const COORDENADORES: Record<string, string> = {
  "Recuperação": "Carlos Alberto",
  "Utilidades": "Felipe Moreira",
  "Produção Fibras": "Roberto Silva",
  "Preparo de Madeira": "Antonio Carlos",
  "MC25": "Marcos Paulo",
  "MC26": "João Pedro",
  "MP27": "Rafael Lima",
  "MP28": "Diego Santos",
  "Cozinha Couche": "Lucas Oliveira"
};

export const GERENCIAS = Object.keys(HIERARQUIA);

export function getCoordenador(coordenacaoOrArea: string): string {
  return COORDENADORES[coordenacaoOrArea] || 'A Definir';
}

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

export function checkAreaMatch(tagLoc: string, targetArea: string) {
  if (!tagLoc) return false;
  const loc = tagLoc.toUpperCase().trim();
  const target = targetArea.toUpperCase().trim();

  // Mapas de sinônimos/legado para robustez
  const map: Record<string, string[]> = {
    'CDF2': ['CDF2', 'CDF 2', 'CDF II', 'CALDEIRA 2', 'CDF2/ETAC2'],
    'ETAC2': ['ETAC2', 'ETAC 2', 'ETAC II', 'CDF2/ETAC2'],
    'CDF1': ['CDF1', 'CDF 1', 'CDF I', 'CALDEIRA 1', 'CDF1/ETAC1'],
    'ETAC1': ['ETAC1', 'ETAC 1', 'ETAC I', 'CDF1/ETAC1'],
    'CDR1': ['CDR1', 'CDR 1', 'CDR I', 'CDR1/EVAP1'],
    'EVAP1': ['EVAP1', 'EVAP 1', 'EVAP I', 'CDR1/EVAP1'],
    'CDR2': ['CDR2', 'CDR 2', 'CDR II', 'CDR2/EVAP2'],
    'EVAP2': ['EVAP2', 'EVAP 2', 'EVAP II', 'CDR2/EVAP2'],
    'ETA': ['ETA', 'ETA/ETE'],
    'ETE': ['ETE', 'ETA/ETE'],
    'ENERGIA (TG)': ['ENERGIA', 'ENERGIA (TG)', 'TG'],
    'PLANTA QUIMICA (PQ)': ['PLANTA QUIMICA', 'PQ', 'PLANTA QUIMICA (PQ)']
  };

  if (target.includes('/')) {
    const parts = target.split('/');
    return parts.some(p => checkAreaMatch(tagLoc, p)) || loc.includes(target);
  }

  if (map[target] && map[target].some(alias => loc.includes(alias))) {
    return true;
  }

  return loc.includes(target) || loc.includes(getLocalizacaoFromArea(targetArea).toUpperCase());
}
