import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Tag, Comentario, Photo, NotaManutencao } from '../types';
import { supabase, UserProfile } from '../lib/supabase';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e7ada368`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// Flag para verificar se API está disponível
let apiAvailable: boolean | null = null;

async function checkApiAvailability(): Promise<boolean> {
  if (apiAvailable !== null) return apiAvailable;

  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(3000)
    });
    apiAvailable = response.ok;
  } catch {
    apiAvailable = false;
  }

  return apiAvailable;
}

// ============ AUTENTICAÇÃO ============

export async function register(nome: string, prn: string, cargo: string) {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    // Fallback local
    return registerLocal(nome, prn, cargo);
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ nome, prn, cargo })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao registrar usuário');
    }

    return data;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    return registerLocal(nome, prn, cargo);
  }
}

export async function login(nome: string, prn: string) {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    // Fallback local
    return loginLocal(nome, prn);
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ nome, prn })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao fazer login');
    }

    return data;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    return loginLocal(nome, prn);
  }
}

// ============ FALLBACK LOCAL ============

function registerLocal(nome: string, prn: string, cargo: string) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const existingUser = users.find((u: any) => u.nome.toLowerCase() === nome.toLowerCase());
  if (existingUser) {
    throw new Error('Já existe um usuário cadastrado com este nome');
  }

  if (prn.length < 4) {
    throw new Error('O PRN deve ter pelo menos 4 caracteres');
  }

  const newUser = {
    id: Date.now().toString(),
    nome,
    prn,
    cargo,
    criado_em: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  return {
    success: true,
    user: { id: newUser.id, nome: newUser.nome, cargo: newUser.cargo, prn: newUser.prn }
  };
}

function loginLocal(nome: string, prn: string) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const user = users.find((u: any) =>
    u.nome.toLowerCase() === nome.toLowerCase() && u.prn === prn
  );

  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  return {
    success: true,
    user: { id: user.id, nome: user.nome, cargo: user.cargo, prn: user.prn }
  };
}

// ============ TAGs ============

export async function getAllTags(): Promise<Tag[]> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    const tags = JSON.parse(localStorage.getItem('tags') || '[]');
    return tags.sort((a: Tag, b: Tag) => b.id - a.id);
  }

  try {
    const response = await fetch(`${BASE_URL}/tags`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar TAGs');
    }

    return data.tags;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    const tags = JSON.parse(localStorage.getItem('tags') || '[]');
    return tags.sort((a: Tag, b: Tag) => b.id - a.id);
  }
}

export async function getTagById(id: number): Promise<Tag> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    const tags = JSON.parse(localStorage.getItem('tags') || '[]');
    const tag = tags.find((t: Tag) => t.id === id);
    if (!tag) throw new Error('TAG não encontrado');
    return tag;
  }

  try {
    const response = await fetch(`${BASE_URL}/tags/${id}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar TAG');
    }

    return data.tag;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    const tags = JSON.parse(localStorage.getItem('tags') || '[]');
    const tag = tags.find((t: Tag) => t.id === id);
    if (!tag) throw new Error('TAG não encontrado');
    return tag;
  }
}

export async function searchTags(query: string): Promise<Tag[]> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    return searchTagsLocal(query);
  }

  try {
    const response = await fetch(`${BASE_URL}/tags/search/${encodeURIComponent(query)}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar TAGs');
    }

    return data.tags;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    return searchTagsLocal(query);
  }
}

function searchTagsLocal(query: string): Tag[] {
  const tags = JSON.parse(localStorage.getItem('tags') || '[]');
  const normalizedQuery = query.toLowerCase().trim();
  const isNumeric = /^\d{4}$/.test(normalizedQuery);

  return tags.filter((tag: Tag) => {
    if (isNumeric) {
      return tag.ultimos4 === normalizedQuery;
    } else {
      return (
        tag.nome_equipamento.toLowerCase().includes(normalizedQuery) ||
        tag.tag_completo.toLowerCase().includes(normalizedQuery)
      );
    }
  });
}

export async function createTag(tagData: {
  tag_completo: string;
  nome_equipamento: string;
  localizacao_texto: string;
  status: 'operacional' | 'manutenção' | 'inativo';
  foto_url?: string;
  user_nome?: string;
}): Promise<Tag> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    return createTagLocal(tagData);
  }

  try {
    const response = await fetch(`${BASE_URL}/tags`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tagData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar TAG');
    }

    return data.tag;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    return createTagLocal(tagData);
  }
}

function createTagLocal(tagData: any): Tag {
  const tags = JSON.parse(localStorage.getItem('tags') || '[]');
  const ultimos4Match = tagData.tag_completo.match(/\d{4}$/);

  if (!ultimos4Match) {
    throw new Error('O TAG deve terminar com 4 dígitos');
  }

  const newTag: Tag = {
    id: Date.now(),
    tag_completo: tagData.tag_completo,
    ultimos4: ultimos4Match[0],
    nome_equipamento: tagData.nome_equipamento,
    localizacao_texto: tagData.localizacao_texto,
    status: tagData.status,
    foto_url: tagData.foto_url || undefined,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
    atualizado_por: tagData.user_nome
  };

  tags.push(newTag);
  localStorage.setItem('tags', JSON.stringify(tags));
  return newTag;
}

export async function updateTag(id: number, updates: Partial<Tag>): Promise<Tag> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    return updateTagLocal(id, updates);
  }

  try {
    const response = await fetch(`${BASE_URL}/tags/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar TAG');
    }

    return data.tag;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    return updateTagLocal(id, updates);
  }
}

function updateTagLocal(id: number, updates: Partial<Tag>): Tag {
  const tags = JSON.parse(localStorage.getItem('tags') || '[]');
  const tagIndex = tags.findIndex((t: Tag) => t.id === id);

  if (tagIndex === -1) {
    throw new Error('TAG não encontrado');
  }

  tags[tagIndex] = {
    ...tags[tagIndex],
    ...updates,
    atualizado_em: new Date().toISOString()
  };

  localStorage.setItem('tags', JSON.stringify(tags));
  return tags[tagIndex];
}

export async function addNotaManutencao(
  tagId: number,
  nota: {
    numero_nota: string;
    descricao: string;
    prioridade: 'baixa' | 'média' | 'alta' | 'urgente';
    aberta_por: string;
  }
): Promise<Tag> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    return addNotaLocal(tagId, nota);
  }

  try {
    const response = await fetch(`${BASE_URL}/tags/${tagId}/nota`, {
      method: 'POST',
      headers,
      body: JSON.stringify(nota)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao adicionar nota de manutenção');
    }

    return data.tag;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    return addNotaLocal(tagId, nota);
  }
}

function addNotaLocal(tagId: number, nota: any): Tag {
  const tags = JSON.parse(localStorage.getItem('tags') || '[]');
  const tagIndex = tags.findIndex((t: Tag) => t.id === tagId);

  if (tagIndex === -1) {
    throw new Error('TAG não encontrado');
  }

  tags[tagIndex].nota_manutencao = {
    numero_nota: nota.numero_nota,
    data_abertura: new Date().toISOString(),
    descricao: nota.descricao,
    prioridade: nota.prioridade,
    aberta_por: nota.aberta_por
  };

  tags[tagIndex].atualizado_em = new Date().toISOString();
  localStorage.setItem('tags', JSON.stringify(tags));
  return tags[tagIndex];
}

export async function removeNotaManutencao(tagId: number): Promise<Tag> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    return removeNotaLocal(tagId);
  }

  try {
    const response = await fetch(`${BASE_URL}/tags/${tagId}/nota`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ remover: true })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao remover nota de manutenção');
    }

    return data.tag;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    return removeNotaLocal(tagId);
  }
}

function removeNotaLocal(tagId: number): Tag {
  const tags = JSON.parse(localStorage.getItem('tags') || '[]');
  const tagIndex = tags.findIndex((t: Tag) => t.id === tagId);

  if (tagIndex === -1) {
    throw new Error('TAG não encontrado');
  }

  tags[tagIndex].nota_manutencao = undefined;
  tags[tagIndex].atualizado_em = new Date().toISOString();
  localStorage.setItem('tags', JSON.stringify(tags));
  return tags[tagIndex];
}

// ============ COMENTÁRIOS ============

export async function getComentarios(tagId: number): Promise<Comentario[]> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    const comentarios = JSON.parse(localStorage.getItem('comentarios') || '[]');
    return comentarios.filter((c: Comentario) => c.tag_id === tagId)
      .sort((a: Comentario, b: Comentario) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }

  try {
    const response = await fetch(`${BASE_URL}/tags/${tagId}/comentarios`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar comentários');
    }

    return data.comentarios;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    const comentarios = JSON.parse(localStorage.getItem('comentarios') || '[]');
    return comentarios.filter((c: Comentario) => c.tag_id === tagId)
      .sort((a: Comentario, b: Comentario) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }
}

export async function addComentario(
  tagId: number,
  autor: string,
  texto: string
): Promise<Comentario> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    return addComentarioLocal(tagId, autor, texto);
  }

  try {
    const response = await fetch(`${BASE_URL}/tags/${tagId}/comentarios`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ autor, texto })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao adicionar comentário');
    }

    return data.comentario;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    return addComentarioLocal(tagId, autor, texto);
  }
}

function addComentarioLocal(tagId: number, autor: string, texto: string): Comentario {
  const comentarios = JSON.parse(localStorage.getItem('comentarios') || '[]');

  const newComment: Comentario = {
    id: Date.now(),
    tag_id: tagId,
    autor,
    texto,
    criado_em: new Date().toISOString()
  };

  comentarios.push(newComment);
  localStorage.setItem('comentarios', JSON.stringify(comentarios));
  return newComment;
}

// ============ FOTOS ============

export async function getFotos(tagId: number): Promise<Photo[]> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    const fotos = JSON.parse(localStorage.getItem('fotos') || '[]');
    return fotos.filter((f: Photo) => f.tag_id === tagId)
      .sort((a: Photo, b: Photo) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }

  try {
    const response = await fetch(`${BASE_URL}/tags/${tagId}/fotos`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar fotos');
    }

    return data.fotos;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    const fotos = JSON.parse(localStorage.getItem('fotos') || '[]');
    return fotos.filter((f: Photo) => f.tag_id === tagId)
      .sort((a: Photo, b: Photo) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }
}

export async function addFoto(
  tagId: number,
  uploader: string,
  file_path: string,
  notes?: string
): Promise<Photo> {
  const isApiAvailable = await checkApiAvailability();

  if (!isApiAvailable) {
    return addFotoLocal(tagId, uploader, file_path, notes);
  }

  try {
    const response = await fetch(`${BASE_URL}/tags/${tagId}/fotos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ uploader, file_path, notes })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao adicionar foto');
    }

    return data.foto;
  } catch (error) {
    console.warn('API não disponível, usando fallback local');
    return addFotoLocal(tagId, uploader, file_path, notes);
  }
}

function addFotoLocal(tagId: number, uploader: string, file_path: string, notes?: string): Photo {
  const fotos = JSON.parse(localStorage.getItem('fotos') || '[]');

  const newPhoto: Photo = {
    id: Date.now(),
    tag_id: tagId,
    uploader,
    file_path,
    notes: notes || undefined,
    criado_em: new Date().toISOString()
  };

  fotos.push(newPhoto);
  localStorage.setItem('fotos', JSON.stringify(fotos));
  return newPhoto;
}

// ============ PROFILES (SUPABASE DIRECT) ============

export async function getAllProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Erro ao buscar perfis:', error);
    return [];
  }
  return data as UserProfile[];
}

export async function updateProfile(id: string, updates: Partial<UserProfile>): Promise<boolean> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', id);
  if (error) {
    console.error('Erro ao atualizar perfil:', error);
    return false;
  }
  return true;
}

