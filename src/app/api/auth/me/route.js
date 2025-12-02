import jwt from "jsonwebtoken";
import dbConnect from "@/app/lib/mongoose";
import User from "@/app/models/User";

export async function GET(req) {
  await dbConnect();

  try {
    // Récupérer le cookie depuis les headers
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return new Response(JSON.stringify({ message: "Non authentifié" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return new Response(JSON.stringify({ message: "Utilisateur non trouvé" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Authentifié",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Erreur vérification token:", err);
    return new Response(JSON.stringify({ message: "Token invalide" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
