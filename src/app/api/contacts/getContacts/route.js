import connectDB from "../../../lib/mongoose";
import Contact from "../../../models/contact";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
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