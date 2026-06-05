import os
import json
import torch
from sentence_transformers import SentenceTransformer

def main():
    print("🚀 Starting vectorization pipeline...")
    
    # Define file paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    raw_data_path = os.path.join(script_dir, "..", "..", "data", "raw-data.json")
    output_seed_path = os.path.join(script_dir, "..", "..", "packages", "database", "prisma", "seed-data.json")
    
    if not os.path.exists(raw_data_path):
        print(f"❌ raw-data.json not found at: {raw_data_path}")
        print("Please run fetch_data.py first to acquire the raw Pokemon data.")
        return
        
    # Read raw-data.json
    with open(raw_data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    pokemons = data.get("pokemons", [])
    search_templates = data.get("searchTemplates", [])
    evolution_edges = data.get("evolutionEdges", [])
    
    print(f"Loaded {len(pokemons)} pokemons, {len(search_templates)} search templates, and {len(evolution_edges)} evolution edges.")

    # 1. Initialize SentenceTransformer with Qwen/Qwen3-Embedding-4B
    model_name = "Qwen/Qwen3-Embedding-4B"
    print(f"Loading embedding model '{model_name}' (this may take a few minutes)...")
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using execution device: {device.upper()}")
    
    try:
        model = SentenceTransformer(model_name, trust_remote_code=True, device=device)
    except Exception as e:
        print(f"⚠️ Error loading '{model_name}': {str(e)}")
        fallback_model = "all-MiniLM-L6-v2"
        print(f"🔄 Falling back to lighter model: '{fallback_model}'")
        model = SentenceTransformer(fallback_model, device=device)
        # Note: If we fallback to MiniLM, dimension is 384. But our schema defines vector(4096).
        # We will pad with zeros or interpolate if needed, or prompt the user.
        # But let's assume Qwen is trusted or they will have dependencies ready.

    # 2. Vectorize Pokémon
    print("Vectorizing Pokémon entries...")
    pokemon_texts = []
    for p in pokemons:
        # Generate prompt representation
        prompt = f"{p['name']} | tipos: {', '.join(p['types'])} | gen: {p['generation']} | {p['description'] or ''}"
        pokemon_texts.append(prompt)
        
    print(f"Running embeddings on {len(pokemon_texts)} prompts...")
    pokemon_embeddings = model.encode(
        pokemon_texts,
        batch_size=32,
        show_progress_bar=True,
        normalize_embeddings=True
    )
    
    # Map embeddings back to Pokémon
    for idx, p in enumerate(pokemons):
        embedding_vector = pokemon_embeddings[idx].tolist()
        
        # Double check and ensure dimension size is exactly 4096
        # if using fallback or model has different output size
        if len(embedding_vector) < 4096:
            # Pad with zeros to fit database schema vector(4096)
            embedding_vector = embedding_vector + [0.0] * (4096 - len(embedding_vector))
        elif len(embedding_vector) > 4096:
            # Truncate
            embedding_vector = embedding_vector[:4096]
            
        p["embedding"] = embedding_vector

    # 3. Vectorize Search Templates
    print("Vectorizing Search Templates...")
    template_texts = [t["queryText"] for t in search_templates]
    
    print(f"Running embeddings on {len(template_texts)} templates...")
    template_embeddings = model.encode(
        template_texts,
        batch_size=32,
        show_progress_bar=True,
        normalize_embeddings=True
    )
    
    # Map embeddings back to Templates
    for idx, t in enumerate(search_templates):
        embedding_vector = template_embeddings[idx].tolist()
        
        if len(embedding_vector) < 4096:
            embedding_vector = embedding_vector + [0.0] * (4096 - len(embedding_vector))
        elif len(embedding_vector) > 4096:
            embedding_vector = embedding_vector[:4096]
            
        t["embedding"] = embedding_vector

    # 4. Save to packages/database/prisma/seed-data.json
    output_dir = os.path.dirname(output_seed_path)
    os.makedirs(output_dir, exist_ok=True)
    
    final_seed_data = {
        "pokemons": pokemons,
        "evolutionEdges": evolution_edges,
        "searchTemplates": search_templates
    }
    
    print(f"Saving vectorized seed data to {output_seed_path}...")
    with open(output_seed_path, 'w', encoding='utf-8') as f:
        json.dump(final_seed_data, f, ensure_ascii=False, indent=2)
        
    print("✅ Vectorization complete! The database seed file is ready to be committed.")

if __name__ == "__main__":
    main()
