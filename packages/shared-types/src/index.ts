export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  nameEs?: string | null;
  description?: string | null;
  types: string[];
  generation: number;
  stats: PokemonStats;
  sprite?: string | null;
  embedding?: number[] | null;
  evolvesFrom?: EvolutionEdge[];
  evolvesTo?: EvolutionEdge[];
}

export interface PokemonDetail extends Pokemon {
  evolutionChain?: any;
}

export interface EvolutionEdge {
  id: number;
  fromPokemonId: number;
  toPokemonId: number;
  trigger: string;
  minLevel?: number | null;
  itemName?: string | null;
  from?: Pokemon;
  to?: Pokemon;
}

export interface EvolutionNode {
  id: number;
  name: string;
  nameEs?: string | null;
  sprite?: string | null;
  types: string[];
}

export interface EvolutionLink {
  trigger: string;
  minLevel?: number | null;
  itemName?: string | null;
  to: EvolutionTree;
}

export interface EvolutionTree {
  pokemon: EvolutionNode;
  evolvesTo: EvolutionLink[];
}

export interface SearchTemplate {
  id: number;
  queryText: string;
  category?: string | null;
  embedding?: number[] | null;
}

export interface PokemonSimilarResult extends Pokemon {
  similarity_score: number;
}

export interface SimilarGroupedByGen {
  generation: number;
  pokemons: PokemonSimilarResult[];
}

export interface SearchResult extends Pokemon {}
export type SearchMode = "semantic" | "textual";
