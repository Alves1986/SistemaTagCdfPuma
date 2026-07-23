"""Importa a Base KOS para o Supabase — schema REAL (ja existente).

Estrategia: envia APENAS linhas NOVAS (filtra as que ja existem no banco),
evitando 409 de duplicado (PostgREST deste projeto nao aplica ignore-duplicates).

Schema real:
  equipamentos_referencia(id, tag_completo[unq], prefixo, tipo_instrumento, descricao, origem)
  manual_documentos(id[bigint PK], documento_id[unq], origem_tipo, sistema, pasta, titulo, conteudo_md)
  manual_tag_mentions(id, documento_id[bigint FK->manual_documentos.id], tag_completo, trecho, linha)

Requer SUPABASE_SERVICE_ROLE_KEY no .env.
"""
import os, csv, json, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_DIR = os.path.join(ROOT, "UPGRADE TAG KLABIN", "kos_import")

env = {}
for line in open(os.path.join(ROOT, ".env"), encoding="utf-8"):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

SUPABASE_URL = env["VITE_SUPABASE_URL"].rstrip("/")
KEY = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
if not KEY:
    print("ERRO: SUPABASE_SERVICE_ROLE_KEY ausente no .env")
    sys.exit(1)

def get_col(table, col, page=1000):
    out, off = set(), 0
    while True:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select={col}&limit={page}&offset={off}"
        req = urllib.request.Request(url, headers={"apikey": KEY, "Authorization": f"Bearer {KEY}", "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.load(r)
        except urllib.error.HTTPError as e:
            print(f"  erro ao ler {table}: {e.code}")
            break
        if not data:
            break
        for row in data:
            if row.get(col) is not None:
                out.add(row[col])
        off += page
        if len(data) < page:
            break
    return out

def post(table, rows):
    if not rows:
        return 0, 0
    ok = 0
    err = 0
    total = len(rows)
    for i, row in enumerate(rows, 1):
        body = json.dumps([row]).encode()
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{table}", data=body, method="POST", headers={
            "apikey": KEY, "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json", "Prefer": "return=minimal",
        })
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                ok += 1
        except urllib.error.HTTPError:
            err += 1
        if i % 200 == 0:
            print(f"     ...{i}/{total} (ok={ok}, err={err})", flush=True)
    return ok, err

def csv_rows(path):
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))

def main():
    print(f"Supabase: {SUPABASE_URL}  [service_role]\n")

    # 1) Equipamentos: filtra existentes
    print("[1/3] equipamentos_referencia...")
    eq_exist = get_col("equipamentos_referencia", "tag_completo")
    eq_all = csv_rows(os.path.join(CSV_DIR, "equipamentos_referencia.csv"))
    eq_new = [{
        "tag_completo": r.get("tag_completo", ""),
        "prefixo": r.get("prefixo", "") or None,
        "tipo_instrumento": r.get("tipo_instrumento", "") or None,
        "descricao": r.get("descricao", "") or None,
        "origem": r.get("origem", "Base KOS") or "Base KOS",
    } for r in eq_all if r.get("tag_completo") not in eq_exist]
    ok, err = post("equipamentos_referencia", eq_new)
    print(f"     {ok} novas inseridas (de {len(eq_all)} no CSV; {len(eq_exist)} ja existiam)" + (f" | erro {err}" if err else ""))

    # 2) Documentos: filtra existentes
    print("[2/3] manual_documentos...")
    doc_exist = get_col("manual_documentos", "documento_id")
    doc_all = csv_rows(os.path.join(CSV_DIR, "manual_documentos.csv"))
    doc_new = [{
        "documento_id": r.get("documento_id", ""),
        "origem_tipo": "vault_fragmento",
        "sistema": r.get("sistema", "") or None,
        "pasta": r.get("pasta", "") or None,
        "titulo": r.get("titulo", ""),
        "conteudo_md": r.get("conteudo_md", "") or "",
    } for r in doc_all if r.get("documento_id") not in doc_exist]
    ok, err = post("manual_documentos", doc_new)
    print(f"     {ok} novos inseridos (de {len(doc_all)} no CSV; {len(doc_exist)} ja existiam)" + (f" | erro {err}" if err else ""))

    # 3) Mentions: mapeia documento_id(string)->id(bigint) e filtra novas
    print("[3/3] manual_tag_mentions...")
    doc_map = {}
    off = 0
    while True:
        url = f"{SUPABASE_URL}/rest/v1/manual_documentos?select=documento_id,id&limit=1000&offset={off}"
        req = urllib.request.Request(url, headers={"apikey": KEY, "Authorization": f"Bearer {KEY}", "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.load(r)
        if not data:
            break
        for row in data:
            doc_map[row["documento_id"]] = row["id"]
        off += 1000
        if len(data) < 1000:
            break
    print(f"     {len(doc_map)} documentos mapeados (id bigint)")
    ment_all = csv_rows(os.path.join(CSV_DIR, "manual_tag_mentions.csv"))
    # CSV usa coluna 'documento_id_doc' (string id do documento)
    ment_new = []
    skip_doc = 0
    for r in ment_all:
        doc_str = r.get("documento_id_doc") or r.get("documento_id") or ""
        did = doc_map.get(doc_str)
        if did is None:
            skip_doc += 1
            continue
        ment_new.append({
            "documento_id": did,
            "tag_completo": r.get("tag_completo", ""),
            "trecho": r.get("trecho", "") or "",
            "linha": int(r["linha"]) if (r.get("linha") or "").isdigit() else None,
        })
    ok, err = post("manual_tag_mentions", ment_new)
    print(f"     {ok} novas inseridas (de {len(ment_all)} no CSV; {skip_doc} puladas-doc inexistente)" + (f" | erro {err}" if err else ""))

    print("\nConcluido.")

if __name__ == "__main__":
    main()
