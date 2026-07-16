
# Registro de Atualizações - Sistema TAG

Este documento serve como o registro principal (Changelog) de todas as alterações, correções e novas funcionalidades implementadas no **Sistema TAG** (Klabin).

---

## [1.2.0] - Atualizações Recentes de UI e Estrutura SaaS

### 🚀 Funcionalidades e Melhorias
* **Textos Dinâmicos (White-Label):** O cabeçalho e o rodapé do sistema não possuem mais o texto fixo "Caldeira de Força". Agora, o sistema exibe dinamicamente o nome da **Área** cadastrada no perfil do usuário logado (ex: `CDF2 / ETAC2`), tornando o sistema preparadíssimo para escalar para outras fábricas e setores.
* **Meu Perfil & Gestão de Equipe:**
  * Criação completa de tela "Meu Perfil" acessível por qualquer operador para inserção de Foto e WhatsApp.
  * Inclusão do cargo "Aprendiz".
  * Novos campos flexíveis: "Gerência" e "Área".
  * Na tela de "Equipe", os gestores ganharam o poder de editar o Cargo, Gerência e Área dos operadores através de um painel de edição remodelado.
* **Dashboard Gráfico de Manutenção:**
  * Nova página interativa exclusiva para a Gestão, acessível via botão na tela principal.
  * Gráfico de Barras detalhando a quantidade de Notas de Manutenção separadas por nível de Criticidade (Urgente, Alta, Média, Baixa).
  * Gráfico de Pizza exibindo a distribuição percentual do status de todos os equipamentos da área selecionada.
  * **Interatividade Avançada:** Os gráficos agora possuem Tooltips com cores contrastantes para melhor leitura, e as barras de criticidade são **clicáveis**. Ao clicar em uma criticidade (ex: Urgente), o sistema exibe instantaneamente a listagem completa dos equipamentos que compõem aquela barra, com atalho direto para a ficha técnica.
* **Formatação de Dados:**
  * Máscara automática para telefone implementada em tempo real `(XX) XXXXX-XXXX` nas páginas de Perfil e Equipe.
* **Organização de Tabelas (AdminPage):**
  * Tabela de Gestão agora possui **Paginação** ajustável (5, 10, 20 ou 50 itens por página).
  * A ordenação da tabela tornou-se **alfanumérica inteligente**, varrendo e ordenando os equipamentos de acordo com os **4 últimos dígitos numéricos** do TAG.
  * Correção visual da coluna "Área", impedindo a quebra de linha indevida ("exprimida") do texto.
* **Identidade Visual e Layout:** 
  * Adicionado Favicon com a logo da Klabin e título amigável na aba do navegador Chrome ("Klabin - Sistema TAG").
  * Inclusão dos créditos de criação "Criado por Anderson Alves" no rodapé do sistema.
  * Remoção de textos fixos ("Caldeira de Força") das telas de Login e Cadastro, tornando o acesso genérico e preparado para o padrão SaaS.
* **Layout de Impressão (QR Codes):**
  * Ajuste do layout de impressão oculto (`print:block`) para garantir o particionamento matemático exato de **9 QR Codes por folha A4**, com quebra de página automática (`page-break-after`), corrigindo cortes visuais na hora da impressão.

### 🛠 Correções e Banco de Dados (SQL)
* **Backfill de Perfis:** Criação do script `20260716000004_backfill_profiles.sql` para sincronizar contas de autenticação antigas com a nova estrutura da tabela `profiles`.
* **Triggers de Auth:** Atualização da função `handle_new_user()` no Supabase para automatizar o preenchimento de `gerencia` e `area` no momento do registro.

---

## [1.1.0] - Filtros Dinâmicos, Manuais e Exportação
* **Sistema de Filtros:** Filtros inteligentes na tabela por status do equipamento (Operacional, Manutenção, Inativo) e atalho para ver apenas os "Com Nota" de manutenção.
* **Manuais Técnicos:** Sistema de upload e armazenamento de arquivos PDF para anexar manuais técnicos diretamente na ficha de cada equipamento.
* **Exportação de Dados:** Funcionalidade para exportar a listagem de equipamentos para planilhas (CSV, Excel) e PDF, facilitando relatórios gerenciais.
* **Geração de QR Codes:** Geração automática e em massa de QR Codes para colar nos equipamentos físicos, facilitando a identificação rápida em campo.
* **Leitura de QR Code:** Suporte a escaneamento de QR Code pela câmera do dispositivo móvel para abrir a ficha técnica do equipamento instantaneamente.

---

## [1.0.0] - Lançamento Inicial (Base do Sistema)
* **Estruturação Tecnológica:** Sistema desenvolvido em React (TypeScript) com interface estilizada via Tailwind CSS e ícones Lucide-React.
* **Autenticação Segura (Supabase):** 
  * Sistema de Login e Cadastro conectado ao banco de dados Supabase.
  * Proteção de rotas (apenas usuários logados acessam a gestão).
* **Painel de Gestão (Dashboard):** 
  * Visualização central de todos os equipamentos (TAGs).
  * Cards de estatísticas no topo: Total de equipamentos, Operacionais, Em Manutenção, Inativos e Com Nota aberta.
  * Caixa de Busca rápida por Nome do Equipamento ou número do TAG.
* **Gestão de Equipamentos (TAGs):**
  * Criação de novos TAGs com exigência de finalização em 4 dígitos numéricos.
  * Definição de Localização Física e Status operacional.
  * Upload de fotografias para reconhecimento visual do equipamento.
* **Ficha Detalhada do Equipamento:**
  * Tela dedicada para cada equipamento listando todos os detalhes.
  * **Sistema de Notas de Manutenção:** Abertura de notas de manutenção com níveis de prioridade visual (Urgente, Alta, Média, Baixa) com destaque em vermelho no painel de gestão para notas em aberto.
  * **Sistema de Comentários:** Histórico de apontamentos e observações de operadores vinculados a cada equipamento, com identificação de quem comentou e quando.
* **Contexto de Áreas (Módulo Inicial):** Seleção fixa de áreas operacionais (CDF I, CDF II, ETAC I, ETAC II) guiando a visualização dos dados.
