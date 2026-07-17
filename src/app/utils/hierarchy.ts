export const HIERARQUIA = {
  "Fibras": {
    areas: ["A Definir"],
    cargos: [
      "Aprendiz", "Operador II", "Operador III", "Operador Lider",
      "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
    ]
  },
  "Produção de Papéis": {
    areas: ["A Definir"],
    cargos: [
      "Aprendiz", "Operador II", "Operador III", "Operador Lider",
      "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
    ]
  },
  "Produção de Celulose": {
    areas: ["A Definir"],
    cargos: [
      "Aprendiz", "Operador II", "Operador III", "Operador Lider",
      "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
    ]
  },
  "Recuperação e Utilidades": {
    areas: ["CDF II", "ETAC II", "CDF I", "ETAC I"],
    cargos: [
      "Aprendiz", "Operador II", "Operador III", "Operador Lider",
      "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
    ]
  },
  "Manutenção": {
    areas: ["CDF II", "ETAC II", "CDF I", "ETAC I"],
    cargos: ["Gestor de Manutenção", "Engenheiro", "Especialista", "Técnico"]
  }
};

export const GERENCIAS = Object.keys(HIERARQUIA);

export function getAreasByGerencia(gerencia: string): string[] {
  return HIERARQUIA[gerencia as keyof typeof HIERARQUIA]?.areas || ["A Definir"];
}

export function getCargosByGerencia(gerencia: string): string[] {
  return HIERARQUIA[gerencia as keyof typeof HIERARQUIA]?.cargos || [
    "Aprendiz", "Operador II", "Operador III", "Operador Lider",
    "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
  ];
}

export function getLocalizacaoFromArea(area: string) {
  switch (area) {
    case 'ETAC II': return 'ETAC 2';
    case 'CDF II': return 'Caldeira 2';
    case 'ETAC I': return 'ETAC 1';
    case 'CDF I': return 'Caldeira 1';
    default: return area;
  }
}

// Normaliza nomes de gerência que podem estar salvos com variações no banco
const GERENCIA_ALIAS: Record<string, string> = {
  'Utilidades': 'Recuperação e Utilidades',
  'Recuperacao e Utilidades': 'Recuperação e Utilidades',
  'Recuperação': 'Recuperação e Utilidades',
  'Producao de Papeis': 'Produção de Papéis',
  'Producao de Celulose': 'Produção de Celulose',
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
  if (lower.includes('papel') || lower.includes('papel')) return 'Produção de Papéis';
  if (lower.includes('celulose')) return 'Produção de Celulose';
  if (lower.includes('fibra')) return 'Fibras';
  if (lower.includes('manuten')) return 'Manutenção';
  return gerencia;
}
