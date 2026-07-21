import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const { data } = await supabase.from('tag_manual_vinculo').select('*').limit(1);
  console.log("data:", JSON.stringify(data, null, 2));
}
test();
