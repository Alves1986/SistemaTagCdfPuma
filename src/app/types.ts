// Tipos de dados do sistema
export interface Tag {
  id: number;
  tag_completo: string;
  ultimos4: string;
  nome_equipamento: string;
  localizacao_texto: string;
  status: 'operacional' | 'manutenção' | 'inativo';
  foto_url?: string;
  criado_em: string;
  atualizado_em: string;
  atualizado_por?: string;
  nota_manutencao?: NotaManutencao;
}

export interface NotaManutencao {
  numero_nota: string;
  data_abertura: string;
  descricao: string;
  prioridade: 'baixa' | 'média' | 'alta' | 'urgente';
  aberta_por: string;
  especialidade?: 'Mecânica' | 'Elétrica' | 'Instrumentação' | 'Automação';
  status_manutencao?: 'aberta' | 'visualizada' | 'em_tratamento' | 'finalizada_manutencao';
}

export interface Photo {
  id: number;
  tag_id: number;
  uploader: string;
  file_path: string;
  notes?: string;
  criado_em: string;
}

export interface Comentario {
  id: number;
  tag_id: number;
  autor: string;
  texto: string;
  criado_em: string;
}

export interface SearchResult extends Tag {
  distance_m?: number;
}