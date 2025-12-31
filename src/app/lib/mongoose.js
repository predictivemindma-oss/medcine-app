// src/app/lib/mongoose.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  // 🔁 Déjà connecté
  if (cached.conn) {
    return cached.conn;
  }

  // ❌ Runtime ONLY – si absent → vraie erreur
  if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI est manquante au runtime");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connecté");
  return cached.conn;
}
