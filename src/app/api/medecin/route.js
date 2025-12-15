import { NextResponse } from "next/server";
import connectDB from "../../lib/mongoose";
import Medcin from "../../models/medcin";
import { authorize } from "@/app/lib/authorize";
import { translateToArabic } from "@/app/lib/translate";

export async function POST(req) {
  const auth = await authorize(req, "doctor");
  if (!auth.authorized) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    await connectDB();
    const updates = await req.json();
    let medecin = await Medcin.findOne({}) || new Medcin({});

    // Gestion suppression
    if (updates.delete && updates.field && updates.value !== undefined) {
      medecin = await Medcin.findOneAndUpdate(
        {},
        { $pull: { [updates.field]: updates.value, [`${updates.field}_ar`]: updates.value } },
        { new: true }
      );
      return NextResponse.json(medecin);
    }

    const lang = updates.lang || "fr";
    const updateDoc = {};

    // Champs simples
    const simpleFields = ["introduction", "specialite", "telephone", "fixe", "localisation"];
    for (const field of simpleFields) {
      if (lang === "fr" && updates[field] !== undefined) {
        updateDoc[field] = updates[field];
        updateDoc[`${field}_ar`] = await translateToArabic(updates[field]);
      } else if (lang === "ar" && updates[`${field}_ar`] !== undefined) {
        updateDoc[`${field}_ar`] = updates[`${field}_ar`];
      }
    }

    // Champs tableaux - SOLUTION SIMPLIFIÉE
    const arrayFields = ["experiences", "formations"];
    
    for (const field of arrayFields) {
      // CAS 1: Mise à jour FR complète
      if (lang === "fr" && updates[field] && Array.isArray(updates[field])) {
        updateDoc[field] = updates[field];
        updateDoc[`${field}_ar`] = await Promise.all(
          updates[field].map(item => translateToArabic(item))
        );
      }
      // CAS 2: MODIFICATION D'UNE SEULE LIGNE AR
      else if (updates.editArabicLine) {
        // Quand on veut éditer seulement une ligne arabe
        if (field === updates.editArabicLine.field) {
          const currentArArray = medecin[`${field}_ar`] || [];
          const updatedArArray = [...currentArArray]; // Copie
          
          // Remplacer seulement la ligne spécifique
          updatedArArray[updates.editArabicLine.index] = updates.editArabicLine.value;
          
          updateDoc[`${field}_ar`] = updatedArArray;
          // Garder le FR inchangé
          updateDoc[field] = medecin[field];
        }
      }
      // CAS 3: Mise à jour AR complète (optionnel)
      else if (lang === "ar" && updates[`${field}_ar`] && Array.isArray(updates[`${field}_ar`])) {
        updateDoc[`${field}_ar`] = updates[`${field}_ar`];
        updateDoc[field] = medecin[field]; // Garder FR
      }
    }

    // Appliquer les mises à jour
    medecin = await Medcin.findOneAndUpdate({}, updateDoc, { new: true, upsert: true });
    return NextResponse.json(medecin);

  } catch (err) {
    console.error("Erreur POST /api/medecin :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "fr";
    
    const medecin = await Medcin.findOne();
    if (!medecin) return NextResponse.json({});

    const response = {
      introduction: lang === "ar" ? medecin.introduction_ar : medecin.introduction,
      experiences: lang === "ar" ? medecin.experiences_ar : medecin.experiences,
      formations: lang === "ar" ? medecin.formations_ar : medecin.formations,
      telephone: medecin.telephone,
      fixe: medecin.fixe,
      localisation: lang === "ar" ? medecin.localisation_ar : medecin.localisation,
      image: medecin.image,
      specialite: lang === "ar" ? medecin.specialite_ar : medecin.specialite
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Erreur GET /api/medecin :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}