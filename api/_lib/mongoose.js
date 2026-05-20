// Connexion MongoDB avec mise en cache pour les Serverless Functions.
// Chaque invocation de fonction est un nouveau processus : on réutilise
// la connexion si elle existe déjà dans le module cache.

import mongoose from 'mongoose';

let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
