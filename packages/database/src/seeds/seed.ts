import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJson<T>(filename: string): T {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed file not found: ${filename}. Run the fetch / vectorize scripts first.`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

async function main() {
  // ── Load seed files ──────────────────────────────────────────────────────
  const pokemons = readJson<any[]>("pokemon.json");
  const evolution_edges = readJson<any[]>("evolutionEdges.json");
  const templates = readJson<any[]>("templates.json");

  // Vector files are optional (seeding without embeddings is allowed)
  const pokemon_vectors: (number[] | null)[] = fs.existsSync(path.join(__dirname, "pokemon.vectors.json"))
    ? readJson<number[][]>("pokemon.vectors.json")
    : [];

  const template_vectors: (number[] | null)[] = fs.existsSync(path.join(__dirname, "templates.vectors.json"))
    ? readJson<number[][]>("templates.vectors.json")
    : [];

  let template_keywords_vectors: any[] = [];
  const keywords_path = path.join(__dirname, "templates.keywords.vectors.json");
  if (fs.existsSync(keywords_path)) {
    try {
      template_keywords_vectors = JSON.parse(fs.readFileSync(keywords_path, "utf8"));
      console.log(`✅ Cargado keywords desde ${keywords_path}`);
    } catch (err) {
      console.error(`❌ Error al parsear ${keywords_path}:`, err);
    }
  } else {
    console.log(`ℹ️  No se encontró ${keywords_path}, omitiendo keywords.`);
  }

  console.log("Seeding database...");

  // ── Clean existing data (reverse dependency order) ───────────────────────
  console.log("Cleaning existing database records...");
  await prisma.templateWord.deleteMany();
  await prisma.evolutionEdge.deleteMany();
  await prisma.pokemon.deleteMany();
  await prisma.searchTemplate.deleteMany();

  // ── 1. Insert Pokémons ───────────────────────────────────────────────────
  console.log(`Inserting ${pokemons.length} pokemons...`);
  for (let i = 0; i < pokemons.length; i++) {
    const p = pokemons[i];
    const embedding = pokemon_vectors[i] ?? null;
    const embedding_string = embedding ? `[${embedding.join(",")}]` : null;

    await prisma.$executeRawUnsafe(
      `INSERT INTO pokemons (id, name, name_es, description, description_es, types, generation, stats, sprite, height, weight, embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12::vector)`,
      p.id,
      p.name,
      p.name_es,
      p.description || null,
      p.description_es || null,
      p.types,
      p.generation,
      JSON.stringify(p.stats),
      p.sprite || null,
      p.height || null,
      p.weight || null,
      embedding_string
    );
  }

  // ── 2. Insert Evolution Edges (only for existing Pokémons) ───────────────
  const inserted_pokemon_ids = await prisma.pokemon.findMany({ select: { id: true } });
  const id_set = new Set(inserted_pokemon_ids.map((p) => p.id));

  const valid_edges = evolution_edges.filter(
    (edge: any) => id_set.has(edge.from_pokemon_id) && id_set.has(edge.to_pokemon_id)
  );

  console.log(
    `De ${evolution_edges.length} aristas totales, se insertarán ${valid_edges.length} (IDs válidos)`
  );

  if (valid_edges.length > 0) {
    await prisma.evolutionEdge.createMany({
      data: valid_edges.map((edge: any) => ({
        fromPokemonId: edge.from_pokemon_id,
        toPokemonId: edge.to_pokemon_id,
        trigger: edge.trigger,
        minLevel: edge.min_level || null,
        itemName: edge.item_name || null,
      })),
    });
  }

  // ── 3. Insert Search Templates (completos) ───────────────────────────────
  console.log(`Inserting ${templates.length} search templates...`);
  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    const embedding = template_vectors[i] ?? null;
    const embedding_string = embedding ? `[${embedding.join(",")}]` : null;

    await prisma.$executeRawUnsafe(
      `INSERT INTO search_templates (id, query_text, category, embedding)
       VALUES ($1, $2, $3, $4::vector)`,
      i + 1,
      t.query_text,
      t.category || null,
      embedding_string
    );
  }

  // ── 4. Insert TemplateWords (keywords con embedding) ─────────────────────
  if (template_keywords_vectors.length > 0) {
    console.log(`Inserting template keywords...`);
    for (const kw_item of template_keywords_vectors) {
      const template_id = kw_item.template_index + 1;
      const keywords = kw_item.keywords;
      const embeddings = kw_item.embeddings;

      if (keywords.length !== embeddings.length) {
        console.warn(`Template ${template_id}: keywords length mismatch, skipping.`);
        continue;
      }

      for (let j = 0; j < keywords.length; j++) {
        const word = keywords[j];
        const emb_vec = embeddings[j];
        if (!emb_vec) continue;
        const emb_string = `[${emb_vec.join(",")}]`;
        await prisma.$executeRawUnsafe(
          `INSERT INTO template_words (template_id, word, embedding)
           VALUES ($1, $2, $3::vector)
           ON CONFLICT (template_id, word) DO UPDATE SET embedding = EXCLUDED.embedding`,
          template_id,
          word,
          emb_string
        );
      }
    }
    console.log(`Inserted/updated keywords for ${template_keywords_vectors.length} templates.`);
  } else {
    console.log("No keyword vectors provided. Skipping template_words insertion.");
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });