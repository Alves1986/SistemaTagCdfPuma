const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TRANSCRIPT_PATH = 'C:\\Users\\Cassi\\.gemini\\antigravity-ide\\brain\\b19029db-1451-4530-83fa-4eb2e5db25d7\\.system_generated\\logs\\transcript.jsonl';
const SQL_OUTPUT = path.join(__dirname, '..', 'seed_tags.sql');
const MOCK_OUTPUT = path.join(__dirname, '..', 'src', 'app', 'mockData.ts');

const TAG_REGEX = /^(\d{5}-[A-Z0-9-/]+)\s+(.+)$/i;

async function extractFromTranscript() {
  const fileStream = fs.createReadStream(TRANSCRIPT_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const tags = [];
  const uniqueTagsMap = new Map();

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      // We look for tool calls to view_file that have the PDF content
      if (entry.type === 'PLANNER_RESPONSE' && entry.tool_calls) {
        for (const call of entry.tool_calls) {
          // If the model called view_file on a pdf, the response will be in the next steps,
          // but wait, the response is in 'TOOL_RESPONSE' type.
        }
      }
      
      if (entry.type === 'TOOL_RESPONSE' && entry.tool_name === 'view_file') {
        const output = entry.content;
        if (output && (output.includes('==Start of OCR for page') || output.includes('==Start of PDF=='))) {
          // This is a PDF OCR output.
          const lines = output.split('\\n');
          for (let l of lines) {
            // Also handle raw \n from JSON parsing if it wasn't unescaped
            const sublines = l.split('\n');
            for (let sl of sublines) {
              sl = sl.trim();
              if (!sl) continue;
              
              const match = sl.match(TAG_REGEX);
              if (match) {
                const tag_completo = match[1].trim();
                let descricao = match[2].trim();
                
                // Get last 4 digits
                const ultimos4Match = tag_completo.match(/(\d{4})$/);
                const ultimos4 = ultimos4Match ? ultimos4Match[1] : tag_completo.slice(-4);
                
                // Simple heuristic for location based on tag number or description
                const localizacao_texto = tag_completo.includes('37134') ? 'ETAC 2' : 'Caldeira 2';
                
                uniqueTagsMap.set(tag_completo, {
                  tag_completo,
                  ultimos4,
                  nome_equipamento: descricao,
                  localizacao_texto
                });
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore parse errors for individual lines
    }
  }
  
  return Array.from(uniqueTagsMap.values());
}

async function main() {
  try {
    console.log('Lendo dados do transcript...');
    const uniqueTags = await extractFromTranscript();
    console.log(`Total de TAGs únicos extraídos: ${uniqueTags.length}`);
    
    if (uniqueTags.length === 0) {
      console.log('Nenhum TAG encontrado no transcript.');
      return;
    }
    
    // Gera arquivo SQL
    console.log('Gerando arquivo seed_tags.sql...');
    let sqlContent = `-- Seed file gerado automaticamente
-- Limpa a tabela existente e insere os novos dados
-- ATENÇÃO: Ao deletar de 'tags', comentários e fotos vinculadas serão excluídos devido ao CASCADE.

DELETE FROM tags;

`;

    // Divide in batches for SQL
    const batchSize = 50;
    for (let i = 0; i < uniqueTags.length; i += batchSize) {
      const batch = uniqueTags.slice(i, i + batchSize);
      let insertQuery = `INSERT INTO tags (tag_completo, ultimos4, nome_equipamento, localizacao_texto, status) VALUES\n`;
      const values = batch.map(t => {
        const nomeEscaped = t.nome_equipamento.replace(/'/g, "''");
        return `('${t.tag_completo}', '${t.ultimos4}', '${nomeEscaped}', '${t.localizacao_texto}', 'operacional')`;
      });
      insertQuery += values.join(',\n') + ';\n\n';
      sqlContent += insertQuery;
    }
    
    fs.writeFileSync(SQL_OUTPUT, sqlContent);
    console.log(`SQL salvo em: ${SQL_OUTPUT}`);
    
    // Gera arquivo mockData.ts
    console.log('Atualizando mockData.ts...');
    let mockContent = `import { Tag } from './types';\n\nexport const mockTags: Tag[] = [\n`;
    
    const mockObjects = uniqueTags.map((t, idx) => {
      const nomeEscaped = t.nome_equipamento.replace(/'/g, "\\'");
      return `  {
    id: ${idx + 1},
    tag_completo: '${t.tag_completo}',
    ultimos4: '${t.ultimos4}',
    nome_equipamento: '${nomeEscaped}',
    localizacao_texto: '${t.localizacao_texto}',
    status: 'operacional',
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  }`;
    });
    
    mockContent += mockObjects.join(',\n');
    mockContent += `\n];\n`;
    
    fs.writeFileSync(MOCK_OUTPUT, mockContent);
    console.log(`mockData.ts atualizado em: ${MOCK_OUTPUT}`);
    
    console.log('Processo concluído com sucesso!');
  } catch (err) {
    console.error('Erro ao processar:', err);
  }
}

main();
