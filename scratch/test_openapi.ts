import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const res = await fetch(`https://${projectId}.supabase.co/rest/v1/?apikey=${publicAnonKey}`);
  const json = await res.json();
  const tables = Object.keys(json.definitions);
  console.log("Tables:", tables.filter(t => t.includes('manual') || t.includes('tag')));
}
test();
