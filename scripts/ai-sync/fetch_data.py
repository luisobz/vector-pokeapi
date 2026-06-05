import os
import json
import re
import requests
from tqdm import tqdm

BASE_URL = "https://pokeapi.co/api/v2"

# Curated search templates for showcase
SEARCH_TEMPLATES = [
    # Category: tipo
    {"queryText": "ratón eléctrico amarillo rápido", "category": "tipo"},
    {"queryText": "lagarto de fuego con cola ardiente", "category": "tipo"},
    {"queryText": "tortuga de agua con cañones en el caparazón", "category": "tipo"},
    {"queryText": "dinosaurio de planta con una flor en el lomo", "category": "tipo"},
    {"queryText": "dragón volador de fuego temible", "category": "tipo"},
    {"queryText": "pájaro volador rápido de tipo normal", "category": "tipo"},
    {"queryText": "serpiente venenosa de color morado", "category": "tipo"},
    # Category: rol
    {"queryText": "tanque defensivo lento y pesado", "category": "rol"},
    {"queryText": "atacante físico rápido y agresivo", "category": "rol"},
    {"queryText": "atacante especial con alto poder espiritual", "category": "rol"},
    {"queryText": "soporte curativo para el equipo", "category": "rol"},
    {"queryText": "muralla defensiva con mucha salud", "category": "rol"},
    # Category: lore
    {"queryText": "experimento genético científico misterioso y poderoso", "category": "lore"},
    {"queryText": "criatura mística que vive en cuevas oscuras", "category": "lore"},
    {"queryText": "pokémon fósil prehistórico resucitado", "category": "lore"},
    {"queryText": "guardián legendario de los bosques y la naturaleza", "category": "lore"},
    # Category: evolución
    {"queryText": "evoluciona usando una piedra trueno brillante", "category": "evolución"},
    {"queryText": "se transforma con la energía de la piedra agua", "category": "evolución"},
    {"queryText": "evoluciona mediante intercambio con otro entrenador", "category": "evolución"},
    {"queryText": "línea evolutiva que tiene múltiples transformaciones", "category": "evolución"}
]

def parse_roman_generation(gen_name):
    # e.g., "generation-i" -> 1
    roman = gen_name.lower().replace("generation-", "").strip()
    mapping = {
        "i": 1, "ii": 2, "iii": 3, "iv": 4, "v": 5,
        "vi": 6, "vii": 7, "viii": 8, "ix": 9, "x": 10
    }
    return mapping.get(roman, 1)

def clean_text(text):
    if not text:
        return ""
    # Replace line breaks and control characters with space
    text = re.sub(r'[\n\r\f\t]', ' ', text)
    # Deduplicate spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_evolution_chain(node, edges, visited_edges):
    current_species_id = int(node['species']['url'].split('/')[-2])
    for child in node.get('evolves_to', []):
        child_species_id = int(child['species']['url'].split('/')[-2])
        
        details_list = child.get('evolution_details', [])
        details = details_list[0] if details_list else {}
        
        trigger = details.get('trigger', {}).get('name', 'level-up')
        min_level = details.get('min_level')
        item_name = details.get('item', {}).get('name') if details.get('item') else None
        
        edge_key = f"{current_species_id}-{child_species_id}"
        if edge_key not in visited_edges:
            visited_edges.add(edge_key)
            edges.append({
                'fromPokemonId': current_species_id,
                'toPokemonId': child_species_id,
                'trigger': trigger,
                'minLevel': min_level,
                'itemName': item_name
            })
        
        parse_evolution_chain(child, edges, visited_edges)

def main():
    print("🚀 Starting PokéAPI data fetching pipeline...")
    
    # We fetch first 151 Pokemon (Gen 1) by default, or configurable
    start_id = 1
    end_id = 151
    
    output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    
    checkpoint_path = os.path.join(output_dir, "checkpoint.json")
    raw_data_path = os.path.join(output_dir, "raw-data.json")
    
    # Load checkpoint if exists
    state = {"last_id": 0, "pokemons": [], "evolution_edges": [], "processed_chains": []}
    if os.path.exists(checkpoint_path):
        try:
            with open(checkpoint_path, 'r', encoding='utf-8') as f:
                state = json.load(f)
            print(f"🔄 Resuming from checkpoint. Last processed ID: {state['last_id']}")
        except Exception:
            print("⚠️ Checkpoint corrupt, starting fresh.")
            
    pokemons = state["pokemons"]
    evolution_edges = state["evolution_edges"]
    processed_chains = set(state["processed_chains"])
    visited_edges = set(f"{edge['fromPokemonId']}-{edge['toPokemonId']}" for edge in evolution_edges)
    
    start_id = max(start_id, state["last_id"] + 1)
    
    for pokemon_id in tqdm(range(start_id, end_id + 1), desc="Fetching Pokémons"):
        try:
            # 1. Fetch Pokemon base data
            p_res = requests.get(f"{BASE_URL}/pokemon/{pokemon_id}")
            if p_res.status_code != 200:
                print(f"\n❌ Failed to fetch Pokemon {pokemon_id}")
                continue
            p_data = p_res.json()
            
            # Extract types, stats, and official-artwork sprite
            types = [t['type']['name'] for t in p_data['types']]
            
            stats_raw = p_data['stats']
            stats = {
                "hp": next(s['base_stat'] for s in stats_raw if s['stat']['name'] == 'hp'),
                "attack": next(s['base_stat'] for s in stats_raw if s['stat']['name'] == 'attack'),
                "defense": next(s['base_stat'] for s in stats_raw if s['stat']['name'] == 'defense'),
                "spAtk": next(s['base_stat'] for s in stats_raw if s['stat']['name'] == 'special-attack'),
                "spDef": next(s['base_stat'] for s in stats_raw if s['stat']['name'] == 'special-defense'),
                "speed": next(s['base_stat'] for s in stats_raw if s['stat']['name'] == 'speed')
            }
            
            sprite = p_data['sprites']['other']['official-artwork']['front_default']
            
            # 2. Fetch Pokemon species data
            s_res = requests.get(f"{BASE_URL}/pokemon-species/{pokemon_id}")
            if s_res.status_code != 200:
                print(f"\n❌ Failed to fetch Pokemon Species {pokemon_id}")
                continue
            s_data = s_res.json()
            
            # Extract Spanish name if available, fallback to default name
            name_es = next((n['name'] for n in s_data['names'] if n['language']['name'] == 'es'), None)
            
            # Extract Spanish description (flavor text)
            desc_es = next((f['flavor_text'] for f in s_data['flavor_text_entries'] if f['language']['name'] == 'es'), None)
            desc_es = clean_text(desc_es) if desc_es else ""
            
            gen_number = parse_roman_generation(s_data['generation']['name'])
            
            # Append Pokemon
            pokemons.append({
                "id": pokemon_id,
                "name": p_data["name"],
                "nameEs": name_es,
                "description": desc_es,
                "types": types,
                "generation": gen_number,
                "stats": stats,
                "sprite": sprite
            })
            
            # 3. Fetch Evolution Chain if not processed yet
            chain_url = s_data['evolution_chain']['url']
            chain_id = int(chain_url.split('/')[-2])
            
            if chain_id not in processed_chains:
                processed_chains.add(chain_id)
                c_res = requests.get(chain_url)
                if c_res.status_code == 200:
                    c_data = c_res.json()
                    parse_evolution_chain(c_data['chain'], evolution_edges, visited_edges)
            
            # Save checkpoints incrementally (every 10 items)
            if pokemon_id % 10 == 0 or pokemon_id == end_id:
                state["last_id"] = pokemon_id
                state["pokemons"] = pokemons
                state["evolution_edges"] = evolution_edges
                state["processed_chains"] = list(processed_chains)
                with open(checkpoint_path, 'w', encoding='utf-8') as f:
                    json.dump(state, f, ensure_ascii=False, indent=2)
                    
        except Exception as e:
            print(f"\n❌ Exception occurred for Pokemon {pokemon_id}: {str(e)}")
            
    # Output final raw-data.json
    final_output = {
        "pokemons": pokemons,
        "evolutionEdges": evolution_edges,
        "searchTemplates": SEARCH_TEMPLATES
    }
    
    with open(raw_data_path, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)
        
    # Remove checkpoint after success
    if os.path.exists(checkpoint_path):
        os.remove(checkpoint_path)
        
    print(f"\n✅ Data fetching complete! Saved {len(pokemons)} pokemons and {len(evolution_edges)} evolution edges to data/raw-data.json")

if __name__ == "__main__":
    main()
