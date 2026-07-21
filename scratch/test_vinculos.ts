import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const { data, error } = await supabase.from('manual_vinculos').select('*').limit(1);
  console.log("manual_vinculos error:", error);
  console.log("manual_vinculos data:", data);
}
test();
