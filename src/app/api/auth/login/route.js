export const runtime = "nodejs";

import dbConnect from "@/app/lib/mongoose";
import User from "@/app/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export async function POST(req) {
  console.log('🔵 Début de la requête POST /api/auth/login');

  await dbConnect();

  try {
    const { email, password } = await req.json();
    console.log('📧 Email reçu:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return Response.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log('❌ Mot de passe incorrect');
      return Response.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    console.log('✅ Authentification réussie - Création du token');
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const serialized = cookie.serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/"
    });

    console.log('🍪 Cookie créé:', serialized);

    return new Response(
      JSON.stringify({
        message: "Connexion réussie ✅",
        user: { id: user._id, email: user.email, role: user.role }
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": serialized,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (err) {
    console.error("💥 Erreur:", err);
    return Response.json({ message: "Erreur serveur" }, { status: 500 });
  }
}