import { Tag, Photo, Comentario } from './types';

// Dados mockados para demonstração
export const mockTags: Tag[] = [
  {
    id: 1,
    tag_completo: 'CAL-BOI-0001',
    ultimos4: '0001',
    nome_equipamento: 'Válvula de Alívio B01',
    localizacao_texto: 'Casa de Máquinas - Tubulação 3',
    status: 'operacional',
    foto_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    criado_em: '2024-01-15T10:00:00Z',
    atualizado_em: '2024-03-20T15:30:00Z',
    atualizado_por: 'João Silva'
  },
  {
    id: 2,
    tag_completo: 'CAL-TUB-0002',
    ultimos4: '0002',
    nome_equipamento: 'Medidor de Pressão P02',
    localizacao_texto: 'Área Externa - Linha Principal',
    status: 'operacional',
    foto_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
    criado_em: '2024-01-15T10:15:00Z',
    atualizado_em: '2024-03-20T15:30:00Z',
    nota_manutencao: {
      numero_nota: 'MNT-2024-045',
      data_abertura: '2024-04-08T09:00:00Z',
      descricao: 'Calibração do medidor de pressão - leitura imprecisa',
      prioridade: 'média',
      aberta_por: 'Maria Santos'
    }
  },
  {
    id: 3,
    tag_completo: 'CAL-MOT-0003',
    ultimos4: '0003',
    nome_equipamento: 'Motor de Alimentação M03',
    localizacao_texto: 'Sala de Bombas - Setor A',
    status: 'manutenção',
    foto_url: 'https://images.unsplash.com/photo-1621905252472-b5f8b9134ce2?w=800',
    criado_em: '2024-01-16T09:00:00Z',
    atualizado_em: '2024-04-05T11:20:00Z',
    atualizado_por: 'Pedro Costa',
    nota_manutencao: {
      numero_nota: 'MNT-2024-052',
      data_abertura: '2024-04-05T08:30:00Z',
      descricao: 'Substituição de rolamentos - vibração excessiva',
      prioridade: 'alta',
      aberta_por: 'Pedro Costa'
    }
  },
  {
    id: 4,
    tag_completo: 'CAL-SEN-0004',
    ultimos4: '0004',
    nome_equipamento: 'Sensor de Temperatura ST04',
    localizacao_texto: 'Tubulação de Vapor - Nível 2',
    status: 'operacional',
    foto_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
    criado_em: '2024-01-16T14:30:00Z',
    atualizado_em: '2024-03-25T09:15:00Z'
  },
  {
    id: 5,
    tag_completo: 'CAL-VAL-2001',
    ultimos4: '2001',
    nome_equipamento: 'Válvula de Controle V2001',
    localizacao_texto: 'Caldeira Principal - Entrada',
    status: 'operacional',
    foto_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
    criado_em: '2024-01-17T08:00:00Z',
    atualizado_em: '2024-04-01T16:45:00Z',
    atualizado_por: 'Ana Oliveira',
    nota_manutencao: {
      numero_nota: 'MNT-2024-061',
      data_abertura: '2024-04-09T14:20:00Z',
      descricao: 'Vazamento detectado na gaxeta - necessário reaperto',
      prioridade: 'urgente',
      aberta_por: 'Ana Oliveira'
    }
  },
  {
    id: 6,
    tag_completo: 'CAL-BOM-2002',
    ultimos4: '2002',
    nome_equipamento: 'Bomba Centrífuga BC2002',
    localizacao_texto: 'Sala de Bombas - Setor B',
    status: 'operacional',
    foto_url: 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?w=800',
    criado_em: '2024-01-17T11:20:00Z',
    atualizado_em: '2024-03-28T14:10:00Z'
  },
  {
    id: 7,
    tag_completo: 'CAL-FLT-0005',
    ultimos4: '0005',
    nome_equipamento: 'Filtro de Água FA05',
    localizacao_texto: 'Tratamento de Água - Entrada',
    status: 'operacional',
    foto_url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=800',
    criado_em: '2024-01-18T07:45:00Z',
    atualizado_em: '2024-04-02T10:30:00Z'
  },
  {
    id: 8,
    tag_completo: 'CAL-TRO-0006',
    ultimos4: '0006',
    nome_equipamento: 'Trocador de Calor TC06',
    localizacao_texto: 'Área de Processo - Nível 1',
    status: 'inativo',
    foto_url: 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?w=800',
    criado_em: '2024-01-18T13:00:00Z',
    atualizado_em: '2024-04-03T08:50:00Z'
  },
  {
    id: 9,
    tag_completo: 'CAL-MAN-1001',
    ultimos4: '1001',
    nome_equipamento: 'Manômetro Digital MD1001',
    localizacao_texto: 'Painel de Controle - Sala Central',
    status: 'operacional',
    foto_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
    criado_em: '2024-01-19T09:30:00Z',
    atualizado_em: '2024-03-30T12:00:00Z'
  },
  {
    id: 10,
    tag_completo: 'CAL-QUE-1002',
    ultimos4: '1002',
    nome_equipamento: 'Queimador Principal QP1002',
    localizacao_texto: 'Fornalha - Caldeira 1',
    status: 'operacional',
    foto_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    criado_em: '2024-01-19T15:15:00Z',
    atualizado_em: '2024-04-04T09:25:00Z'
  }
];

export const mockPhotos: Photo[] = [
  {
    id: 1,
    tag_id: 1,
    uploader: 'João Silva',
    file_path: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
    notes: 'Foto após manutenção preventiva',
    criado_em: '2024-04-05T14:30:00Z'
  },
  {
    id: 2,
    tag_id: 1,
    uploader: 'Maria Santos',
    file_path: 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?w=800',
    notes: 'Ângulo lateral da válvula',
    criado_em: '2024-04-04T10:15:00Z'
  },
  {
    id: 3,
    tag_id: 2,
    uploader: 'Pedro Costa',
    file_path: 'https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=800',
    notes: 'Verificação de leitura de pressão',
    criado_em: '2024-04-06T08:45:00Z'
  },
  {
    id: 4,
    tag_id: 3,
    uploader: 'Ana Oliveira',
    file_path: 'https://images.unsplash.com/photo-1621905252472-b5f8b9134ce2?w=800',
    notes: 'Motor em manutenção',
    criado_em: '2024-04-05T16:20:00Z'
  },
  {
    id: 5,
    tag_id: 4,
    uploader: 'Carlos Ferreira',
    file_path: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
    notes: 'Sensor funcionando normalmente',
    criado_em: '2024-04-03T11:30:00Z'
  },
  {
    id: 6,
    tag_id: 5,
    uploader: 'Luiza Mendes',
    file_path: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
    notes: 'Válvula após ajuste',
    criado_em: '2024-04-06T09:00:00Z'
  }
];

export const mockComentarios: Comentario[] = [
  {
    id: 1,
    tag_id: 1,
    autor: 'João Silva',
    texto: 'Válvula funcionando corretamente após calibração.',
    criado_em: '2024-04-01T10:30:00Z'
  },
  {
    id: 2,
    tag_id: 2,
    autor: 'Maria Santos',
    texto: 'Detectada leitura imprecisa. Necessário calibração urgente.',
    criado_em: '2024-04-08T09:00:00Z'
  },
  {
    id: 3,
    tag_id: 3,
    autor: 'Pedro Costa',
    texto: 'Motor apresentando vibração anormal. Iniciado processo de manutenção.',
    criado_em: '2024-04-05T08:30:00Z'
  },
  {
    id: 4,
    tag_id: 3,
    autor: 'Ana Oliveira',
    texto: 'Aguardando peças de reposição para concluir reparo.',
    criado_em: '2024-04-06T14:15:00Z'
  },
  {
    id: 5,
    tag_id: 5,
    autor: 'Ana Oliveira',
    texto: 'Identificado vazamento na gaxeta. Abertura de nota de manutenção urgente.',
    criado_em: '2024-04-09T14:20:00Z'
  }
];

// Função para buscar TAGs
export function searchTags(query: string): Tag[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Se a query tem exatamente 4 caracteres e é numérica, busca por ultimos4
  const isNumeric = /^\d{4}$/.test(normalizedQuery);
  
  let results = mockTags.filter((tag) => {
    if (isNumeric) {
      return tag.ultimos4 === normalizedQuery;
    } else {
      // Busca por nome do equipamento
      return (
        tag.nome_equipamento.toLowerCase().includes(normalizedQuery) ||
        tag.tag_completo.toLowerCase().includes(normalizedQuery)
      );
    }
  });

  return results;
}