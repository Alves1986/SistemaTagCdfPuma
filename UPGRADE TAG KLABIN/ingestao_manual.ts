import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configura o ambiente
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltam variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY no .env raiz.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const VAULT_DIR = path.join(__dirname, '../vault_caldeira_forca');
const CSV_PATH = path.join(__dirname, 'tags_caldeira_catalogo_v2.csv');

async function processPdf(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (err) {
    console.error(`Erro ao processar PDF ${filePath}`, err);
    return '';
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

async function ingestao() {
  console.log("Iniciando ingestão do Manual Técnico...");

  // 1. Inserir Tags do Catálogo (CSV)
  const tagsReferencia: any[] = [];
  console.log("Lendo CSV...");
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => {
        if (data.tag_completo) {
          tagsReferencia.push({
            tag_completo: data.tag_completo.trim(),
            prefixo: data.prefixo?.trim() || null,
            tipo_instrumento: data.tipo_instrumento?.trim() || null,
            descricao: data.descricao?.trim() || 'Sem descrição',
            origem: data.origem?.trim() || 'Desconhecida'
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Lidos ${tagsReferencia.length} equipamentos do CSV. Fazendo upsert no Supabase...`);
  
  for (let i = 0; i < tagsReferencia.length; i += 50) {
    const batch = tagsReferencia.slice(i, i + 50);
    const { error } = await supabase.from('equipamentos_referencia').upsert(batch, { onConflict: 'tag_completo' });
    if (error) {
      console.error("Erro no upsert equipamentos_referencia", error);
    }
  }

  // 2. Processar PDFs (Capítulos)
  console.log("Processando PDFs do manual completo...");
  const pdfFiles = fs.readdirSync(VAULT_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  
  for (const file of pdfFiles) {
    const filePath = path.join(VAULT_DIR, file);
    const conteudo = await processPdf(filePath);
    if (!conteudo) continue;

    const sistema = file.replace('.pdf', '').trim();
    const documento_id = `pdf-${sistema.replace(/[^a-zA-Z0-9]/g, '-')}`;

    const { error } = await supabase.from('manual_documentos').upsert({
      documento_id,
      origem_tipo: 'manual_completo',
      sistema: sistema,
      titulo: file,
      conteudo_md: conteudo
    }, { onConflict: 'documento_id' });

    if (error) {
      console.error(`Erro inserindo PDF ${file}:`, error);
    } else {
      console.log(`PDF inserido: ${file}`);
    }
  }

  // 3. Processar Vault (Markdown)
  const vaultPath = path.join(VAULT_DIR, 'vault');
  if (fs.existsSync(vaultPath)) {
    console.log("Processando fragmentos MD no Vault...");
    const mdFiles = getAllFiles(vaultPath).filter(f => f.toLowerCase().endsWith('.md'));

    for (const file of mdFiles) {
      const conteudo = fs.readFileSync(file, 'utf8');
      const filename = path.basename(file);
      const pastaPath = path.dirname(file);
      const pastaName = path.basename(pastaPath);
      const documento_id = `md-${filename.replace(/[^a-zA-Z0-9]/g, '-')}`;

      const { error } = await supabase.from('manual_documentos').upsert({
        documento_id,
        origem_tipo: 'vault_fragmento',
        pasta: pastaName !== 'vault' ? pastaName : null,
        titulo: filename.replace('.md', ''),
        conteudo_md: conteudo
      }, { onConflict: 'documento_id' });

      if (error) {
        console.error(`Erro inserindo MD ${filename}:`, error);
      } else {
        console.log(`MD inserido: ${filename}`);
      }
    }
  }

  console.log("Criando manual_tag_mentions a partir do CSV...");
  
  const mentions: any[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => {
        if (data.trecho_exemplo && data.trecho_exemplo.trim() !== '') {
          mentions.push({
            tag_completo: data.tag_completo.trim(),
            trecho: data.trecho_exemplo.trim(),
            fonte: data.fonte_trecho?.trim()
          });
        }
      })
      .on('end', resolve);
  });

  if (mentions.length > 0) {
    const { data: docs } = await supabase.from('manual_documentos').select('id, titulo, documento_id');
    const validMentions = [];

    for (const m of mentions) {
      let docId = null;
      if (m.fonte) {
        const found = docs?.find(d => d.titulo.includes(m.fonte) || d.documento_id.includes(m.fonte));
        if (found) docId = found.id;
      }
      if (docId) {
        validMentions.push({
          tag_completo: m.tag_completo,
          trecho: m.trecho,
          documento_id: docId
        });
      }
    }

    if (validMentions.length > 0) {
      console.log(`Inserindo ${validMentions.length} mentions...`);
      for (let i = 0; i < validMentions.length; i += 50) {
        const batch = validMentions.slice(i, i + 50);
        await supabase.from('manual_tag_mentions').insert(batch);
      }
    } else {
      console.log("Nenhuma menção foi validamente mapeada para os documentos existentes.");
    }
  }

  console.log("Finalizado!");
  process.exit(0);
}

ingestao();
