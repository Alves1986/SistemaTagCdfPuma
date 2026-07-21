/* Database functions using Supabase Postgres */
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const client = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

// ============ USERS ============

export const createUser = async (nome: string, prn: string, cargo: string) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("users")
    .insert({ nome, prn, cargo })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const findUserByCredentials = async (nome: string, prn: string) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("nome", nome)
    .eq("prn", prn)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const findUserByNome = async (nome: string) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("nome", nome)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// ============ TAGS ============

export const getAllTags = async () => {
  const supabase = client();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getTagById = async (id: number) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const searchTags = async (query: string) => {
  const supabase = client();

  // Chamar função SQL para busca inteligente
  const { data, error } = await supabase
    .rpc("buscar_tags", { query_text: query });

  if (error) throw new Error(error.message);
  return data;
};

export const createTag = async (tagData: any) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("tags")
    .insert(tagData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateTag = async (id: number, updates: any) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("tags")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const addNotaManutencao = async (id: number, nota: any) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("tags")
    .update({
      nota_manutencao: {
        numero_nota: nota.numero_nota,
        data_abertura: new Date().toISOString(),
        descricao: nota.descricao,
        prioridade: nota.prioridade,
        aberta_por: nota.aberta_por
      }
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const removeNotaManutencao = async (id: number) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("tags")
    .update({ nota_manutencao: null })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ============ COMENTÁRIOS ============

export const getComentariosByTagId = async (tagId: number) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("comentarios")
    .select("*")
    .eq("tag_id", tagId)
    .order("criado_em", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createComentario = async (tagId: number, autor: string, texto: string) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("comentarios")
    .insert({ tag_id: tagId, autor, texto })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ============ FOTOS ============

export const getFotosByTagId = async (tagId: number) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("fotos")
    .select("*")
    .eq("tag_id", tagId)
    .order("criado_em", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createFoto = async (tagId: number, uploader: string, file_path: string, notes?: string) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("fotos")
    .insert({ tag_id: tagId, uploader, file_path, notes })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ============ MANUAL TÉCNICO ============

export const getManualByTagId = async (tagId: string) => {
  const supabase = client();
  
  // Primeiro, buscar a tag e pegar o tag_completo
  const { data: tag, error: tagError } = await supabase
    .from("tags")
    .select("tag_completo")
    .eq("id", tagId)
    .single();
    
  if (tagError) throw new Error(tagError.message);
  
  // Buscar vínculos
  const { data: vinculos, error: vinculoError } = await supabase
    .from("manual_vinculos")
    .select(`
      id, tag_referencia_id, confianca, confirmado_por, confirmado_em, status,
      equipamentos_referencia (tag_completo, prefixo, tipo_instrumento, descricao, origem)
    `)
    .eq("tag_id", tagId);
    
  if (vinculoError) throw new Error(vinculoError.message);

  // Buscar menções (usando o tag_completo original como base ou via os vínculos confirmados)
  const tagsCompletos = vinculos?.map(v => (v.equipamentos_referencia as any)?.tag_completo).filter(Boolean) || [];
  
  if (tagsCompletos.length === 0) {
     tagsCompletos.push(tag.tag_completo);
  }

  const { data: mentions, error: mentionsError } = await supabase
    .from("manual_tag_mentions")
    .select(`
      id, tag_completo, trecho,
      manual_documentos (id, documento_id, titulo, sistema, origem_tipo, pasta)
    `)
    .in("tag_completo", tagsCompletos);

  if (mentionsError) throw new Error(mentionsError.message);

  return { vinculos, mentions };
};

export const searchManual = async (query: string) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("manual_documentos")
    .select("id, documento_id, titulo, sistema, origem_tipo, pasta")
    .textSearch("conteudo_md", query);

  if (error) throw new Error(error.message);
  return data;
};

export const criarVinculoManual = async (tagId: string, tagRefId: string, status: string, usuario: string) => {
  const supabase = client();
  const { data, error } = await supabase
    .from("manual_vinculos")
    .insert({
      tag_id: tagId,
      tag_referencia_id: tagRefId,
      confianca: 'manual',
      status: status,
      confirmado_por: usuario,
      confirmado_em: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const desvincularManual = async (vinculoId: string) => {
  const supabase = client();
  const { error } = await supabase
    .from("manual_vinculos")
    .delete()
    .eq("id", vinculoId);

  if (error) throw new Error(error.message);
  return true;
};
