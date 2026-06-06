import os
import json
import shutil
import time
from tqdm import tqdm
import ollama

def main():
    print("🚀 Starting vectorization pipeline with Ollama (qwen3-embedding:8b)...")
    
    # ==================== PATHS ====================
    script_dir = os.path.dirname(os.path.abspath(__file__))
    seed_path = os.path.join(script_dir, "..", "..", "packages", "database", "src", "seeds", "seed-data.json")
    backup_path = seed_path + ".backup"
    progress_path = seed_path + ".progress"   # para guardar avances
    tmp_path = seed_path + ".tmp"             # archivo final atómico

    # 1. Si no hay backup, crearlo una sola vez (así el original siempre está a salvo)
    if not os.path.exists(backup_path):
        print(f"📦 Creando backup original en {backup_path}")
        shutil.copy2(seed_path, backup_path)
    else:
        print(f"ℹ️  Backup ya existe en {backup_path}, se usará el original de trabajo.")

    # 2. Cargar datos desde el progress (si existe) o desde el seed original
    if os.path.exists(progress_path):
        print("⏳ Detectado archivo de progreso. Reanudando desde ahí...")
        load_path = progress_path
    else:
        load_path = seed_path

    with open(load_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    pokemons = data.get("pokemons", [])
    search_templates = data.get("searchTemplates", [])
    evolution_edges = data.get("evolutionEdges", [])
    
    print(f"Loaded {len(pokemons)} pokemons, {len(search_templates)} templates.")

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

    # ==================== VECTORIZATION (con progreso) ====================
    batch_size = 8   # reducimos para evitar problemas de memoria/tiempo
    max_retries = 3

    def embed_batch(texts, desc=""):
        """Intenta embedding con reintentos. Si falla, devuelve None y el script lo maneja."""
        for attempt in range(max_retries):
            try:
                response = ollama.embed(model=model_name, input=texts)
                return [emb[:target_dim] + [0.0]*(target_dim - min(len(emb), target_dim)) 
                        for emb in response['embeddings']]
            except Exception as e:
                print(f"⚠️  Error en batch ({desc}), intento {attempt+1}/{max_retries}: {e}")
                time.sleep(2 ** attempt)
        print(f"❌ Batch falló definitivamente: {desc}")
        return None

    # Filtrar Pokémon que ya tienen embedding (por si reanudamos)
    pokemons_pendientes = [i for i, p in enumerate(pokemons) 
                           if "embedding" not in p or len(p.get("embedding", [])) != target_dim]
    print(f"Pokémons con embedding pendiente: {len(pokemons_pendientes)} de {len(pokemons)}")

    # Procesar Pokémon por lotes
    pokemon_texts_all = [
        f"{p['name']} | tipos: {', '.join(p.get('types', []))} | gen: {p.get('generation', '')} | {p.get('description') or ''}"
        for p in pokemons
    ]

    for start in tqdm(range(0, len(pokemons_pendientes), batch_size), desc="Pokémon"):
        indices = pokemons_pendientes[start:start+batch_size]
        batch_texts = [pokemon_texts_all[i] for i in indices]
        embeddings = embed_batch(batch_texts, f"Pokémon indices {indices}")
        if embeddings is None:
            print("⚠️  No se pudo procesar este batch. Guardando progreso y abortando para no perder lo avanzado.")
            # Guardar estado actual (lo que haya, aunque incompleto)
            with open(progress_path, 'w', encoding='utf-8') as pf:
                json.dump({"pokemons": pokemons, "searchTemplates": search_templates, "evolutionEdges": evolution_edges},
                          pf, ensure_ascii=False, indent=2)
            return  # Salir sin tocar el archivo original
        # Asignar embeddings a los Pokémon correspondientes
        for idx, emb in zip(indices, embeddings):
            pokemons[idx]["embedding"] = emb

        # Guardar progreso después de cada batch exitoso
        with open(progress_path, 'w', encoding='utf-8') as pf:
            json.dump({"pokemons": pokemons, "searchTemplates": search_templates, "evolutionEdges": evolution_edges},
                      pf, ensure_ascii=False, indent=2)

    # Templates (igual lógica)
    templates_pendientes = [i for i, t in enumerate(search_templates) 
                            if "embedding" not in t or len(t.get("embedding", [])) != target_dim]
    print(f"Templates pendientes: {len(templates_pendientes)} de {len(search_templates)}")

    template_texts_all = [t["queryText"] for t in search_templates]
    for start in tqdm(range(0, len(templates_pendientes), batch_size), desc="Templates"):
        indices = templates_pendientes[start:start+batch_size]
        batch_texts = [template_texts_all[i] for i in indices]
        embeddings = embed_batch(batch_texts, f"Templates indices {indices}")
        if embeddings is None:
            with open(progress_path, 'w', encoding='utf-8') as pf:
                json.dump({"pokemons": pokemons, "searchTemplates": search_templates, "evolutionEdges": evolution_edges},
                          pf, ensure_ascii=False, indent=2)
            return
        for idx, emb in zip(indices, embeddings):
            search_templates[idx]["embedding"] = emb
        with open(progress_path, 'w', encoding='utf-8') as pf:
            json.dump({"pokemons": pokemons, "searchTemplates": search_templates, "evolutionEdges": evolution_edges},
                      pf, ensure_ascii=False, indent=2)

    # ==================== GUARDADO FINAL ATÓMICO ====================
    final_data = {
        "pokemons": pokemons,
        "searchTemplates": search_templates,
        "evolutionEdges": evolution_edges
    }
    # Escribir en temporal
    with open(tmp_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    # Reemplazar el original
    os.replace(tmp_path, seed_path)  # operación atómica en la mayoría de sistemas
    # Limpiar archivos auxiliares
    if os.path.exists(progress_path):
        os.remove(progress_path)
    # Opcional: mantener el backup como histórico
    # os.remove(backup_path)

    print(f"\n✅ Vectorization complete! Seed actualizado en {seed_path}")
    print(f"   Backup original conservado en {backup_path}")

if __name__ == "__main__":
    main()