import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const dataPath = path.join(__dirname, "seed-data.json");
  const fileContent = fs.readFileSync(dataPath, "utf8");
  const data = JSON.parse(fileContent);

  console.log("Seeding database...");

  // Enable extensions in case migrations haven't run them yet
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS unaccent;`);

  // Clean existing data in reverse order of dependencies
  console.log("Cleaning existing database records...");
  await prisma.evolutionEdge.deleteMany();
  await prisma.pokemon.deleteMany();
  await prisma.searchTemplate.deleteMany();


  // 1. Insert Pokemons
  console.log(`Inserting ${data.pokemons.length} pokemons...`);
  for (const p of data.pokemons) {
    const embedding = p.embedding;
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

  // 2. Insert Evolution Edges
  console.log(`Inserting ${data.evolutionEdges.length} evolution edges...`);
  await prisma.evolutionEdge.createMany({
    data: data.evolutionEdges.map((edge: any) => ({
      fromPokemonId: edge.fromPokemonId,
      toPokemonId: edge.toPokemonId,
      trigger: edge.trigger,
      minLevel: edge.minLevel || null,
      itemName: edge.itemName || null,
    })),
  });

  // 3. Insert Search Templates
  console.log(`Inserting ${data.searchTemplates.length} search templates...`);
  for (let i = 0; i < data.searchTemplates.length; i++) {
    const t = data.searchTemplates[i];
    const types: string[] = [];
    if (t.queryText.includes("eléctrico") || t.queryText.includes("trueno")) types.push("electric");
    if (t.queryText.includes("fuego")) types.push("fire");
    if (t.queryText.includes("agua")) types.push("water");
    if (t.queryText.includes("planta") || t.queryText.includes("flor")) types.push("grass");

    const embedding = t.embedding;
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
