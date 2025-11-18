// src/app/api/auth/verifyToken.js
import { jwtVerify } from "jose";

export async function verifyToken(token) {
  if (!token) throw new Error("Token manquant");

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload; // contient id, role, etc.
  } catch (err) {
    throw new Error("Token invalide");
  }
}
