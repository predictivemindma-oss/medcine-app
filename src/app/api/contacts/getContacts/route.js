import connectDB from "../../../lib/mongoose";
import Contact from "../../../models/contact";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(request) {
  try {
    // ✅ VÉRIFICATION D'AUTHENTIFICATION
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    // ✅ VÉRIFIER LE TOKEN ET LE RÔLE
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Vérifier que c'est un doctor
if (!["doctor", "assistant"].includes(payload.role)) {
        return NextResponse.json(
          { message: "Accès refusé : réservé aux docteurs" },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { message: "Token invalide" },
        { status: 401 }
      );
    }

    // ✅ SI AUTHENTIFIÉ, CONTINUER AVEC LA LOGIQUE NORMALE
    await connectDB();

    // 📌 Récupérer les paramètres de pagination depuis l'URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;

    // 📌 Calculer le skip (combien d'éléments sauter)
    const skip = (page - 1) * limit;

    // 📌 Compter le nombre total de contacts
    const totalContacts = await Contact.countDocuments();

    // 📌 Récupérer les contacts paginés, triés par contactId croissant
    const contacts = await Contact.find()
      .sort({ contactId: 1 })  // Tri par ID croissant
      .skip(skip)
      .limit(limit);

    // 📌 Calculer les informations de pagination
    const totalPages = Math.ceil(totalContacts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 📌 Retourner les données + métadonnées de pagination
    return NextResponse.json({
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalContacts,
        limit,
        hasNextPage,
        hasPrevPage
      }
    }, { status: 200 });

  } catch (err) {
    console.error("Erreur GET contacts:", err);
    return NextResponse.json(
      { message: "Erreur serveur", error: err.message },
      { status: 500 }
    );
  }
}