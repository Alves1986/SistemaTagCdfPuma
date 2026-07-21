import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const { error } = await supabase.from('tag_manual_vinculo').insert({});
  console.log("tag_manual_vinculo insert error:", error);
}
test();
