// src/app/api/medecin/upload/route.js
import fs from "fs";
import path from "path";

// Chemin relatif correct vers mongoose.js et le modèle Medecin
import connectDB from "../../../lib/mongoose";
import Medecin from "../../../models/medcin";
import { authorize } from "@/app/lib/authorize";

export const POST = async (req) => {
  // Autorisation : seul le doctor peut uploader
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

    if (!file) return new Response("No file", { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = Date.now() + "-" + file.name;
    const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

    fs.writeFileSync(uploadPath, buffer);

    const medecin = await Medecin.findOneAndUpdate(
      {}, // si tu n’as qu’un seul médecin
      { image: `/uploads/${fileName}` },
      { new: true, upsert: true }
    );

    return new Response(JSON.stringify({ url: medecin.image }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erreur upload :", err);
    return new Response("Erreur upload", { status: 500 });
  }
};
