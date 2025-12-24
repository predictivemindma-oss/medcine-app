// app/api/contacts/bulkUpdatePresence/route.js
import connectDB from "../../../lib/mongoose";
import Contact from "../../../models/contact";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function PUT(request) {
  try {
    // ✅ Vérification d'authentification
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      if (!["doctor", "assistant"].includes(payload.role)) {
        return NextResponse.json(
          { message: "Accès refusé : réservé aux docteurs et assistants" },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json({ message: "Token invalide" }, { status: 401 });
    }

    await connectDB();

    const { updates } = await request.json();
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { message: "Données invalides : updates requis" },
        { status: 400 }
      );
    }

    // Boucle pour appliquer les mises à jour
    const bulkOps = updates.map(({ id, presence }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { presence } },
      },
    }));

    if (bulkOps.length > 0) {
      await Contact.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, message: "Présences mises à jour avec succès !" });
  } catch (err) {
    console.error("Erreur bulkUpdatePresence:", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur", error: err.message },
      { status: 500 }
    );
  }
}
