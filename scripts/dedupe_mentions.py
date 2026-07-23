"""Deduplica manual_tag_mentions: 1 linha por (documento_id, tag_completo).

Le TODAS as linhas (paginacao completa) e mantem a primeira ocorrencia
(menor id); as demais sao deletadas em lotes.
"""
import os, json, urllib.request, urllib.error

env = {}
for line in open(".env", encoding="utf-8"):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

URL = env["VITE_SUPABASE_URL"].rstrip("/")
KEY = env["SUPABASE_SERVICE_ROLE_KEY"]


def get(u):
    req = urllib.request.Request(u, headers={
        "apikey": KEY, "Authorization": f"Bearer {KEY}", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


seen = {}
dup_ids = []
off = 0
total = 0
while True:
    rows = get(f"{URL}/rest/v1/manual_tag_mentions?select=id,documento_id,tag_completo&order=id&limit=1000&offset={off}")
    if not rows:
        break
    for r in rows:
        k = (r["documento_id"], r["tag_completo"])
        if k in seen:
            dup_ids.append(r["id"])
        else:
            seen[k] = r["id"]
    total += len(rows)
    off += 1000
    if len(rows) < 1000:
        break

print(f"Lidas: {total} | Unicas: {len(seen)} | Duplicadas: {len(dup_ids)}")

deleted = 0
for i in range(0, len(dup_ids), 100):
    batch = dup_ids[i:i + 100]
    q = ",".join(str(x) for x in batch)
    req = urllib.request.Request(
        f"{URL}/rest/v1/manual_tag_mentions?id=in.({q})",
        method="DELETE",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    try:
        with urllib.request.urlopen(req, timeout=30):
            deleted += len(batch)
    except urllib.error.HTTPError as e:
        print("erro delete lote:", e.code)

print(f"Deletadas: {deleted}")
print(f"Restam unicas: {len(seen)}")
