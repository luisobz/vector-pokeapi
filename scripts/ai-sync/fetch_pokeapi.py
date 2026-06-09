import os
import json
import re
import requests
from tqdm import tqdm

BASE_URL = "https://pokeapi.co/api/v2"

# ─── Traducciones fijas (inglés y español) ────────────────────────────────
TEXTS = {
    "en": {
        "baby": "a baby Pokémon",
        "legendary": "a legendary Pokémon",
        "mythical": "a mythical Pokémon",
        "known_as": 'known as "{genus}"',
        "found_in": "commonly found in {habitat} environments",
        "color": "predominantly {color} in color",
        "shape": "with a silhouette classified as {shape}",
        "intro": "{name} is {traits}.",
        "intro_no_traits": "{name} is a Pokémon.",
        "generation": "{name} first appeared in the {generation}.",
        "breeding": "Belongs to the {egg_groups} egg groups."
    },
    "es": {
        "baby": "un Pokémon bebé",
        "legendary": "un Pokémon legendario",
        "mythical": "un Pokémon singular",
        "known_as": 'conocido como "{genus}"',
        "found_in": "comúnmente encontrado en entornos de {habitat}",
        "color": "de color predominantemente {color}",
        "shape": "con una silueta clasificada como {shape}",
        "intro": "{name} es {traits}.",
        "intro_no_traits": "{name} es un Pokémon.",
        "generation": "{name} apareció por primera vez en la {generation}.",
        "breeding": "Pertenece a los grupos huevo {egg_groups}."
    }
}

# Traducciones de términos de la API (hábitats, colores, formas, grupos huevo)
TERM_TRANSLATIONS = {
    "habitat": {
        "cave": {"es": "cueva"},
        "forest": {"es": "bosque"},
        "grassland": {"es": "pradera"},
        "mountain": {"es": "montaña"},
        "rare": {"es": "raro"},
        "rough-terrain": {"es": "terreno escarpado"},
        "sea": {"es": "mar"},
        "urban": {"es": "urbano"},
        "waters-edge": {"es": "orilla del agua"}
    },
    "color": {
        "black": {"es": "negro"},
        "blue": {"es": "azul"},
        "brown": {"es": "marrón"},
        "gray": {"es": "gris"},
        "green": {"es": "verde"},
        "pink": {"es": "rosa"},
        "purple": {"es": "púrpura"},
        "red": {"es": "rojo"},
        "white": {"es": "blanco"},
        "yellow": {"es": "amarillo"}
    },
    "shape": {
        "ball": {"es": "bola"},
        "squiggle": {"es": "garabato"},
        "fish": {"es": "pez"},
        "arms": {"es": "brazos"},
        "blob": {"es": "gota"},
        "upright": {"es": "erguido"},
        "legs": {"es": "piernas"},
        "quadruped": {"es": "cuadrúpedo"},
        "wings": {"es": "alas"},
        "tentacles": {"es": "tentáculos"},
        "heads": {"es": "cabezas"},
        "humanoid": {"es": "humanoide"},
        "bug-wings": {"es": "alas de insecto"},
        "armor": {"es": "armadura"}
    },
    "egg_group": {
        "monster": {"es": "monstruo"},
        "water1": {"es": "agua 1"},
        "bug": {"es": "bicho"},
        "flying": {"es": "volador"},
        "field": {"es": "campo"},
        "fairy": {"es": "hada"},
        "grass": {"es": "planta"},
        "human-like": {"es": "humanoide"},
        "water3": {"es": "agua 3"},
        "mineral": {"es": "mineral"},
        "amorphous": {"es": "amorfo"},
        "water2": {"es": "agua 2"},
        "ditto": {"es": "ditto"},
        "dragon": {"es": "dragón"},
        "no-eggs": {"es": "sin huevos"}
    }
}

def translate_term(category, value, language):
    """Traduce un término de la API (hábitat, color, etc.) al idioma deseado."""
    if language == "en":
        return value
    term_dict = TERM_TRANSLATIONS.get(category, {})
    term_info = term_dict.get(value, {})
    return term_info.get(language, value)  # fallback al original si no existe traducción

def parse_roman_generation(gen_name):
    roman = gen_name.lower().replace("generation-", "").strip()
    mapping = {
        "i": 1, "ii": 2, "iii": 3, "iv": 4, "v": 5,
        "vi": 6, "vii": 7, "viii": 8, "ix": 9, "x": 10
    }
    return mapping.get(roman, 1)

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'[\n\r\f\t]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def build_pokemon_lore(species, language='en'):
    # Textos del idioma solicitado (fallback al inglés)
    texts = TEXTS.get(language, TEXTS['en'])
    
    # Nombre en el idioma (si existe)
    names = species.get('names', [])
    name = next((n['name'] for n in names if n['language']['name'] == language), None)
    if not name:
        # fallback al nombre por defecto (inglés interno) o inglés
        name = species.get('name', '???')
    
    # Género (category)
    genera = species.get('genera', [])
    genus = next((g['genus'] for g in genera if g['language']['name'] == language), None)
    if not genus:
        genus = next((g['genus'] for g in genera if g['language']['name'] == 'en'), '')
    
    # Descripciones de sabor
    flavor_text_entries = species.get('flavor_text_entries', [])
    flavor_texts = []
    for f in flavor_text_entries:
        if f['language']['name'] == language:
            text = f['flavor_text'].replace('\f', ' ').replace('\n', ' ')
            text = re.sub(r'\s+', ' ', text).strip()
            if text not in flavor_texts:
                flavor_texts.append(text)
    # Si no hay en el idioma deseado, usar inglés
    if not flavor_texts:
        for f in flavor_text_entries:
            if f['language']['name'] == 'en':
                text = f['flavor_text'].replace('\f', ' ').replace('\n', ' ')
                text = re.sub(r'\s+', ' ', text).strip()
                if text not in flavor_texts:
                    flavor_texts.append(text)
    
    lore_fragments = re.sub(r'\s+', ' ', ' '.join(flavor_texts[:10]))
    
    # Construir traits traducidos
    traits = []
    if species.get('is_baby'):
        traits.append(texts["baby"])
    if species.get('is_legendary'):
        traits.append(texts["legendary"])
    if species.get('is_mythical'):
        traits.append(texts["mythical"])
    
    if genus:
        traits.append(texts["known_as"].format(genus=genus))
    
    habitat = species.get('habitat')
    if habitat:
        habitat_name = translate_term("habitat", habitat['name'], language)
        traits.append(texts["found_in"].format(habitat=habitat_name))
    
    color = species.get('color')
    if color:
        color_name = translate_term("color", color['name'], language)
        traits.append(texts["color"].format(color=color_name))
    
    shape = species.get('shape')
    if shape:
        shape_name = translate_term("shape", shape['name'], language)
        traits.append(texts["shape"].format(shape=shape_name))
    
    if traits:
        intro = texts["intro"].format(name=name, traits=', '.join(traits))
    else:
        intro = texts["intro_no_traits"].format(name=name)
    
    generation_name = species.get('generation', {}).get('name', '')
    generation = texts["generation"].format(
        name=name,
        generation=generation_name.replace('-', ' ')
    )
    
    egg_groups = species.get('egg_groups', [])
    if egg_groups:
        translated_groups = [translate_term("egg_group", g['name'], language) for g in egg_groups]
        breeding = texts["breeding"].format(egg_groups=', '.join(translated_groups))
    else:
        breeding = ""
    
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
    end_id = 1025
    
    output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "packages", "database", "src", "seeds")
    os.makedirs(output_dir, exist_ok=True)
    
    checkpoint_path       = os.path.join(output_dir, "checkpoint.json")
    pokemon_path          = os.path.join(output_dir, "pokemon.json")
    evolution_edges_path  = os.path.join(output_dir, "evolutionEdges.json")
    
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
            p_res = requests.get(f"{BASE_URL}/pokemon/{pokemon_id}")
            if p_res.status_code != 200:
                print(f"\n❌ Failed to fetch Pokemon {pokemon_id}")
                continue
            p_data = p_res.json()
            
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
            
            s_res = requests.get(f"{BASE_URL}/pokemon-species/{pokemon_id}")
            if s_res.status_code != 200:
                print(f"\n❌ Failed to fetch Pokemon Species {pokemon_id}")
                continue
            s_data = s_res.json()
            
            # Nombres
            name_en = next((n['name'] for n in s_data['names'] if n['language']['name'] == 'en'), None)
            name_es = next((n['name'] for n in s_data['names'] if n['language']['name'] == 'es'), None)
            if not name_en:
                name_en = p_data["name"]  # fallback al nombre interno
            if not name_es:
                name_es = name_en  # fallback al inglés si no hay español
            
            # Descripciones en ambos idiomas
            desc_en = build_pokemon_lore(s_data, 'en')
            desc_es = build_pokemon_lore(s_data, 'es')
            
            gen_number = parse_roman_generation(s_data['generation']['name'])
            
            height = p_data.get('height')
            order = p_data.get('order')
            weight = p_data.get('weight')
            
            pokemons.append({
                "id": pokemon_id,
                "name": name_en,
                "name_es": name_es,
                "description": desc_en,
                "description_es": desc_es,
                "types": types,
                "generation": gen_number,
                "stats": stats,
                "sprite": sprite,
                "height": height,
                "order": order,
                "weight": weight
            })
            
            # Evolution chain
            chain_url = s_data['evolution_chain']['url']
            chain_id = int(chain_url.split('/')[-2])
            
            if chain_id not in processed_chains:
                processed_chains.add(chain_id)
                c_res = requests.get(chain_url)
                if c_res.status_code == 200:
                    c_data = c_res.json()
                    parse_evolution_chain(c_data['chain'], evolution_edges, visited_edges)
            
            if pokemon_id % 10 == 0 or pokemon_id == end_id:
                state["last_id"] = pokemon_id
                state["pokemons"] = pokemons
                state["evolution_edges"] = evolution_edges
                state["processed_chains"] = list(processed_chains)
                with open(checkpoint_path, 'w', encoding='utf-8') as f:
                    json.dump(state, f, ensure_ascii=False, indent=2)
                    
        except Exception as e:
            print(f"\n❌ Exception occurred for Pokemon {pokemon_id}: {str(e)}")
            
    with open(pokemon_path, 'w', encoding='utf-8') as f:
        json.dump(pokemons, f, ensure_ascii=False, indent=2)
    print(f"   📄 pokemon.json         → {len(pokemons)} records")

    with open(evolution_edges_path, 'w', encoding='utf-8') as f:
        json.dump(evolution_edges, f, ensure_ascii=False, indent=2)
    print(f"   📄 evolutionEdges.json  → {len(evolution_edges)} records")
        
    if os.path.exists(checkpoint_path):
        os.remove(checkpoint_path)
        
    print(f"\n✅ Data fetching complete! Files saved to {output_dir}/")

if __name__ == "__main__":
    main()