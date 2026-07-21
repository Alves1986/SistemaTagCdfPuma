import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'tag_manual_vinculo' });
  console.log(data, error);
}
test();
