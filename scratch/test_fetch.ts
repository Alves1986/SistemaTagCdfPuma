import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function fetchManualForTag(tagId: string): Promise<any> {
  try {
    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .select("tag_completo")
      .eq("id", tagId)
      .single();
      
    if (tagError) throw new Error(tagError.message);
    
    const { data: vinculos, error: vinculoError } = await supabase
      .from("tag_manual_vinculo")
      .select(`
        id, tag_referencia_id, confianca, confirmado_por, confirmado_em, status,
        equipamentos_referencia (tag_completo, prefixo, tipo_instrumento, descricao, origem)
      `)
      .eq("tag_id", tagId);
      
    if (vinculoError) throw new Error(vinculoError.message);

    const tagsCompletos = vinculos?.map((v: any) => v.equipamentos_referencia?.tag_completo).filter(Boolean) || [];
    
    if (tagsCompletos.length === 0 && tag?.tag_completo) {
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

    return { success: true, vinculos, mentions };
  } catch (error) {
    console.error("Erro ao buscar manual para a tag:", error);
    return { success: false, vinculos: [], mentions: [] };
  }
}

async function test() {
  const data = await fetchManualForTag('194'); // 194 is 37221-FV-5015
  console.log(JSON.stringify(data, null, 2));
}
test();
