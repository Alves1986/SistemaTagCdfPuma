"""Importa a Base KOS (Obsidian) para o módulo Manual Técnico do Sistema TAG KOS.

Gera 3 CSVs em UPGRADE TAG KLABIN/kos_import/:
  - equipamentos_referencia.csv  (1.065 equipamentos)
  - manual_documentos.csv        (1.196 notas KOS como documentos pesquisáveis)
  - manual_tag_mentions.csv      (wiki-links / seções relacionadas como trechos)

O caminho da Base KOS é fixo (OneDrive). Ajuste KOS_PATH se mudar.
"""
import pathlib, re, csv

KOS_PATH = pathlib.Path(r"C:/Users/Cassi/OneDrive/Documentos/Anderson/TAG KOS/KOS")
OUT_DIR = pathlib.Path(r"UPGRADE TAG KLABIN/kos_import")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def fm(txt: str, key: str) -> str:
    m = re.search(rf"^{key}:\s*(.+)", txt, re.M)
    return m.group(1).strip() if m else ""


def section(txt: str, name: str) -> str:
    m = re.search(rf"## {re.escape(name)}\s*\n(.*?)(?=\n## |\Z)", txt, re.S)
    return m.group(1).strip() if m else ""


ref_rows, doc_rows, mention_rows = [], [], []
total_md = 0

for p in KOS_PATH.rglob("*.md"):
    txt = p.read_text(encoding="utf-8", errors="ignore")
    if not txt.startswith("---"):
        continue
    total_md += 1

    tag = fm(txt, "tag")
    tipo = fm(txt, "tipo")
    sistema = fm(txt, "sistema")
    local = fm(txt, "localizacao_pid")
    funcao = fm(txt, "funcao_isa")

    title_m = re.search(r"^# (.+)", txt, re.M)
    titulo = title_m.group(1).strip() if title_m else (tag or p.stem)

    # Descrição: prioriza Finalidade > O que é; cai no título se vazio
    desc = ""
    for sec in ["Finalidade", "O que é"]:
        body = section(txt, sec)
        if body and "identificado no P&ID" not in body:
            desc = body[:300]
            break
    if not desc:
        desc = titulo

    doc_id = "kos-" + p.stem
    doc_rows.append({
        "documento_id": doc_id,
        "origem_tipo": "kos_conhecimento",
        "sistema": sistema,
        "pasta": str(p.parent.relative_to(KOS_PATH)).replace("\\", "/"),
        "titulo": titulo,
        "conteudo_md": txt,
    })

    if tipo == "equipamento" and tag:
        ref_rows.append({
            "tag_completo": tag,
            "prefixo": tag.split("-")[1] if "-" in tag else "",
            "tipo_instrumento": funcao,
            "descricao": desc or titulo,
            "sistema": sistema,
            "origem": "Base KOS",
        })

    # Mentions: seções "X Relacionados" (wiki-links) + todos os wiki-links do doc
    related_secs = [
        "Equipamentos Relacionados", "Fluxos Relacionados",
        "Alarmes Relacionados", "Intertravamentos Relacionados",
        "Bloqueios Relacionados", "Consequências de Falha",
    ]
    seen = set()
    for sec in related_secs:
        body = section(txt, sec)
        if not body:
            continue
        for link in re.findall(r"\[\[([^\]]+)\]\]", body):
            key = (tag or p.stem, f"{sec}: [[{link}]]")
            if key in seen:
                continue
            seen.add(key)
            mention_rows.append({
                "tag_completo": tag or p.stem,
                "trecho": f"{sec}: [[{link}]]",
                "documento_id": doc_id,
            })


def write_csv(name, rows, fields):
    if not rows:
        print(f"[skip] {name}: 0 linhas")
        return
    with open(OUT_DIR / name, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in fields})
    print(f"[ok] {name}: {len(rows)} linhas")


write_csv("equipamentos_referencia.csv", ref_rows,
          ["tag_completo", "prefixo", "tipo_instrumento", "descricao", "sistema", "origem"])
write_csv("manual_documentos.csv", doc_rows,
          ["documento_id", "origem_tipo", "sistema", "pasta", "titulo", "conteudo_md"])
write_csv("manual_tag_mentions.csv", mention_rows,
          ["tag_completo", "trecho", "documento_id"])

print(f"\nTotal .md lidos: {total_md}")
print(f"equipamentos={len(ref_rows)} documentos={len(doc_rows)} mentions={len(mention_rows)}")
