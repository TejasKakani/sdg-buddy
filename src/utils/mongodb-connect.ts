import mongoose from "mongoose";
import { env } from "@/utils/env";

/**
 * Serverless-safe Mongoose connection.
 *
 * On Vercel each serverless invocation may run in a fresh module scope, and
 * several invocations can start concurrently during a cold start. Caching only
 * a boolean flag lets each of them call `mongoose.connect` in parallel, opening
 * redundant connection pools and exhausting the Atlas connection limit.
 *
 * The canonical fix is to cache the connection *promise* on `globalThis` so
 * concurrent callers await the same in-flight connection instead of creating
 * new ones.
 */

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
    _mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
    globalForMongoose._mongooseCache ?? { conn: null, promise: null };

globalForMongoose._mongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
    if (cache.conn && mongoose.connection.readyState === 1) {
        return cache.conn;
    }

    if (!cache.promise) {
        cache.promise = mongoose
            .connect(env.MONGODB_URI, {
                maxPoolSize: 10,
                minPoolSize: 2,
                serverSelectionTimeoutMS: 8000,
                socketTimeoutMS: 45000,
                waitQueueTimeoutMS: 10000,
                // Don't buffer model operations forever if the connection drops.
                bufferCommands: false,
            })
            .catch((error) => {
                // Reset the cached promise so the next request can retry instead
                // of permanently awaiting a rejected promise.
                cache.promise = null;
                throw new Error(
                    `Database connection failed: ${error instanceof Error ? error.message : "unknown error"}`
                );
            });
    }

    cache.conn = await cache.promise;
    return cache.conn;
}
