#!/usr/bin/env python3
"""
vectorize_full.py
Genera embeddings para:
- Pokémon (descripción + tipos + generación)
- Templates (queryText completa)
- Palabras clave de cada template (extraídas de templates.json)

Usa Ollama con el modelo qwen3-embedding:8b.
Salida: pokemon.vectors.json, templates.vectors.json, templates.keywords.vectors.json
"""

import os
import json
import time
from tqdm import tqdm
import ollama


def main():
    print("🚀 Starting vectorization pipeline with Ollama (qwen3-embedding:8b) ...")

    # ==================== PATHS ====================
    script_dir = os.path.dirname(os.path.abspath(__file__))
    seeds_dir = os.path.join(script_dir, "..", "..", "packages", "database", "src", "seeds")

    pokemon_path = os.path.join(seeds_dir, "pokemon.json")
    templates_path = os.path.join(seeds_dir, "templates.json")

    pokemon_vectors_path = os.path.join(seeds_dir, "pokemon.vectors.json")
    templates_vectors_path = os.path.join(seeds_dir, "templates.vectors.json")
    templates_keywords_vectors_path = os.path.join(seeds_dir, "templates.keywords.vectors.json")

    pokemon_progress_path = os.path.join(seeds_dir, "pokemon.vectors.progress")
    templates_progress_path = os.path.join(seeds_dir, "templates.vectors.progress")
    keywords_progress_path = os.path.join(seeds_dir, "templates.keywords.progress")

    # ── Validate inputs ──────────────────────────────────────────────────────
    for path, name in [(pokemon_path, "pokemon.json"), (templates_path, "templates.json")]:
        if not os.path.exists(path):
            print(f"❌ Missing input file: {name}. Run `mise run fetch` first.")
            return

    # ── Load data ────────────────────────────────────────────────────────────
    with open(pokemon_path, 'r', encoding='utf-8') as f:
        pokemons = json.load(f)

    with open(templates_path, 'r', encoding='utf-8') as f:
        search_templates = json.load(f)

    print(f"Loaded {len(pokemons)} pokemons, {len(search_templates)} templates.")

    # ── Resume pokemon vectors if progress file exists ───────────────────────
    if os.path.exists(pokemon_progress_path):
        print("⏳ Detectado progreso de vectorización de pokémons. Reanudando...")
        with open(pokemon_progress_path, 'r', encoding='utf-8') as f:
            pokemon_vectors = json.load(f)   # {id: [float, ...]}
    else:
        pokemon_vectors = {}

    # ── Resume template vectors if progress file exists ──────────────────────
    if os.path.exists(templates_progress_path):
        print("⏳ Detectado progreso de vectorización de templates. Reanudando...")
        with open(templates_progress_path, 'r', encoding='utf-8') as f:
            template_vectors = json.load(f)  # {index: [float, ...]}
    else:
        template_vectors = {}

    if os.path.exists(keywords_progress_path):
        print("⏳ Detectado progreso de vectorización de keywords. Reanudando...")
        with open(keywords_progress_path, 'r', encoding='utf-8') as f:
            keywords_data = json.load(f)   # { template_index: { keyword: embedding } }
    else:
        keywords_data = {}

    # ==================== MODEL SETUP ====================
    model_name = "qwen3-embedding:8b"
    print(f"Using Ollama model: {model_name}")
    try:
        test = ollama.embed(model=model_name, input="test")
        dim = len(test['embeddings'][0])
        print(f"✅ Conexión con Ollama exitosa. Dimensión real: {dim}")
        target_dim = 1536  # PostgreSQL pgvector dimension
        if dim > target_dim:
            print(f"⚠️  El modelo devuelve {dim} dims, se truncará a {target_dim}")
    except Exception as e:
        print(f"❌ Error conectando con Ollama: {e}")
        return

    # ==================== HELPERS ====================
    batch_size = 8
    max_retries = 3

    def embed_batch(texts, desc=""):
        """Intenta embedding con reintentos. Si falla, devuelve None."""
        for attempt in range(max_retries):
            try:
                response = ollama.embed(model=model_name, input=texts)
                return [emb[:target_dim] + [0.0] * (target_dim - min(len(emb), target_dim))
                        for emb in response['embeddings']]
            except Exception as e:
                print(f"⚠️  Error en batch ({desc}), intento {attempt+1}/{max_retries}: {e}")
                time.sleep(2 ** attempt)
        print(f"❌ Batch falló definitivamente: {desc}")
        return None

    # ==================== VECTORIZE POKÉMONS ====================
    done_ids = set(pokemon_vectors.keys())
    pending_pokemon = [(i, p) for i, p in enumerate(pokemons) if str(p['id']) not in done_ids]
    print(f"Pokémons con embedding pendiente: {len(pending_pokemon)} de {len(pokemons)}")

    pokemon_texts_all = {
        str(p['id']): f"{p['name']} | tipos: {', '.join(p.get('types', []))} | gen: {p.get('generation', '')} | {p.get('description') or ''}"
        for p in pokemons
    }

    for start in tqdm(range(0, len(pending_pokemon), batch_size), desc="Pokémon"):
        batch = pending_pokemon[start:start + batch_size]
        batch_texts = [pokemon_texts_all[str(p['id'])] for _, p in batch]
        embeddings = embed_batch(batch_texts, f"Pokémon ids {[p['id'] for _, p in batch]}")

        if embeddings is None:
            print("⚠️  No se pudo procesar este batch. Guardando progreso...")
            with open(pokemon_progress_path, 'w', encoding='utf-8') as f:
                json.dump(pokemon_vectors, f, ensure_ascii=False)
            return

        for (_, p), emb in zip(batch, embeddings):
            pokemon_vectors[str(p['id'])] = emb

        with open(pokemon_progress_path, 'w', encoding='utf-8') as f:
            json.dump(pokemon_vectors, f, ensure_ascii=False)

    # ==================== VECTORIZE TEMPLATES ====================
    done_tmpl = set(template_vectors.keys())
    pending_templates = [(i, t) for i, t in enumerate(search_templates) if str(i) not in done_tmpl]
    print(f"Templates pendientes: {len(pending_templates)} de {len(search_templates)}")

    for start in tqdm(range(0, len(pending_templates), batch_size), desc="Templates"):
        batch = pending_templates[start:start + batch_size]
        batch_texts = [t['queryText'] for _, t in batch]
        embeddings = embed_batch(batch_texts, f"Template indices {[i for i, _ in batch]}")

        if embeddings is None:
            with open(templates_progress_path, 'w', encoding='utf-8') as f:
                json.dump(template_vectors, f, ensure_ascii=False)
            return

        for (i, _), emb in zip(batch, embeddings):
            template_vectors[str(i)] = emb

        with open(templates_progress_path, 'w', encoding='utf-8') as f:
            json.dump(template_vectors, f, ensure_ascii=False)

    # ==================== VECTORIZE KEYWORDS ====================
    # keywords_data structure: { str(template_index): { keyword: embedding } }
    # We'll collect all pending keyword embeddings
    pending_keywords = []
    for idx, tmpl in enumerate(search_templates):
        idx_str = str(idx)
        if idx_str not in keywords_data:
            keywords_data[idx_str] = {}
        existing = keywords_data[idx_str]
        for kw in tmpl.get("keywords", []):
            if kw not in existing:
                pending_keywords.append((idx_str, kw))

    print(f"Palabras clave pendientes: {len(pending_keywords)}")
    # Batch by keyword text
    for start in tqdm(range(0, len(pending_keywords), batch_size), desc="Keywords"):
        batch = pending_keywords[start:start + batch_size]
        batch_texts = [kw for _, kw in batch]
        embeddings = embed_batch(batch_texts, f"Keywords: {batch_texts[:3]}...")
        if embeddings is None:
            with open(keywords_progress_path, 'w', encoding='utf-8') as f:
                json.dump(keywords_data, f, ensure_ascii=False)
            return
        for (idx_str, kw), emb in zip(batch, embeddings):
            keywords_data[idx_str][kw] = emb
        with open(keywords_progress_path, 'w', encoding='utf-8') as f:
            json.dump(keywords_data, f, ensure_ascii=False)

    # ==================== WRITE FINAL VECTOR FILES ====================
    # 1. Pokémon vectors (ordered)
    ordered_pokemon_vectors = [pokemon_vectors[str(p['id'])] for p in pokemons]
    with open(pokemon_vectors_path, 'w', encoding='utf-8') as f:
        json.dump(ordered_pokemon_vectors, f, ensure_ascii=False)
    print(f"   📄 pokemon.vectors.json   → {len(ordered_pokemon_vectors)} vectores")

    # 2. Full template vectors (ordered)
    ordered_template_vectors = [template_vectors[str(i)] for i in range(len(search_templates))]
    with open(templates_vectors_path, 'w', encoding='utf-8') as f:
        json.dump(ordered_template_vectors, f, ensure_ascii=False)
    print(f"   📄 templates.vectors.json → {len(ordered_template_vectors)} vectores")

    # 3. Keywords vectors (structure: list of dicts with template index, keywords list, embeddings list)
    keywords_output = []
    for idx, tmpl in enumerate(search_templates):
        idx_str = str(idx)
        kw_list = tmpl.get("keywords", [])
        kw_embeddings = [keywords_data[idx_str][kw] for kw in kw_list]  # order preserved
        keywords_output.append({
            "template_index": idx,
            "keywords": kw_list,
            "embeddings": kw_embeddings
        })
    with open(templates_keywords_vectors_path, 'w', encoding='utf-8') as f:
        json.dump(keywords_output, f, ensure_ascii=False)
    print(f"   📄 templates.keywords.vectors.json → {len(keywords_output)} entradas")

    # Cleanup progress files
    for p in [pokemon_progress_path, templates_progress_path, keywords_progress_path]:
        if os.path.exists(p):
            os.remove(p)

    print("\n✅ Vectorization complete!")


if __name__ == "__main__":
    main()