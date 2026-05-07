/**
 * Free local embedding generator using hashing trick + L2 normalization.
 * This avoids paid embedding APIs and still enables vector similarity search.
 */

const EMBEDDING_DIM = 384;

function stableHash(token: string): number {
    let hash = 0;
    for (let i = 0; i < token.length; i += 1) {
        hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    return hash;
}

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 1);
}

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
        return new Array(EMBEDDING_DIM).fill(0);
    }

    const vector = new Array(EMBEDDING_DIM).fill(0);
    const tokens = tokenize(text);

    for (const token of tokens) {
        const index = stableHash(token) % EMBEDDING_DIM;
        vector[index] += 1;
    }

    // L2 normalize so cosine similarity behaves predictably.
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    if (norm === 0) {
        return vector;
    }

    return vector.map((value) => value / norm);
}

