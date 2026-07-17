
# Registro de Atualizações - Sistema TAG

Este documento serve como o registro principal (Changelog) de todas as alterações, correções e novas funcionalidades implementadas no **Sistema TAG** (Klabin).

---

## [1.3.3] - Navegação e Filtros da Manutenção

### 🚀 Novas Funcionalidades
* **Filtro por Gerência no Menu Superior:** O cabeçalho do sistema agora conta com dois filtros encadeados — **Gerência** e **Área**. Ao selecionar uma gerência, as áreas disponíveis atualizam automaticamente para mostrar apenas as opções relevantes.
* **Áreas da Manutenção:** A gerência "Manutenção" passa a listar as áreas físicas reais (CDF II, ETAC II, CDF I, ETAC I) para que o filtro do painel funcione corretamente com os equipamentos da planta.

### 🛠️ Correções e Ajustes
* **Painel de Manutenção aberto para toda a gerência:** Antes, o Painel de Manutenção era acessível apenas ao cargo "Gestor de Manutenção". Agora qualquer usuário com gerência "Manutenção" acessa diretamente.
* **Redirecionamento Automático:** Ao entrar no sistema, usuários da Manutenção são redirecionados automaticamente para o Painel de Manutenção (em vez da tela de busca). Os links "Buscar" e "Gestão" não aparecem para eles.
* **Alerta de Notificação Clicável:** A barra laranja que avisa sobre notas abertas agora direciona a Manutenção para o Painel de Manutenção e a Operação para a lista de TAGs filtrada.
* **Bug do import dentro do componente:** Corrigido um `import` que havia sido acidentalmente inserido dentro do corpo do componente `Layout`, causando erro de compilação no Vite.
* **Reload por área:** O painel de manutenção agora recarrega os dados automaticamente sempre que a área selecionada muda.

---

## [1.3.2] - Correções no Painel de Manutenção

### 🛠️ Correções e Ajustes UI
* **Ocultação de Botões:** Botões administrativos como "Criar TAG", "QR Codes" e "Equipe" foram removidos da visão dos usuários da gerência de Manutenção, garantindo uma interface mais limpa e focada em suas atividades.
* **Ajuste no Registro de Notas (Especialidade):** Corrigido o problema onde a Especialidade da nota (Mecânica, Elétrica, etc.) não era enviada para o banco de dados. A lógica foi reestruturada para garantir a gravação correta, permitindo que as notas voltem a aparecer organizadas por abas no Painel de Manutenção.
* **Fix de Cadastro (Supabase):** Removida uma restrição legada (`CHECK constraint`) no Supabase que impedia a criação de contas com os novos cargos como Gestor de Manutenção.
* **Resiliência de Erros:** Corrigido bug na tela de cadastro (`AuthContext`) que causava uma quebra branca na tela ao receber um erro sem mensagem explícita do banco de dados.

---

## [1.3.1] - Estrutura Hierárquica no Cadastro e Equipe

### 🚀 Melhorias de Fluxo e Usabilidade
* **Menu em Cascata Dinâmico:** Implementado um novo sistema de seleção hierárquica inteligente durante a criação de conta e na edição de equipe:
  * **Ordem lógica:** O usuário seleciona primeiro a `Gerência`, que define a `Área`, que por sua vez define o `Cargo/Função`.
  * **Novas Gerências:** Incluídas as gerências de `Fibras`, `Produção de Papéis`, `Produção de Celulose`, `Recuperação e Utilidades` e `Manutenção`.
  * **Funções restritas:** O cargo de "Gestor de Manutenção" agora só é exibido se a Gerência "Manutenção" estiver selecionada, evitando erros de cadastro de função incorreta em gerências erradas.
* **Flexibilidade:** Arquivo utilitário central `hierarchy.ts` criado para facilitar a adição rápida de novas áreas e cargos por gerência no futuro sem a necessidade de reescrever lógica visual.

---

## [1.3.0] - Módulo de Gestão de Manutenção

### 🚀 Novas Funcionalidades e Fluxos
* **Novo Cargo Estratégico:** Adição da função "Gestor de Manutenção" no cadastro de usuários.
* **Abertura de Notas Detalhada:** A Operação agora é obrigada a selecionar a **Especialidade** (Mecânica, Elétrica, Instrumentação, Automação) ao abrir uma nova Nota de Manutenção no equipamento.
* **Painel Exclusivo de Manutenção:** 
  * Nova tela de Gestão acessível apenas pelo Gestor de Manutenção.
  * As notas em aberto são agrupadas em abas (tabs) pelas especialidades, facilitando o acompanhamento e filtro da equipe técnica.
  * Status de Atendimento: O Gestor pode atualizar o status do serviço ("Visualizado", "Em Tratamento", "Finalizado") interagindo diretamente pelo painel.
* **Fluxo de Dupla Validação (Check da Operação):**
  * Quando a Manutenção sinaliza a nota como "Finalizada", a nota não é fechada automaticamente. Ela entra em status de "Aguardando Validação da Operação".
  * Um novo botão verde ("Validar e Encerrar Nota") passa a aparecer apenas para os usuários da Operação e Liderança, permitindo que a baixa definitiva no sistema seja dada apenas após conferência física de que o equipamento está pronto.

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
