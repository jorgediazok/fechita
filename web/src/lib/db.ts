import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  // Se lee acá y no a nivel de módulo para que los tests puedan setear MONGODB_URI
  // (mongodb-memory-server) antes de la primera conexión.
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      // Serverless: cada lambda abre su propio pool. Uno chico evita agotar el límite de
      // conexiones de Atlas (bajo en M0) cuando hay varias lambdas vivas a la vez.
      maxPoolSize: 5,
      minPoolSize: 0,
      // Fallar rápido si el cluster no responde, en vez de colgar la request 30 s.
      serverSelectionTimeoutMS: 8000,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
