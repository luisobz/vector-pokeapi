#!/usr/bin/env python3
import os
import re
import json

# ----------------------------------------------------------------------
# Tokenization configuration
# ----------------------------------------------------------------------
STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on",
    "for", "with", "by", "from", "is", "are", "was", "were"
}

def tokenize_keywords(query_text: str):
    """
    Returns a list of significant words (lowercase, without stopwords,
    length >= 3, no special characters, no duplicates).
    """
    # Clean and normalize
    text = query_text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)  # remove punctuation
    words = text.split()

    # Filter
    keywords = [w for w in words if w not in STOPWORDS and len(w) >= 3]

    # Remove duplicates while preserving order
    seen = set()
    unique = []
    for w in keywords:
        if w not in seen:
            seen.add(w)
            unique.append(w)

    return unique

# ----------------------------------------------------------------------
# Search templates (original)
# ----------------------------------------------------------------------
SEARCH_TEMPLATES = [
    # Category: type
    {"queryText": "fast yellow electric mouse", "category": "type"},
    {"queryText": "fire lizard with a blazing tail", "category": "type"},
    {"queryText": "water turtle with cannons on its shell", "category": "type"},
    {"queryText": "plant dinosaur with a flower on its back", "category": "type"},
    {"queryText": "fearsome flying fire dragon", "category": "type"},
    {"queryText": "fast flying bird of normal type", "category": "type"},
    {"queryText": "purple poisonous snake", "category": "type"},

    # Category: role
    {"queryText": "slow and heavy defensive tank", "category": "role"},
    {"queryText": "fast and aggressive physical attacker", "category": "role"},
    {"queryText": "special attacker with high spiritual power", "category": "role"},
    {"queryText": "healing support for the team", "category": "role"},
    {"queryText": "defensive wall with high health", "category": "role"},

    # Category: lore
    {"queryText": "mysterious and powerful scientific genetic experiment", "category": "lore"},
    {"queryText": "mystical creature living in dark caves", "category": "lore"},
    {"queryText": "resurrected prehistoric fossil pokemon", "category": "lore"},
    {"queryText": "legendary guardian of forests and nature", "category": "lore"},

    # Category: evolution
    {"queryText": "evolves using a bright thunder stone", "category": "evolution"},
    {"queryText": "transforms through the energy of a water stone", "category": "evolution"},
    {"queryText": "evolves by trading with another trainer", "category": "evolution"},
    {"queryText": "evolutionary line with multiple transformations", "category": "evolution"}
]

# Enrich each template with extracted keywords
for tmpl in SEARCH_TEMPLATES:
    tmpl["keywords"] = tokenize_keywords(tmpl["queryText"])

# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------
def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    seeds_dir = os.path.join(script_dir, "..", "..", "packages", "database", "src", "seeds")
    os.makedirs(seeds_dir, exist_ok=True)

    output_path = os.path.join(seeds_dir, "templates.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(SEARCH_TEMPLATES, f, ensure_ascii=False, indent=2)

    print(f"✅ Templates saved → {output_path} ({len(SEARCH_TEMPLATES)} templates)")

    # Display keyword statistics
    total_keywords = sum(len(t["keywords"]) for t in SEARCH_TEMPLATES)
    print(f"   Total extracted keywords: {total_keywords}")

if __name__ == "__main__":
    main()