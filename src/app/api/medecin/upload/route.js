// src/app/api/medecin/upload/route.js
import cloudinary from "cloudinary";
import connectDB from "../../../lib/mongoose";
import Medecin from "../../../models/medcin";
import { authorize } from "@/app/lib/authorize";

// Configuration Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (req) => {
  // ✅ Vérification autorisation doctor
  const auth = await authorize(req, "doctor");
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ message: auth.message || "Accès non autorisé" }),
      {
        status: auth.status || 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    await connectDB();

    const data = await req.formData();
    const file = data.get("image");

    if (!file) {
      return new Response(
        JSON.stringify({ message: "Aucun fichier image envoyé" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Vérification du type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          message: "Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ message: "Fichier trop volumineux (max 5MB)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convertir le fichier en buffer puis en base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64Image}`;

    console.log("📤 Upload vers Cloudinary en cours...");

    // Upload sur Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(dataURI, {
      folder: "medical-app/medecins",
      public_id: `medecin_${Date.now()}`,
      resource_type: "image",
      crop: "limit",
      width: 2000,
      height: 2000,
      quality: "auto:good",
      fetch_format: "auto",
    });

    const imageUrl = uploadResult.secure_url;
    console.log("✅ Image uploadée sur Cloudinary:", imageUrl);

    // Mise à jour du médecin dans la DB
    const medecin = await Medecin.findOneAndUpdate(
      {}, // si tu n’as qu’un seul médecin
      { image: imageUrl },
      { new: true, upsert: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        url: medecin.image,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Erreur upload vers Cloudinary :", err);
    let errorMessage = "Erreur lors de l'upload de l'image";
    if (err.message.includes("timeout")) {
      errorMessage = "Timeout lors de l'upload. Veuillez réessayer.";
    } else if (err.message.includes("Invalid")) {
      errorMessage = "Format d'image invalide";
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
