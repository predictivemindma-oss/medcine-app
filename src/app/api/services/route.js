import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // Import mongoose directement
import dbConnect from "@/app/lib/mongoose";
import User from "../../models/User";
import { translateToArabic } from "@/app/lib/translate";

function verifyToken(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/token=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) throw new Error("Non authentifié");
  return jwt.verify(token, process.env.JWT_SECRET);
}

async function translateToArabicGuaranteed(text) {
  try {
    if (!text || text.trim() === "") return text;
    const translated = await translateToArabic(text);
    return translated || text;
  } catch (error) {
    console.log("Traduction échouée:", error.message);
    return text + " (عربي)";
  }
}

// ======================================================
// POST - VERSION GARANTIE
// ======================================================
export async function POST(req) {
  try {
    await dbConnect();
    
    console.log("🚀 DÉBUT POST Service");
    
    // Auth
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "doctor") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Lire les données
    const formData = await req.formData();
    const title = formData.get("title") || "";
    const desc = formData.get("desc") || "";
    const file = formData.get("image");

    // Validation
    if (!title || !desc || !file) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Upload image
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = Date.now() + "-" + file.name.replace(/\s+/g, '_');
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    const imageUrl = "/uploads/" + fileName;

    // Traduction FORCÉE
    console.log("🔤 Traduction...");
    const title_ar = await translateToArabicGuaranteed(title);
    const desc_ar = await translateToArabicGuaranteed(desc);
    
    console.log("✅ Traductions obtenues:");
    console.log("- title_ar:", title_ar.substring(0, 50));
    console.log("- desc_ar:", desc_ar.substring(0, 50));

    // ==============================================
    // MÉTHODE 1: Insertion DIRECTE dans MongoDB
    // ==============================================
    const db = mongoose.connection.db;
    const serviceData = {
      title: title.trim(),
      title_ar: title_ar.trim(),
      desc: desc.trim(),
      desc_ar: desc_ar.trim(),
      image: imageUrl,
      doctor: user._id,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("💾 Insertion directe dans MongoDB:");
    console.log(JSON.stringify(serviceData, null, 2));

    // Insertion directe (contourne Mongoose)
    const result = await db.collection('services').insertOne(serviceData);
    
    // Récupérer le document inséré
    const insertedDoc = await db.collection('services').findOne({ 
      _id: result.insertedId 
    });

    console.log("🎉 Service créé avec succès!");
    console.log("ID:", insertedDoc._id);
    console.log("Champs créés:", Object.keys(insertedDoc));

    return NextResponse.json(
      { 
        message: "Service créé avec traduction",
        service: insertedDoc,
        method: "direct-mongodb-insertion"
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("❌ Erreur POST grave:", err);
    console.error("Stack:", err.stack);
    return NextResponse.json(
      { error: "Erreur serveur: " + err.message },
      { status: 500 }
    );
  }
}

// ======================================================
// PUT 
// ======================================================
export async function PUT(req) {
  try {
    await dbConnect();
    
    // Authentification
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "doctor") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // ID depuis URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID invalide ou manquant" }, { status: 400 });
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const db = mongoose.connection.db;
    const existingService = await db.collection('services').findOne({ _id: objectId });
    
    if (!existingService) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get("title")?.toString().trim() || null;
    const desc = formData.get("desc")?.toString().trim() || null;
    const file = formData.get("image");
    const lang = formData.get("lang")?.toString() || "fr"; // Langue d'édition

    const updateData = {
      updatedAt: new Date()
    };

    // 🔥 Mise à jour selon la langue - LOGIQUE AMÉLIORÉE
    if (lang === "fr") {
      // Mode français : on modifie français et on traduit automatiquement vers arabe
      if (title !== null) {
        updateData.title = title;
        // Traduction automatique FR → AR
        updateData.title_ar = await translateToArabicGuaranteed(title);
      }
      
      if (desc !== null) {
        updateData.desc = desc;
        // Traduction automatique FR → AR
        updateData.desc_ar = await translateToArabicGuaranteed(desc);
      }
      
    } else if (lang === "ar") {
      // Mode arabe : on modifie uniquement les champs arabes
      // Les champs français restent inchangés !
      if (title !== null) {
        updateData.title_ar = title;
        // NE PAS toucher à updateData.title - on garde le français existant
      }
      
      if (desc !== null) {
        updateData.desc_ar = desc;
        // NE PAS toucher à updateData.desc - on garde le français existant
      }
    }

    // Gestion de l'image (commune aux deux langues)
    if (file && file.size > 0) {
      // Validation du type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Format d'image non supporté" }, 
          { status: 400 }
        );
      }

      // Validation de la taille (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "L'image ne doit pas dépasser 5MB" }, 
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Générer un nom de fichier sécurisé
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${random}-${sanitizedName}`;
      
      const uploadDir = path.join(process.cwd(), "public/uploads");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, fileName);
      
      try {
        fs.writeFileSync(filePath, buffer);
        updateData.image = "/uploads/" + fileName;

        // Supprimer l'ancienne image si elle existe
        if (existingService.image && existingService.image !== "/uploads/default-service.jpg") {
          const oldPath = path.join(process.cwd(), "public", existingService.image);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      } catch (fileError) {
        console.error("Erreur écriture fichier:", fileError);
        return NextResponse.json(
          { error: "Erreur lors du téléchargement de l'image" },
          { status: 500 }
        );
      }
    }

    // Vérifier s'il y a des modifications (au-delà de updatedAt)
    const hasChanges = Object.keys(updateData).length > 1 || 
                      (updateData.image !== undefined);

    if (hasChanges) {
      const result = await db.collection('services').updateOne(
        { _id: objectId },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ 
          message: "Aucune modification détectée",
          service: existingService,
          lang: lang
        });
      }

      const updatedService = await db.collection('services').findOne({ _id: objectId });

      return NextResponse.json({
        message: lang === "fr" 
          ? "Service mis à jour avec traduction automatique" 
          : "Version arabe mise à jour (français inchangé)",
        service: updatedService,
        lang: lang,
        method: "direct-mongodb-update"
      });
    } else {
      return NextResponse.json({ 
        message: "Aucune donnée à mettre à jour",
        service: existingService,
        lang: lang
      });
    }

  } catch (err) {
    console.error("❌ Erreur PUT:", err);
    return NextResponse.json(
      { error: "Erreur serveur: " + (err.message || "Erreur inconnue") },
      { status: 500 }
    );
  }
}


// ======================================================
// PATCH RAPIDE pour ajouter _ar aux anciens services
// ======================================================
export async function PATCH(req) {
  try {
    await dbConnect();
    
    const db = mongoose.connection.db;
    
    // Récupérer tous les services sans champs _ar
    const services = await db.collection('services').find({
      $or: [
        { title_ar: { $exists: false } },
        { title_ar: null },
        { title_ar: "" }
      ]
    }).toArray();

    console.log(`🔧 ${services.length} services à mettre à jour`);

    let updatedCount = 0;
    
    for (const service of services) {
      try {
        const title_ar = await translateToArabicGuaranteed(service.title);
        const desc_ar = service.desc ? await translateToArabicGuaranteed(service.desc) : "";
        
        await db.collection('services').updateOne(
          { _id: service._id },
          { 
            $set: { 
              title_ar,
              desc_ar,
              updatedAt: new Date()
            } 
          }
        );
        
        updatedCount++;
        console.log(`✅ ${service.title} → ${title_ar.substring(0, 30)}`);
      } catch (error) {
        console.log(`⚠️ Erreur pour ${service.title}:`, error.message);
      }
    }
    
    return NextResponse.json({
      message: `${updatedCount} services mis à jour avec champs _ar`,
      total: services.length,
      updated: updatedCount
    });

  } catch (err) {
    console.error("❌ Erreur PATCH:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ======================================================
// GET
// ======================================================
export async function GET(req) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "fr";
    
    const db = mongoose.connection.db;
    const services = await db.collection('services')
      .find({})
      .sort({ order: 1 })
      .toArray();
    
    const formattedServices = services.map(service => ({
      _id: service._id,
      title: lang === "ar" ? (service.title_ar || service.title) : service.title,
      desc: lang === "ar" ? (service.desc_ar || service.desc) : service.desc,
      image: service.image,
      order: service.order || 0,
      // Debug info
      hasTitleAr: service.title_ar !== undefined,
      hasDescAr: service.desc_ar !== undefined,
      title_ar: service.title_ar,
      desc_ar: service.desc_ar
    }));

    return NextResponse.json({ 
      services: formattedServices,
      total: services.length,
      method: "direct-mongodb-fetch"
    });

  } catch (err) {
    console.error("❌ Erreur GET:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ======================================================
// DELETE
// ======================================================
export async function DELETE(req) {
  try {
    await dbConnect();
    
    const decoded = verifyToken(req);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "doctor") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const db = mongoose.connection.db;
    const objectId = new mongoose.Types.ObjectId(id);
    
    // Récupérer le service pour supprimer l'image
    const service = await db.collection('services').findOne({ _id: objectId });
    
    if (service && service.image) {
      const imagePath = path.join(process.cwd(), "public", service.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await db.collection('services').deleteOne({ _id: objectId });

    return NextResponse.json({ 
      message: "Service supprimé",
      method: "direct-mongodb-delete"
    });

  } catch (err) {
    console.error("❌ Erreur DELETE:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}