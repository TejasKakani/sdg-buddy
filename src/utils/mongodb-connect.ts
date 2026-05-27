import mongoose from "mongoose";
import { env } from "@/utils/env";

type ConnectionObject = {
    isConnected?: number;
};

const connection: ConnectionObject = {};

export async function connectToDatabase(): Promise<void>{
    if (connection.isConnected) {
        return;
    }
    try{
        const db = await mongoose.connect(env.MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
            waitQueueTimeoutMS: 10000,
        });
        connection.isConnected = db.connections[0].readyState;
    }
    catch (error){
        connection.isConnected = 0;
        throw new Error(
            `Database connection failed: ${error instanceof Error ? error.message : "unknown error"}`
        );
    }
}
