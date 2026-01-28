export const runtime = "nodejs";

import dbConnect from "@/app/lib/mongoose";
import User from "@/app/models/User";
import bcrypt from "bcrypt";

export async function POST(req) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { message: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    return Response.json(
      { message: "Mot de passe réinitialisé avec succès ✅" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return Response.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
