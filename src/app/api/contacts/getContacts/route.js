import connectDB from "../../../lib/mongoose";
import Contact from "../../../models/contact";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(request) {
  try {
    // ✅ Vérification d'authentification
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    // ✅ Vérification du token et du rôle
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

    // ✅ Connexion à la DB
    await connectDB();

    // 📌 Récupérer les paramètres
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;
    const presence = searchParams.get("presence") || "tous";
    const date = searchParams.get("date") || "";

    // 📌 Construire la query (sans terminated)
    let query = {};

    // 🔹 Filtre par présence
    if (presence !== "tous") {
      query.presence = presence;
    }

    // 🔹 Filtre par date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Debug : voir la query
    console.log("Query MongoDB:", JSON.stringify(query, null, 2));
    console.log("Filtres:", { page, limit, presence, date });

    // 🔹 Pagination
    const totalContacts = await Contact.countDocuments(query);
    const skip = (page - 1) * limit;

    const contacts = await Contact.find(query)
      .sort({ contactId: 1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalContacts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

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
