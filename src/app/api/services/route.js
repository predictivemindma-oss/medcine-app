// src/app/api/services/route.js
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/app/lib/mongoose";
import User from "../../models/User";
import { translateToArabic } from "@/app/lib/translate";

// Configuration Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// Fonction pour upload une image à Cloudinary
async function uploadToCloudinary(file) {
  try {
    // Convertir File en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convertir buffer en base64 pour Cloudinary
    const base64Image = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64Image}`;

    console.log("📤 Upload vers Cloudinary...");

    // Upload vers Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(dataURI, {
      folder: 'medical-app/services',
      public_id: `service_${Date.now()}`,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto:good' }
      ]
    });

    console.log("✅ Image uploadée sur Cloudinary:", uploadResult.secure_url);
    
    return {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    };
    
  } catch (error) {
    console.error("❌ Erreur Cloudinary:", error);
    throw new Error(`Erreur upload Cloudinary: ${error.message}`);
  }
}

// ======================================================
// POST - VERSION AVEC CLOUDINARY
// ======================================================
export async function POST(req) {
  try {
    await dbConnect();
    
    console.log("🚀 DÉBUT POST Service avec Cloudinary");
    
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
    const lang = formData.get("lang") || "fr";

    // Validation
    if (!title || !desc || !file) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Validation fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format d'image non supporté. Utilisez JPEG, PNG ou WebP." },
        { status: 400 }
      );
    }

    // Vérifier taille (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "L'image ne doit pas dépasser 5MB" },
        { status: 400 }
      );
    }

    // ✅ 1. UPLOAD À CLOUDINARY (au lieu de sauvegarder localement)
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(file);
    } catch (uploadError) {
      return NextResponse.json(
        { error: `Erreur upload image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 2. Traduction
    console.log("🔤 Traduction...");
    const title_ar = await translateToArabicGuaranteed(title);
    const desc_ar = await translateToArabicGuaranteed(desc);
    
    console.log("✅ Traductions obtenues:");

    // 3. Insertion dans MongoDB avec URL Cloudinary
    const db = mongoose.connection.db;
    const serviceData = {
      title: title.trim(),
      title_ar: title_ar.trim(),
      desc: desc.trim(),
      desc_ar: desc_ar.trim(),
      image: cloudinaryResult.url, // ✅ URL CLOUDINARY
      doctor: user._id,
      doctorName: user.name || user.email,
      language: lang,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      cloudinary_public_id: cloudinaryResult.public_id // Stocker l'ID Cloudinary
    };

    console.log("💾 Insertion dans MongoDB avec URL Cloudinary");

    // Insertion directe
    const result = await db.collection('services').insertOne(serviceData);
    
    // Récupérer le document inséré
    const insertedDoc = await db.collection('services').findOne({ 
      _id: result.insertedId 
    });

    console.log("🎉 Service créé avec Cloudinary!");

    return NextResponse.json(
      { 
        message: "Service créé avec traduction",
        service: insertedDoc,
        cloudinary: {
          url: cloudinaryResult.url,
          public_id: cloudinaryResult.public_id
        }
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("❌ Erreur POST grave:", err);
    return NextResponse.json(
      { error: "Erreur serveur: " + err.message },
      { status: 500 }
    );
  }
}

// ======================================================
// PUT - MODIFICATION AVEC CLOUDINARY
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
    const lang = formData.get("lang")?.toString() || "fr";

    const updateData = {
      updatedAt: new Date()
    };

    // Mise à jour selon la langue
    if (lang === "fr") {
      // Mode français : on modifie français et on traduit automatiquement vers arabe
      if (title !== null) {
        updateData.title = title;
        updateData.title_ar = await translateToArabicGuaranteed(title);
      }
      
      if (desc !== null) {
        updateData.desc = desc;
        updateData.desc_ar = await translateToArabicGuaranteed(desc);
      }
      
    } else if (lang === "ar") {
      // Mode arabe : on modifie uniquement les champs arabes
      if (title !== null) {
        updateData.title_ar = title;
      }
      
      if (desc !== null) {
        updateData.desc_ar = desc;
      }
    }

    // ✅ GESTION DE L'IMAGE AVEC CLOUDINARY
    if (file && file.size > 0) {
      // Validation du type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
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

      try {
        // ✅ UPLOAD DE LA NOUVELLE IMAGE À CLOUDINARY
        const cloudinaryResult = await uploadToCloudinary(file);
        
        updateData.image = cloudinaryResult.url;
        updateData.cloudinary_public_id = cloudinaryResult.public_id;

        // ✅ SUPPRIMER L'ANCIENNE IMAGE DE CLOUDINARY SI ELLE EXISTE
        if (existingService.cloudinary_public_id) {
          try {
            await cloudinary.v2.uploader.destroy(existingService.cloudinary_public_id);
            console.log("🗑️ Ancienne image supprimée de Cloudinary:", existingService.cloudinary_public_id);
          } catch (deleteError) {
            console.warn("⚠️ Impossible de supprimer l'ancienne image Cloudinary:", deleteError.message);
          }
        }
        
      } catch (uploadError) {
        console.error("Erreur upload Cloudinary:", uploadError);
        return NextResponse.json(
          { error: `Erreur lors du téléchargement de l'image: ${uploadError.message}` },
          { status: 500 }
        );
      }
    }

    // Vérifier s'il y a des modifications
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
        lang: lang
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
// GET - INCHANGÉ (juste lit depuis MongoDB)
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
      image: service.image, // ✅ URL Cloudinary
      order: service.order || 0,
      doctorName: service.doctorName,
      createdAt: service.createdAt,
      hasTitleAr: service.title_ar !== undefined,
      hasDescAr: service.desc_ar !== undefined,
      title_ar: service.title_ar,
      desc_ar: service.desc_ar
    }));

    return NextResponse.json({ 
      services: formattedServices,
      total: services.length
    });

  } catch (err) {
    console.error("❌ Erreur GET:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ======================================================
// DELETE - MODIFIÉ POUR SUPPRIMER DE CLOUDINARY
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
    
    // Récupérer le service pour avoir l'ID Cloudinary
    const service = await db.collection('services').findOne({ _id: objectId });
    
    if (!service) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
    }

    // ✅ SUPPRIMER L'IMAGE DE CLOUDINARY SI ELLE EXISTE
    if (service.cloudinary_public_id) {
      try {
        await cloudinary.v2.uploader.destroy(service.cloudinary_public_id);
        console.log("🗑️ Image supprimée de Cloudinary:", service.cloudinary_public_id);
      } catch (cloudinaryError) {
        console.warn("⚠️ Impossible de supprimer l'image Cloudinary:", cloudinaryError.message);
      }
    }

    // Supprimer le document MongoDB
    await db.collection('services').deleteOne({ _id: objectId });

    return NextResponse.json({ 
      message: "Service et image supprimés",
      deleted: true
    });

  } catch (err) {
    console.error("❌ Erreur DELETE:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}