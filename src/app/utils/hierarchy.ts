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
    areas: ["CDF2 / ETAC2", "CDF1 / ETAC1", "Tratamento de Efluentes"],
    cargos: [
      "Aprendiz", "Operador II", "Operador III", "Operador Lider",
      "Coordenador", "Especialista", "Engenheiro", "Assistente Tecnico"
    ]
  },
  "Manutenção": {
    areas: ["Gerência de Manutenção"],
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
