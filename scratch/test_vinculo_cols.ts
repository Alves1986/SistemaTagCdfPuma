import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const { data, error } = await supabase.from('tag_manual_vinculo').select().limit(1);
  console.log("data:", data);
  if (data && data.length === 0) {
     const { data: cols } = await supabase.from('tag_manual_vinculo').select().limit(1);
     console.log(cols);
  }
}
test();
