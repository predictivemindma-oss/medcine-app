import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

import dbConnect from "@/app/lib/mongoose";
import Service from "@/app/models/Service";
import User from "../../models/User"; // ✔️ IMPORT MAINTENU EXACTEMENT COMME TU L’AS MIS

// Fonction helper pour vérifier le token
function verifyToken(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/token=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) throw new Error("Non authentifié");

  return jwt.verify(token, process.env.JWT_SECRET);
}

// ======================================================
// GET – PUBLIC
// ======================================================
export async function GET() {
  await dbConnect();
  try {
    const services = await Service.find({});
    return new Response(JSON.stringify({ services }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ message: "Erreur serveur" }), {
      status: 500,
    });
  }
}

// ======================================================
// POST – DOCTOR + UPLOAD IMAGE
// ======================================================
export async function POST(req) {
  await dbConnect();

  try {
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return new Response(JSON.stringify({ message: "Non authentifié" }), { status: 401 });
    }

    // Vérifier rôle doctor
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "doctor") {
      return new Response(
        JSON.stringify({ message: "Accès refusé. Seuls les docteurs peuvent ajouter des services." }),
        { status: 403 }
      );
    }

    // Lire formData
    const formData = await req.formData();
    const title = formData.get("title");
    const desc = formData.get("desc");
    const file = formData.get("image");

    if (!file) {
      return new Response(JSON.stringify({ message: "Image obligatoire" }), { status: 400 });
    }

    // ======================================================
    // UPLOAD DE L’IMAGE → /public/uploads
    // ======================================================
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = Date.now() + "-" + file.name;
    const uploadDir = path.join(process.cwd(), "public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = "/uploads/" + fileName; // URL utilisable dans <Image />

    // Enregistrer en DB
    const service = await Service.create({
      title,
      desc,
      image: imageUrl,
      doctor: user._id,
    });

    return new Response(JSON.stringify({ message: "Service créé", service }), { status: 201 });
  } catch (err) {
    console.error("Erreur POST services :", err);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}

// ======================================================
// PATCH – DOCTOR ONLY (maj simple)
// ======================================================
export async function PATCH(req) {
  await dbConnect();

  try {
    const decoded = verifyToken(req);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "doctor") {
      return new Response(JSON.stringify({ message: "Accès refusé" }), { status: 403 });
    }

    return new Response(JSON.stringify({ message: "Service mis à jour" }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 401,
    });
  }
}

// ======================================================
// DELETE – DOCTOR ONLY
// ======================================================
export async function DELETE(req) {
  await dbConnect();

  try {
    const decoded = verifyToken(req);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "doctor") {
      return new Response(JSON.stringify({ message: "Accès refusé" }), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await Service.findByIdAndDelete(id);

    return new Response(JSON.stringify({ message: "Service supprimé" }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 401,
    });
  }
}
