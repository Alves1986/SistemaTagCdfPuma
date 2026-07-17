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
