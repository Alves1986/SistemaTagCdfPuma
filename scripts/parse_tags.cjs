const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const ETAC_FILE = path.join(__dirname, '..', 'Tags e Descricoes ETAC 2.pdf');
const CALDEIRA_FILE = path.join(__dirname, '..', 'Tags e Descricoes Caldeira 2.pdf');
const SQL_OUTPUT = path.join(__dirname, '..', 'seed_tags.sql');
const MOCK_OUTPUT = path.join(__dirname, '..', 'src', 'app', 'mockData.ts');

const TAG_REGEX = /^(\d{5}-[A-Z0-9-/]+\d)\s*(.*)$/i;

async function parsePdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const parse = pdf.default || pdf;
  const data = await parse(dataBuffer);
  
  const tags = [];
  const lines = data.text.split('\n');
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Some lines might be wrapped, but looking at OCR, they are mostly single line.
    const match = line.match(TAG_REGEX);
    if (match) {
      const tag_completo = match[1].trim();
      let descricao = match[2].trim();
      
      // Get last 4 digits
      const ultimos4Match = tag_completo.match(/(\d{4})$/);
      const ultimos4 = ultimos4Match ? ultimos4Match[1] : tag_completo.slice(-4);
      
      tags.push({
        tag_completo,
        ultimos4,
        nome_equipamento: descricao,
        localizacao_texto: filePath.includes('ETAC') ? 'ETAC 2' : 'Caldeira 2'
      });
    }
  }
  return tags;
}

async function main() {
  try {
    console.log('Lendo PDFs...');
    const etacTags = await parsePdf(ETAC_FILE);
    console.log(`Encontrados ${etacTags.length} TAGs no ETAC 2`);
    
    const caldeiraTags = await parsePdf(CALDEIRA_FILE);
    console.log(`Encontrados ${caldeiraTags.length} TAGs na Caldeira 2`);
    
    // Remove duplicatas pelo tag_completo
    const allTags = [...etacTags, ...caldeiraTags];
    const uniqueTagsMap = new Map();
    allTags.forEach(t => uniqueTagsMap.set(t.tag_completo, t));
    const uniqueTags = Array.from(uniqueTagsMap.values());
    
    console.log(`Total de TAGs únicos extraídos: ${uniqueTags.length}`);
    
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
