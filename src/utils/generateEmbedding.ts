/**
 * Embedding generator helper.
 *
 * Behavior:
 * - If `process.env.HUGGINGFACE_API_KEY` is set, use the Hugging Face InferenceClient
 *   for the model in `process.env.HUGGINGFACE_MODEL` (default
 *   `sentence-transformers/all-MiniLM-L6-v2`).
 * - Otherwise, fall back to a free local embedding implementation (same as
 *   previous hashing + L2 normalization approach).
 */

import { InferenceClient } from "@huggingface/inference";

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

async function localEmbedding(text: string): Promise<number[]> {
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

export async function generateEmbedding(text: string): Promise<number[]> {
    const hfKey = process.env.HUGGINGFACE_API_KEY;
    const hfModel = process.env.HUGGINGFACE_MODEL || "sentence-transformers/all-MiniLM-L6-v2";

    if (hfKey) {
        try {
            const client = new InferenceClient(hfKey);
            const embeddings = await client.featureExtraction({
                model: hfModel,
                inputs: text,
            });

            if (Array.isArray(embeddings) && embeddings.every((n) => typeof n === 'number')) {
                return embeddings as number[];
            }

            // If response shape is unexpected, fallback to local method
            console.warn('Unexpected Hugging Face embedding response shape, using local fallback');
            return localEmbedding(text);
        } catch (err) {
            console.error('Error calling Hugging Face embeddings API:', err);
            return localEmbedding(text);
        }
    }

    // No HF key configured, use local embedder
    return localEmbedding(text);
}

