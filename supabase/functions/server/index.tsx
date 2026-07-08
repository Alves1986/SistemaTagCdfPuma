import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as db from "./db.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e7ada368/health", (c) => {
  return c.json({ status: "ok" });
});


// ============ AUTENTICAÇÃO ============

// Registrar novo usuário
app.post("/make-server-e7ada368/auth/register", async (c) => {
  try {
    const { nome, prn, cargo } = await c.req.json();

    if (!nome || !prn || !cargo) {
      return c.json({ error: "Todos os campos são obrigatórios" }, 400);
    }

    if (prn.length < 4) {
      return c.json({ error: "O PRN deve ter pelo menos 4 caracteres" }, 400);
    }

    // Verificar se já existe usuário com esse nome
    const existingUser = await db.findUserByNome(nome);
    if (existingUser) {
      return c.json({ error: "Já existe um usuário cadastrado com este nome" }, 409);
    }

    // Criar novo usuário
    const newUser = await db.createUser(nome, prn, cargo);

    return c.json({
      success: true,
      user: { id: newUser.id, nome: newUser.nome, cargo: newUser.cargo, prn: newUser.prn }
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return c.json({ error: "Erro ao registrar usuário: " + error.message }, 500);
  }
});

// Login
app.post("/make-server-e7ada368/auth/login", async (c) => {
  try {
    const { nome, prn } = await c.req.json();

    if (!nome || !prn) {
      return c.json({ error: "Nome e PRN são obrigatórios" }, 400);
    }

    const user = await db.findUserByCredentials(nome, prn);
    if (!user) {
      return c.json({ error: "Credenciais inválidas" }, 401);
    }

    return c.json({
      success: true,
      user: { id: user.id, nome: user.nome, cargo: user.cargo, prn: user.prn }
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return c.json({ error: "Erro ao fazer login: " + error.message }, 500);
  }
});

// ============ TAGs ============

// Buscar todos os TAGs
app.get("/make-server-e7ada368/tags", async (c) => {
  try {
    const tags = await db.getAllTags();
    return c.json({ tags });
  } catch (error) {
    console.error("Erro ao buscar TAGs:", error);
    return c.json({ error: "Erro ao buscar TAGs: " + error.message }, 500);
  }
});

// Buscar TAG por ID
app.get("/make-server-e7ada368/tags/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const tag = await db.getTagById(id);

    if (!tag) {
      return c.json({ error: "TAG não encontrado" }, 404);
    }

    return c.json({ tag });
  } catch (error) {
    console.error("Erro ao buscar TAG:", error);
    return c.json({ error: "Erro ao buscar TAG: " + error.message }, 500);
  }
});

// Criar novo TAG
app.post("/make-server-e7ada368/tags", async (c) => {
  try {
    const { tag_completo, nome_equipamento, localizacao_texto, status, foto_url, user_nome } = await c.req.json();

    if (!tag_completo || !nome_equipamento || !localizacao_texto) {
      return c.json({ error: "Campos obrigatórios faltando" }, 400);
    }

    // Validar que TAG termina com 4 dígitos
    const ultimos4Match = tag_completo.match(/\d{4}$/);
    if (!ultimos4Match) {
      return c.json({ error: "O TAG deve terminar com 4 dígitos" }, 400);
    }

    const newTag = await db.createTag({
      tag_completo,
      ultimos4: ultimos4Match[0],
      nome_equipamento,
      localizacao_texto,
      status: status || 'operacional',
      foto_url: foto_url || null,
      atualizado_por: user_nome || null
    });

    return c.json({ success: true, tag: newTag });
  } catch (error) {
    console.error("Erro ao criar TAG:", error);
    return c.json({ error: "Erro ao criar TAG: " + error.message }, 500);
  }
});

// Atualizar TAG
app.put("/make-server-e7ada368/tags/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const updates = await c.req.json();

    const updatedTag = await db.updateTag(id, updates);

    return c.json({ success: true, tag: updatedTag });
  } catch (error) {
    console.error("Erro ao atualizar TAG:", error);
    return c.json({ error: "Erro ao atualizar TAG: " + error.message }, 500);
  }
});

// Buscar TAGs (com query)
app.get("/make-server-e7ada368/tags/search/:query", async (c) => {
  try {
    const query = c.req.param("query");
    const tags = await db.searchTags(query);

    return c.json({ tags });
  } catch (error) {
    console.error("Erro ao buscar TAGs:", error);
    return c.json({ error: "Erro ao buscar TAGs: " + error.message }, 500);
  }
});

// Adicionar/Remover nota de manutenção
app.post("/make-server-e7ada368/tags/:id/nota", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const { numero_nota, descricao, prioridade, aberta_por, remover } = await c.req.json();

    let updatedTag;
    if (remover) {
      updatedTag = await db.removeNotaManutencao(id);
    } else {
      updatedTag = await db.addNotaManutencao(id, {
        numero_nota,
        descricao,
        prioridade,
        aberta_por
      });
    }

    return c.json({ success: true, tag: updatedTag });
  } catch (error) {
    console.error("Erro ao gerenciar nota de manutenção:", error);
    return c.json({ error: "Erro ao gerenciar nota de manutenção: " + error.message }, 500);
  }
});

// ============ COMENTÁRIOS ============

// Buscar comentários de um TAG
app.get("/make-server-e7ada368/tags/:id/comentarios", async (c) => {
  try {
    const tagId = parseInt(c.req.param("id"));
    const comentarios = await db.getComentariosByTagId(tagId);
    return c.json({ comentarios });
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return c.json({ error: "Erro ao buscar comentários: " + error.message }, 500);
  }
});

// Adicionar comentário
app.post("/make-server-e7ada368/tags/:id/comentarios", async (c) => {
  try {
    const tagId = parseInt(c.req.param("id"));
    const { autor, texto } = await c.req.json();

    if (!autor || !texto) {
      return c.json({ error: "Autor e texto são obrigatórios" }, 400);
    }

    const newComment = await db.createComentario(tagId, autor, texto);

    return c.json({ success: true, comentario: newComment });
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    return c.json({ error: "Erro ao adicionar comentário: " + error.message }, 500);
  }
});

// ============ FOTOS ============

// Buscar fotos de um TAG
app.get("/make-server-e7ada368/tags/:id/fotos", async (c) => {
  try {
    const tagId = parseInt(c.req.param("id"));
    const fotos = await db.getFotosByTagId(tagId);
    return c.json({ fotos });
  } catch (error) {
    console.error("Erro ao buscar fotos:", error);
    return c.json({ error: "Erro ao buscar fotos: " + error.message }, 500);
  }
});

// Adicionar foto
app.post("/make-server-e7ada368/tags/:id/fotos", async (c) => {
  try {
    const tagId = parseInt(c.req.param("id"));
    const { uploader, file_path, notes } = await c.req.json();

    if (!uploader || !file_path) {
      return c.json({ error: "Uploader e file_path são obrigatórios" }, 400);
    }

    const newPhoto = await db.createFoto(tagId, uploader, file_path, notes);

    return c.json({ success: true, foto: newPhoto });
  } catch (error) {
    console.error("Erro ao adicionar foto:", error);
    return c.json({ error: "Erro ao adicionar foto: " + error.message }, 500);
  }
});

Deno.serve(app.fetch);