### Arquivo de especificação completo para implementação do sistema de busca por TAG (Caldeira de Força)

Abaixo está um **documento completo e detalhado** que você pode enviar para uma IA ou equipe de desenvolvimento para que o sistema seja criado. Contém requisitos, arquitetura, modelo de dados, scripts SQL, especificação OpenAPI, fluxos de UI/UX, pipeline de fotos, POC de visão computacional, geração de QR, segurança, testes, deploy e backlog com sprints e critérios de aceitação. Salve este conteúdo como `spec_sistema_tag_caldeira.md` ou envie diretamente para a IA.

---

### 1 Requisitos funcionais e não funcionais

**Objetivo:** permitir localização de TAGs de equipamentos de uma caldeira por **últimos 4 dígitos** ou **nome do equipamento**, exibir dados do TAG, permitir upload de fotos (com GPS), escaneamento de QR e, em fase futura, sugerir TAGs a partir de fotos via visão computacional.

**Requisitos funcionais (MVP)**
- Buscar por **últimos 4 dígitos** do TAG.
- Buscar por **nome do equipamento** (autocompletar).
- Exibir **TAG completo**, **nome**, **localização textual**, **status**, **foto** (se existir) e **distância** quando GPS do usuário for fornecido.
- CRUD de TAGs (criar, ler, atualizar, deletar).
- Upload de fotos por TAG com metadados: `uploader`, `gps_lat`, `gps_lng`, `timestamp`, `notes`.
- Escanear QR para abrir o TAG correspondente.
- Fila offline no app móvel para uploads quando sem conexão.
- Painel web para validação/aprovação de fotos antes de vincular ao TAG.

**Requisitos não funcionais**
- **Performance:** busca < 200 ms para 10k registros; escalável para 100k+.
- **Disponibilidade:** 99% para API em horário de operação.
- **Segurança:** autenticação OAuth2/LDAP; logs de auditoria; controle de acesso por função.
- **Compatibilidade:** web responsiva e app Android/iOS.
- **Armazenamento de fotos:** S3/Blob storage com CDN opcional.
- **Portabilidade:** containerização (Docker) e infraestrutura IaC (Terraform/ARM opcional).

**Premissas**
- TAGs seguem padrão alfanumérico; últimos 4 dígitos podem colidir.
- Rede móvel disponível na maioria das áreas; app deve suportar fila offline.
- Haverá um responsável para validação de fotos.

---

### 2 Arquitetura proposta e componentes

**Visão geral**
- **Frontend Web:** React + TypeScript; responsivo; painel de validação.
- **Mobile:** React Native (ou Flutter) para Android/iOS; câmera, GPS, QR scanner, fila offline.
- **Backend:** FastAPI (Python) ou Node.js (Express/NestJS). Preferência: **FastAPI** por produtividade e OpenAPI nativo.
- **Banco de dados:** PostgreSQL.
- **Armazenamento de arquivos:** AWS S3 (ou Azure Blob).
- **Indexação/Busca:** PostgreSQL + GIN trigram para nome; índice simples para `ultimos4`. Para escala maior, ElasticSearch opcional.
- **Visão computacional (fase 2):** embeddings com MobileNet/ResNet + FAISS para similaridade.
- **Autenticação:** OAuth2 (Keycloak/Auth0) ou integração LDAP.
- **Infra:** Docker Compose para dev; Kubernetes para produção; CI/CD (GitHub Actions/GitLab CI).
- **Observabilidade:** Prometheus + Grafana; logs centralizados (ELK/CloudWatch).

**Componentes e responsabilidades**
- **API Gateway / Load Balancer:** roteia requisições, TLS termination.
- **Service API:** endpoints REST, validação, regras de negócio.
- **Worker/Queue:** processa uploads, thumbnails, geração de embeddings, validação automática.
- **Storage Service:** interface para S3; gera URLs assinadas.
- **Admin Panel:** validação de fotos, gestão de TAGs, geração de QR.
- **Mobile App:** busca, escaneamento QR, captura foto, sincronização offline.

---

### 3 Modelo de dados e scripts SQL

**Modelo principal (resumido)**
- `tags` — registro do TAG.
- `photos` — fotos enviadas, com status de validação.
- `users` — usuários e roles (opcional se usar IdP externo).
- `audit_logs` — histórico de alterações.

**SQL (migrations iniciais)**

```sql
-- 001_create_tags.sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  tag_completo TEXT UNIQUE NOT NULL,
  ultimos4 CHAR(4) NOT NULL,
  nome_equipamento TEXT NOT NULL,
  localizacao_texto TEXT,
  status VARCHAR(50) DEFAULT 'operacional',
  foto_url TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_tags_ultimos4 ON tags(ultimos4);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tags_nome_trgm ON tags USING gin (nome_equipamento gin_trgm_ops);

-- 002_create_photos.sql
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  tag_id INT REFERENCES tags(id) ON DELETE SET NULL,
  uploader TEXT,
  file_path TEXT NOT NULL,
  gps_lat NUMERIC(9,6),
  gps_lng NUMERIC(9,6),
  image_hash TEXT,
  status VARCHAR(20) DEFAULT 'pending_review',
  notes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_photos_tag ON photos(tag_id);

-- 003_audit_logs.sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type TEXT,
  entity_id INT,
  action TEXT,
  user_id TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Observações**
- `ultimos4` preenchido automaticamente ao inserir `tag_completo` (ver trigger ou aplicação).
- `image_hash` para detectar duplicatas.
- Use migrations (Flyway, Alembic, Liquibase).

---

### 4 Especificação API (OpenAPI resumo + exemplos)

**Resumo**
- Base path: `/api/v1`
- Autenticação: Bearer token (OAuth2)
- Formato: JSON; uploads via `multipart/form-data`

**OpenAPI (trecho YAML simplificado)**

```yaml
openapi: 3.0.3
info:
  title: Tag Search API
  version: 1.0.0
servers:
  - url: https://api.exemplo.com/api/v1
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
paths:
  /search:
    get:
      summary: Busca por ultimos4 ou nome
      parameters:
        - in: query
          name: q
          schema:
            type: string
          required: true
        - in: query
          name: lat
          schema:
            type: number
        - in: query
          name: lng
          schema:
            type: number
      responses:
        '200':
          description: Lista de resultados
  /tags:
    post:
      summary: Criar TAG
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TagInput'
      responses:
        '201':
          description: Criado
  /tags/{id}/photo:
    post:
      summary: Upload de foto para TAG
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                uploader:
                  type: string
                gps_lat:
                  type: number
                gps_lng:
                  type: number
                notes:
                  type: string
      responses:
        '200':
          description: Foto recebida e pendente de revisão
components:
  schemas:
    TagInput:
      type: object
      properties:
        tag_completo:
          type: string
        nome_equipamento:
          type: string
        localizacao_texto:
          type: string
        status:
          type: string
      required:
        - tag_completo
        - nome_equipamento
security:
  - bearerAuth: []
```

**Exemplos de payloads**

- **POST /tags**
```json
{
  "tag_completo": "CAL-BOI-0001",
  "nome_equipamento": "Válvula de Alívio B01",
  "localizacao_texto": "Casa de Máquinas - Tubulação 3",
  "status": "operacional"
}
```

- **GET /search?q=0001**
```json
{
  "results": [
    {
      "id": 1,
      "tag_completo": "CAL-BOI-0001",
      "ultimos4": "0001",
      "nome_equipamento": "Válvula de Alívio B01",
      "localizacao_texto": "Casa de Máquinas - Tubulação 3",
      "foto_url": "https://s3.../cal-boi-0001.jpg",
      "distance_m": 45
    }
  ]
}
```

**Regras de busca**
- Se `q` for exatamente 4 dígitos numéricos → buscar por `ultimos4`.
- Se múltiplos resultados → ordenar por `distance_m` quando `lat/lng` fornecidos; caso contrário, ordenar por relevância (nome).
- Para texto → busca full-text com trigram e autocompletar.

---

### 5 Frontend e mobile: telas, componentes e fluxos

**Tela Busca (única)**
- **Campo único**: placeholder *Digite últimos 4 dígitos ou nome do equipamento*.
- **Comportamento:** detecta 4 dígitos; chama `/search?q=`.
- **Resultados:** lista com **miniatura da foto**, **TAG completo**, **nome**, **local**, **status**, **distância** e botão **Ver**.

**Tela Detalhe do TAG**
- Exibe **foto grande** (ou placeholder), **TAG completo**, **nome**, **localização**, **status**, **histórico de fotos**, botão **Adicionar foto**, botão **Editar** (se autorizado).

**Tela Captura (mobile)**
- **Opções:** `Escanear QR` | `Buscar manualmente` | `Últimas pesquisas`.
- Ao tirar foto: capturar **GPS**, **timestamp**, permitir anotar `observação`.
- Upload em background; se sem rede, salvar localmente e sincronizar quando online.
- Mostrar progresso e status (`pending_review`, `approved`, `rejected`).

**Painel Admin (web)**
- Lista de fotos pendentes; filtros por TAG, uploader, data.
- Visualizar foto, metadados, botão **Aprovar** / **Rejeitar** com motivo.
- Gerar e exportar QR em lote (PDF/CSV).

**Componentes técnicos**
- **Map preview**: botão “Abrir no mapa” que abre Google Maps/Mapbox com coordenadas.
- **QR scanner**: biblioteca nativa (ZXing, ML Kit).
- **Offline queue**: SQLite/AsyncStorage para fila local.

---

### 6 Pipeline de fotos e visão computacional (fase 2)

**Objetivo POC:** sugerir TAGs a partir de fotos tiradas no campo.

**Pipeline de coleta**
- Para cada TAG, coletar **5–10 fotos** cobrindo ângulos e variações de iluminação.
- Cada foto com `gps_lat`, `gps_lng`, `uploader`, `notes`.
- Armazenar em S3 com estrutura: `photos/{tag_id}/{yyyy-mm-dd}/{uuid}.jpg`.

**Anotação e dataset**
- Usar ferramenta de anotação (Label Studio) para confirmar associação foto→TAG.
- Gerar CSV com `photo_id, tag_id, s3_path, gps_lat, gps_lng`.

**Treinamento POC**
- **Feature extractor:** MobileNetV2 ou ResNet50 pré-treinado (transfer learning).
- **Embeddings:** extrair vetor fixo por imagem.
- **Indexação:** FAISS para busca por similaridade.
- **Combinação de sinais:** score final = weighted(similarity_score, gps_distance_score, qr/ocr_score).
- **Métrica alvo:** top-1 ≥ 80% em dataset controlado; top-5 ≥ 95%.

**Deploy do modelo**
- **Opção 1:** modelo no backend (GPU/CPU) — inferência centralizada.
- **Opção 2:** modelo on-device (tflite) — inferência offline; sincroniza embeddings ao servidor.
- **Serviço de sugestão:** endpoint `POST /vision/suggest` com imagem → retorna top-5 `tag_id` com scores.

**Worker**
- Ao upload de foto aprovada: gerar embedding e indexar em FAISS; atualizar dataset.

---

### 7 QR codes, etiquetas e procedimentos de campo

**Conteúdo do QR**
- Armazenar apenas o **código do TAG** (ex.: `CAL-BOI-0001`) ou URL curta `https://app.exemplo.com/scan?c=CAL-BOI-0001`.
- Não embutir dados sensíveis.

**Geração**
- Backend endpoint `POST /admin/generate-qrs` que recebe CSV de `tag_completo` e retorna ZIP com PDFs de etiquetas e CSV com `tag, qr_payload, filename`.

**Material e durabilidade**
- **Ambiente úmido/alto calor:** etiquetas em aço inox ou resina UV.
- **Ambiente normal:** PET industrial resistente.
- **Fixação:** parafusos ou adesivo industrial; padronizar posição.

**Guia de captura**
- **Distância:** 0.5–2 m dependendo do equipamento.
- **Ângulo:** frontal e lateral.
- **Iluminação:** evitar contraluz; usar flash se necessário.
- **Foco:** garantir legibilidade do instrumento e do TAG.

---

### 8 Segurança, auditoria e conformidade

**Autenticação e autorização**
- OAuth2 / OpenID Connect (Keycloak/Auth0) com roles: `admin`, `editor`, `viewer`, `field_tech`.
- Endpoints protegidos por Bearer token.

**Auditoria**
- Registrar em `audit_logs` todas as alterações críticas: criação/edição/deleção de TAGs, aprovação/rejeição de fotos, uploads.

**Proteção de dados**
- URLs de fotos assinadas (expiram).
- Criptografia em trânsito (TLS) e em repouso (S3 server-side encryption).
- Políticas de retenção de fotos e logs.

**Backups**
- Backups diários do PostgreSQL; snapshots do S3 conforme política.

---

### 9 Testes, monitoramento e métricas

**Testes**
- **Unitários:** API, validações, regras de negócio.
- **Integração:** upload de fotos, geração de thumbnails, indexação.
- **E2E:** fluxo busca → detalhe → upload foto → aprovação.
- **Performance:** carga de busca com 10k/100k registros.
- **Campo:** sincronização offline, qualidade de fotos, leitura QR.

**Métricas a monitorar**
- Latência média das buscas.
- Taxa de colisão por `ultimos4`.
- Tempo médio de aprovação de fotos.
- Taxa de sucesso de sincronização offline.
- Uso de armazenamento (S3).

**Alertas**
- Erros 5xx > threshold.
- Fila de processamento com backlog > threshold.
- Taxa de colisões de `ultimos4` alta.

---

### 10 Backlog detalhado e cronograma (pronto para sprints)

**Sprint 0 (1 semana)**
- Requisitos finais, infra dev, DB inicial, CI pipeline básico.

**Sprint 1 (2 semanas)**
- API CRUD tags; migrations; testes unitários; protótipo UI web (busca simples).

**Sprint 2 (2 semanas)**
- Implementar busca por `ultimos4` e nome (trigram); índices; OpenAPI; autenticação básica.

**Sprint 3 (2 semanas)**
- App mobile: busca, QR scanner, captura foto, fila offline; endpoint upload foto.

**Sprint 4 (2 semanas)**
- Painel admin: validação de fotos; geração de QR; export PDF/CSV; testes em campo com 50–200 TAGs.

**Sprint 5 (2 semanas)**
- Ajustes UX, performance, logs, monitoramento, documentação.

**POC visão (6–8 semanas, paralelo)**
- Coleta dataset, anotação, treinamento, avaliação, endpoint de sugestão.

**Critérios de aceitação (exemplos)**
- Busca por 4 dígitos retorna resultados relevantes e ordenados por distância quando GPS fornecido.
- Upload de foto cria registro `pending_review` e arquivo no S3.
- App sincroniza fotos offline quando reconecta.
- Painel admin aprova/rejeita fotos e altera `tags.foto_url` quando aprovado.

---

### 11 Entregáveis prontos para enviar à IA (instruções diretas)

**Instrução geral para a IA que vai gerar o sistema**
- **Linguagem backend:** FastAPI (Python 3.11) com SQLAlchemy + Alembic.
- **Banco:** PostgreSQL.
- **Armazenamento:** AWS S3.
- **Frontend:** React + TypeScript; design responsivo; componentes Material UI.
- **Mobile:** React Native (Expo) com módulos nativos para câmera e QR.
- **Autenticação:** OAuth2 (Keycloak) — integrar via JWT Bearer.
- **CI/CD:** GitHub Actions — build, tests, lint, deploy to Kubernetes.
- **Infra:** Dockerfiles para backend e frontend; Helm chart para deploy em Kubernetes; Terraform para infra AWS (VPC, EKS, RDS, S3).
- **Visão computacional:** pipeline separado em Python; usar PyTorch/TensorFlow; FAISS para indexação.
- **Testes:** pytest para backend; jest/react-testing-library para frontend; Detox/E2E para mobile.

**Arquivos que a IA deve gerar**
1. Repositório monorepo com subpastas: `/backend`, `/frontend`, `/mobile`, `/infra`, `/docs`.
2. `backend/`:
   - `Dockerfile`, `requirements.txt`, `app/` com rotas, modelos SQLAlchemy, Alembic migrations (usar SQL fornecido), testes unitários.
   - OpenAPI gerada automaticamente.
   - Worker (Celery/RQ) para processamento de fotos.
3. `frontend/`:
   - App React com páginas: Busca, Detalhe TAG, Admin (validação), Login.
4. `mobile/`:
   - App Expo com QR scanner, câmera, fila offline.
5. `infra/`:
   - Terraform scripts para RDS, S3, EKS; Helm charts.
6. `docs/`:
   - Guia de instalação, guia de captura de fotos, manual de etiquetas, API docs (OpenAPI YAML), checklist de testes de campo.
7. Scripts auxiliares:
   - `scripts/generate_qr.py` que gera PDFs com etiquetas a partir de CSV.
   - `scripts/seed_sample_data.sql` com 200 registros de exemplo.

**Parâmetros e convenções**
- Nome do projeto: `tag-finder-caldeira`.
- Variáveis de ambiente padrão: `DATABASE_URL`, `S3_BUCKET`, `S3_REGION`, `OAUTH_ISSUER`, `JWT_AUDIENCE`.
- Padrão de TAG: livre, mas `ultimos4` extraído automaticamente.
- Local de deploy inicial: AWS (preferência) ou Azure se solicitado.

---

### 12 Checklist final para envio à IA (texto pronto para colar)

```
Crie um repositório monorepo chamado "tag-finder-caldeira" com os seguintes requisitos:
- Backend: FastAPI + SQLAlchemy + Alembic; endpoints conforme OpenAPI no spec; autenticação JWT (OAuth2); worker para processamento de fotos; integração com S3.
- Banco: PostgreSQL; migrations com SQL fornecido.
- Frontend: React + TypeScript; páginas: Busca, Detalhe, Admin; integração com API.
- Mobile: React Native (Expo); QR scanner; câmera; fila offline; sincronização.
- Infra: Dockerfiles, Helm charts, Terraform para AWS (RDS, S3, EKS).
- Visão computacional: pipeline separado em Python (PyTorch/TensorFlow), extrair embeddings, indexar com FAISS; endpoint /vision/suggest.
- Scripts: gerar QR em PDF/CSV; seed de dados; scripts de deploy.
- Tests: unit, integration, e2e; GitHub Actions pipeline.
- Docs: README com instruções de setup, guia de captura de fotos, manual de etiquetas, OpenAPI YAML.

Use os arquivos SQL e o OpenAPI YAML incluídos no spec. Gere amostra de 200 TAGs e 500 fotos fictícias (placeholders) para testes.
```

---

### 13 Próximo passo que eu já posso gerar agora
Escolha um dos itens abaixo e eu gero imediatamente:
- **OpenAPI YAML completo** pronto para import no Swagger.
- **Migrations SQL completas** (arquivo .sql).
- **Backlog em formato CSV/JIRA** com histórias e estimativas.
- **Script Python para gerar QR e PDF**.
- **Mockups textuais detalhados** para cada tela.

Diga qual artefato você quer que eu gere primeiro e eu entrego o arquivo pronto para enviar à IA ou à equipe de desenvolvimento.