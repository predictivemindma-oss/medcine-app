// src/app/api/services/upload/route.js
import fs from "fs";
import path from "path";

// Connexion DB et modèle
import connectDB from "../../../lib/mongoose";
import Service from "../../../models/Service";

// Autorisation doctor
import { authorize } from "@/app/lib/authorize";

export const POST = async (req) => {
  // Vérification du rôle
  const auth = await authorize(req, "doctor");
  if (!auth.authorized) {
    return new Response(JSON.stringify({ message: auth.message }), {
      status: auth.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectDB();

    const data = await req.formData();
    const file = data.get("image");

    if (!file) {
      return new Response(JSON.stringify({ message: "Aucun fichier envoyé" }), {
        status: 400,
      });
    }

    // Convertir l’image en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Générer un nom unique
    const fileName = Date.now() + "-" + file.name;

    // Définir le chemin d’upload
    const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

    // Sauvegarder dans public/uploads
    fs.writeFileSync(uploadPath, buffer);

    // Retourner l’URL utilisable
    const imageUrl = `/uploads/${fileName}`;

    return new Response(JSON.stringify({ url: imageUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erreur upload image service :", err);
    return new Response(
      JSON.stringify({ message: "Erreur upload" }),
      { status: 500 }
    );
  }
};
