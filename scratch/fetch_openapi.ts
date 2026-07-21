import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import * as fs from 'fs';

async function test() {
  const res = await fetch(`https://${projectId}.supabase.co/rest/v1/?apikey=${publicAnonKey}`);
  const json = await res.json();
  fs.writeFileSync('openapi.json', JSON.stringify(json, null, 2));
}
test();
