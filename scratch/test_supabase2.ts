import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const tag_completo2 = '37221-FV-5015';
  const { data: mentions, error: mentionsError } = await supabase
      .from("manual_tag_mentions")
      .select(`
        id, tag_completo, trecho,
        manual_documentos (id, documento_id, titulo, sistema, origem_tipo, pasta)
      `)
      .in("tag_completo", [tag_completo2]);
  console.log("mentions error:", mentionsError);
  console.log("mentions data:", JSON.stringify(mentions, null, 2));
}
test();
