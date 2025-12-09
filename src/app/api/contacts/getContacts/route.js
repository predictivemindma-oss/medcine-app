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

      // Vérifier que c'est un doctor ou assistant
      if (!["doctor", "assistant"].includes(payload.role)) {
        return NextResponse.json(
          { message: "Accès refusé : réservé aux docteurs et assistants" },
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

    // 📌 Récupérer TOUS les paramètres de l'URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;
    const presence = searchParams.get("presence") || "tous";
    const date = searchParams.get("date") || "";

    // 📌 Construire la query de filtrage
    let query = { terminated: { $ne: true } };

    // 🔹 Filtre par présence
    if (presence !== "tous") {
      query.presence = presence;
    }

    // 🔹 Filtre par date (IMPORTANT: createdAt est un objet Date ISO)
    if (date) {
      // Convertir la date string "YYYY-MM-DD" en objets Date
      const startDate = new Date(date); // Ex: 2025-12-09T00:00:00.000Z
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1); // Ex: 2025-12-10T00:00:00.000Z

      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Debug: afficher la query
    console.log("Query MongoDB:", JSON.stringify(query, null, 2));
    console.log("Filtres:", { page, limit, presence, date });

    // 📌 Compter le nombre total de contacts avec les filtres
    const totalContacts = await Contact.countDocuments(query);

    // 📌 Calculer le skip (combien d'éléments sauter)
    const skip = (page - 1) * limit;

    // 📌 Récupérer les contacts paginés avec les filtres
    const contacts = await Contact.find(query)
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