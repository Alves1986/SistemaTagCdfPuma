import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const tag_completo = '37220-V-5121';
  const { data } = await supabase.from('manual_tag_mentions').select('*').in('tag_completo', [tag_completo]);
  console.log("37220-V-5121 mentions:", data);

  const tag_completo2 = '37221-FV-5015';
  const { data: data2, error: error2 } = await supabase.from('manual_tag_mentions').select('*').in('tag_completo', [tag_completo2]);
  console.log("37221-FV-5015 mentions error:", error2);
  console.log("37221-FV-5015 mentions:", data2);
  
  const { data: tags } = await supabase.from('tags').select('id, tag_completo').eq('tag_completo', tag_completo2);
  console.log("37221-FV-5015 in tags table:", tags);
}
test();
