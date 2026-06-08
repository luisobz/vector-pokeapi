import os
import json
import re
import requests
from tqdm import tqdm

BASE_URL = "https://pokeapi.co/api/v2"

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

def build_pokemon_lore(species, language='en'):
    names = species.get('names', [])
    name = next((n['name'] for n in names if n['language']['name'] == language), species.get('name', ''))

    genera = species.get('genera', [])
    genus = next((g['genus'] for g in genera if g['language']['name'] == language), None)
    if not genus:
        genus = next((g['genus'] for g in genera if g['language']['name'] == 'en'), '')

    flavor_text_entries = species.get('flavor_text_entries', [])
    flavor_texts = []
    for f in flavor_text_entries:
        if f['language']['name'] == language:
            text = f['flavor_text'].replace('\f', ' ').replace('\n', ' ')
            text = re.sub(r'\s+', ' ', text).strip()
            if text not in flavor_texts:
                flavor_texts.append(text)

    lore_fragments = re.sub(r'\s+', ' ', ' '.join(flavor_texts[:10]))

    traits = []
    if species.get('is_baby'): traits.append('a baby Pokémon')
    if species.get('is_legendary'): traits.append('a legendary Pokémon')
    if species.get('is_mythical'): traits.append('a mythical Pokémon')

    if genus:
        traits.append(f'known as "{genus}"')

    habitat = species.get('habitat')
    if habitat:
        traits.append(f"commonly found in {habitat['name']} environments")

    color = species.get('color')
    if color:
        traits.append(f"predominantly {color['name']} in color")

    shape = species.get('shape')
    if shape:
        traits.append(f"with a silhouette classified as {shape['name']}")

    intro = f"{name} is {', '.join(traits)}." if traits else f"{name} is a Pokémon."
    
    generation_name = species.get('generation', {}).get('name', '')
    generation = f"{name} first appeared in the {generation_name.replace('-', ' ')}."

    egg_groups = species.get('egg_groups', [])
    breeding = f"Belongs to the {', '.join([g['name'] for g in egg_groups])} egg groups." if egg_groups else ""

    parts = [intro, generation, breeding, lore_fragments]
    return '\n\n'.join([p for p in parts if p])

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
                'from_pokemon_id': current_species_id,
                'to_pokemon_id': child_species_id,
                'trigger': trigger,
                'min_level': min_level,
                'item_name': item_name
            })
        
        parse_evolution_chain(child, edges, visited_edges)

def main():
    print("🚀 Starting PokéAPI data fetching pipeline...")
    
    start_id = 1
    end_id = 151
    
    output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "packages", "database", "src", "seeds")
    os.makedirs(output_dir, exist_ok=True)
    
    # ── Output paths (one file per domain) ──────────────────────────────────
    checkpoint_path       = os.path.join(output_dir, "checkpoint.json")
    pokemon_path          = os.path.join(output_dir, "pokemon.json")
    evolution_edges_path  = os.path.join(output_dir, "evolutionEdges.json")
    
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
    visited_edges = set(f"{edge['from_pokemon_id']}-{edge['to_pokemon_id']}" for edge in evolution_edges)
    
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
                "sp_atk": next(s['base_stat'] for s in stats_raw if s['stat']['name'] == 'special-attack'),
                "sp_def": next(s['base_stat'] for s in stats_raw if s['stat']['name'] == 'special-defense'),
                "speed": next(s['base_stat'] for s in stats_raw if s['stat']['name'] == 'speed')
            }
            
            sprite = p_data['sprites']['other']['official-artwork']['front_default']
            
            # 2. Fetch Pokemon species data
            s_res = requests.get(f"{BASE_URL}/pokemon-species/{pokemon_id}")
            if s_res.status_code != 200:
                print(f"\n❌ Failed to fetch Pokemon Species {pokemon_id}")
                continue
            s_data = s_res.json()
            
            # Extract English name if available, fallback to default name
            name_en = next((n['name'] for n in s_data['names'] if n['language']['name'] == 'en'), None)
            
            # Extract English description (flavor text) using the new lore builder
            desc_en = build_pokemon_lore(s_data, 'en')
            
            gen_number = parse_roman_generation(s_data['generation']['name'])
            
            height = p_data.get('height')
            order = p_data.get('order')
            weight = p_data.get('weight')
            
            # Append Pokemon
            pokemons.append({
                "id": pokemon_id,
                "name": p_data["name"],
                "name_es": name_en,
                "description": desc_en,
                "types": types,
                "generation": gen_number,
                "stats": stats,
                "sprite": sprite,
                "height": height,
                "order": order,
                "weight": weight
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
            
            # Save checkpoint incrementally (every 10 items)
            if pokemon_id % 10 == 0 or pokemon_id == end_id:
                state["last_id"] = pokemon_id
                state["pokemons"] = pokemons
                state["evolution_edges"] = evolution_edges
                state["processed_chains"] = list(processed_chains)
                with open(checkpoint_path, 'w', encoding='utf-8') as f:
                    json.dump(state, f, ensure_ascii=False, indent=2)
                    
        except Exception as e:
            print(f"\n❌ Exception occurred for Pokemon {pokemon_id}: {str(e)}")
            
    # ── Write one file per domain ────────────────────────────────────────────
    with open(pokemon_path, 'w', encoding='utf-8') as f:
        json.dump(pokemons, f, ensure_ascii=False, indent=2)
    print(f"   📄 pokemon.json         → {len(pokemons)} records")

    with open(evolution_edges_path, 'w', encoding='utf-8') as f:
        json.dump(evolution_edges, f, ensure_ascii=False, indent=2)
    print(f"   📄 evolutionEdges.json  → {len(evolution_edges)} records")
        
    # Remove checkpoint after success
    if os.path.exists(checkpoint_path):
        os.remove(checkpoint_path)
        
    print(f"\n✅ Data fetching complete! Files saved to {output_dir}/")

if __name__ == "__main__":
    main()