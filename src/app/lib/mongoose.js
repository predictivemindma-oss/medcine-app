// src/app/lib/mongoose.js
import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  const MONGODB_URI = process.env.MONGODB_URI;

  // ⚠️ IMPORTANT : NE PAS throw au build
  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI non définie (build time)");
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connecté avec succès");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ Erreur MongoDB :", error);
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
