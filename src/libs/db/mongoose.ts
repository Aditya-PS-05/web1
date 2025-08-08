import { Connection, connect } from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var mongooseCache: MongooseCache;
}

global.mongooseCache = global.mongooseCache || { conn: null, promise: null };

export async function connectDB(): Promise<Connection> {
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache.promise) {
    console.log("Connecting to MongoDB...");
    console.log("Connection string:", MONGO_URI!.replace(/:[^:@]+@/, ":****@")); // Hide password in logs

    global.mongooseCache.promise = connect(MONGO_URI!)
      .then((mongoose) => {
        console.log("✅ Connected to MongoDB successfully");
        console.log("Database name:", mongoose.connection.name);
        return mongoose.connection;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error.message);
        console.error("Error code:", error.code);
        console.error("Error name:", error.codeName);

        if (error.code === 8000) {
          console.error("🔑 Authentication failed. Please check:");
          console.error("  1. Username and password are correct");
          console.error("  2. IP address is whitelisted in MongoDB Atlas");
          console.error("  3. Database user has proper permissions");
        }

        throw error;
      });
  }

  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}
