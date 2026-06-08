import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../client.ts";

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
  const evolutionEdges = readJson<any[]>("evolutionEdges.json");
  const templates = readJson<any[]>("templates.json"); // Ahora contiene campo "keywords"

  // Vector files are optional (seeding without embeddings is allowed)
  const pokemonVectors: (number[] | null)[] = fs.existsSync(path.join(__dirname, "pokemon.vectors.json"))
    ? readJson<number[][]>("pokemon.vectors.json")
    : [];

  const templateVectors: (number[] | null)[] = fs.existsSync(path.join(__dirname, "templates.vectors.json"))
    ? readJson<number[][]>("templates.vectors.json")
    : [];

  let templateKeywordsVectors: any[] = [];
  const keywordsPath = path.join(__dirname, "templates.keywords.vectors.json");
  if (fs.existsSync(keywordsPath)) {
    try {
      templateKeywordsVectors = JSON.parse(fs.readFileSync(keywordsPath, "utf8"));
      console.log(`✅ Cargado keywords desde ${keywordsPath}`);
    } catch (err) {
      console.error(`❌ Error al parsear ${keywordsPath}:`, err);
    }
  } else {
    console.log(`ℹ️  No se encontró ${keywordsPath}, omitiendo keywords.`);
  }

  console.log("Seeding database...");

  // ── Clean existing data (reverse dependency order) ───────────────────────
  console.log("Cleaning existing database records...");
  await prisma.templateWord.deleteMany();     // <--- nuevo
  await prisma.evolutionEdge.deleteMany();
  await prisma.pokemon.deleteMany();
  await prisma.searchTemplate.deleteMany();

  // ── 1. Insert Pokémons ───────────────────────────────────────────────────
  console.log(`Inserting ${pokemons.length} pokemons...`);
  for (let i = 0; i < pokemons.length; i++) {
    const p = pokemons[i];
    const embedding = pokemonVectors[i] ?? null;
    const embeddingString = embedding ? `[${embedding.join(",")}]` : null;

    await prisma.$executeRawUnsafe(
      `INSERT INTO pokemons (id, name, "nameEs", description, types, generation, stats, sprite, embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9::vector)`,
      p.id,
      p.name,
      p.nameEs || null,
      p.description || null,
      p.types,
      p.generation,
      JSON.stringify(p.stats),
      p.sprite || null,
      embeddingString
    );
  }

  // ── 2. Insert Evolution Edges (only for existing Pokémons) ───────────────
  const insertedPokemonIds = await prisma.pokemon.findMany({ select: { id: true } });
  const idSet = new Set(insertedPokemonIds.map((p) => p.id));

  const validEdges = evolutionEdges.filter(
    (edge: any) => idSet.has(edge.fromPokemonId) && idSet.has(edge.toPokemonId)
  );

  console.log(
    `De ${evolutionEdges.length} aristas totales, se insertarán ${validEdges.length} (IDs válidos)`
  );

  if (validEdges.length > 0) {
    await prisma.evolutionEdge.createMany({
      data: validEdges.map((edge: any) => ({
        fromPokemonId: edge.fromPokemonId,
        toPokemonId: edge.toPokemonId,
        trigger: edge.trigger,
        minLevel: edge.minLevel || null,
        itemName: edge.itemName || null,
      })),
    });
  }

  // ── 3. Insert Search Templates (completos) ───────────────────────────────
  console.log(`Inserting ${templates.length} search templates...`);
  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    const embedding = templateVectors[i] ?? null;
    const embeddingString = embedding ? `[${embedding.join(",")}]` : null;

    await prisma.$executeRawUnsafe(
      `INSERT INTO search_templates (id, query_text, category, embedding)
       VALUES ($1, $2, $3, $4::vector)`,
      i + 1,
      t.queryText,
      t.category || null,
      embeddingString
    );
  }

  // ── 4. Insert TemplateWords (keywords con embedding) ─────────────────────
  if (templateKeywordsVectors.length > 0) {
    console.log(`Inserting template keywords...`);
    for (const kwItem of templateKeywordsVectors) {
      const templateId = kwItem.template_index + 1; // porque id en BD empieza en 1
      const keywords = kwItem.keywords;
      const embeddings = kwItem.embeddings;

      if (keywords.length !== embeddings.length) {
        console.warn(`Template ${templateId}: keywords length mismatch, skipping.`);
        continue;
      }

      for (let j = 0; j < keywords.length; j++) {
        const word = keywords[j];
        const embVec = embeddings[j];
        if (!embVec) continue;
        const embString = `[${embVec.join(",")}]`;
        await prisma.$executeRawUnsafe(
          `INSERT INTO template_words ("templateId", word, embedding)
   VALUES ($1, $2, $3::vector)
   ON CONFLICT ("templateId", word) DO UPDATE SET embedding = EXCLUDED.embedding`,
          templateId,
          word,
          embString
        );
      }
    }
    console.log(`Inserted/updated keywords for ${templateKeywordsVectors.length} templates.`);
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