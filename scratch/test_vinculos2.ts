import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const { data, error } = await supabase.from('tag_manual_vinculo').select('*').limit(1);
  console.log("tag_manual_vinculo error:", error);
  console.log("tag_manual_vinculo data:", data);
}
test();
