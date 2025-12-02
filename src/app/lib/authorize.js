// app/lib/authorize.js
import jwt from "jsonwebtoken";
import User from "@/app/models/User";
import dbConnect from "@/app/lib/mongoose";

export async function authorize(req, requiredRole = null) {
  await dbConnect();

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/token=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return { authorized: false, status: 401, message: "Non authentifié" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return { authorized: false, status: 404, message: "Utilisateur non trouvé" };
    }

    if (requiredRole && user.role !== requiredRole) {
      return { authorized: false, status: 403, message: "Accès refusé" };
    }

    return { authorized: true, user };
  } catch (err) {
    return { authorized: false, status: 401, message: "Token invalide" };
  }
}
