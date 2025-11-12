import fs from "fs";
import path from "path";
import connectDB from "@/lib/mongoose";
import Medecin from "@/models/medcin";

export const POST = async (req) => {
  try {
    await connectDB();

    const data = await req.formData();
    const file = data.get("image");

    if (!file) return new Response("No file", { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = Date.now() + "-" + file.name;
    const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

    fs.writeFileSync(uploadPath, buffer);

    // Mettre à jour l'image dans MongoDB
    const medecin = await Medecin.findOneAndUpdate(
      {}, // si tu n’as qu’un seul médecin
      { image: `/uploads/${fileName}` },
      { new: true, upsert: true }
    );

    return new Response(JSON.stringify({ url: medecin.image }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response("Erreur upload", { status: 500 });
  }
};
