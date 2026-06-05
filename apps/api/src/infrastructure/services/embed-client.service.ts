export class EmbedClientService {
  private readonly embedServerUrl: string;

  constructor() {
    this.embedServerUrl = process.env.EMBED_SERVER_URL || "http://localhost:8000";
  }

  async getEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await fetch(`${this.embedServerUrl}/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        return null;
      }

      const data: { embedding: number[] } = await response.json() as { embedding: number[] };
      return data.embedding;
    } catch (err) {
      console.warn("Embed server unreachable, falling back to text search.");
      return null;
    }
  }
}
