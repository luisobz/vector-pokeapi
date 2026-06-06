#!/usr/bin/env python3
"""
generate_templates.py
Genera el archivo de plantillas de búsqueda (templates.json).
"""

import os
import json

# ----------------------------------------------------------------------
# Plantillas de búsqueda – mismo contenido que antes
# ----------------------------------------------------------------------
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


def main():
    # Ruta de salida: mismo directorio de seeds que usas en el resto de scripts
    script_dir = os.path.dirname(os.path.abspath(__file__))
    seeds_dir = os.path.join(script_dir, "..", "..", "packages", "database", "src", "seeds")
    os.makedirs(seeds_dir, exist_ok=True)

    output_path = os.path.join(seeds_dir, "templates.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(SEARCH_TEMPLATES, f, ensure_ascii=False, indent=2)

    print(f"✅ Templates guardados → {output_path} ({len(SEARCH_TEMPLATES)} plantillas)")


if __name__ == "__main__":
    main()