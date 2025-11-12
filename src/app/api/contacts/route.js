// app/api/contact/route.js
import connectDB from "../../lib/mongoose";
import Contact from "../../models/contact";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("📨 API Contact appelée");
  
  try {
    // Connexion DB
    console.log("🔗 Connexion MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connecté");

    // Données
    const data = await request.json();
    console.log("📝 Données reçues:", data);

    const { prenom, nom, email, numero, service, message } = data;
    
    // Validation
    if (!prenom || !nom || !email) {
      return NextResponse.json(
        { 
          success: false,
          message: "Prénom, nom et email sont requis" 
        }, 
        { status: 400 }
      );
    }

    // Création du contact
    console.log("💾 Création du contact...");
    const contactData = {
      prenom: prenom.trim(),
      nom: nom.trim(),
      email: email.trim().toLowerCase(),
      ...(numero && { numero: numero.trim() }),
      ...(service && { service: service.trim() }),
      ...(message && { message: message.trim() })
    };

    const newContact = new Contact(contactData);
    await newContact.save();
    
    console.log("✅ Contact sauvegardé - ID:", newContact._id);
    console.log("✅ Contact ID auto-généré:", newContact.contactId);

    return NextResponse.json(
      { 
        success: true, 
        message: "Formulaire envoyé avec succès",
        contact: {
          id: newContact._id,
          contactId: newContact.contactId,
          prenom: newContact.prenom,
          nom: newContact.nom,
          email: newContact.email
        }
      }, 
      { status: 201 }
    );

  } catch (err) {
    console.error("❌ Erreur API Contact:", err);
    
    let errorMessage = "Erreur serveur interne";
    if (err.code === 11000) {
      errorMessage = "Erreur de duplication (contactId existe déjà)";
    }

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: err.message 
      }, 
      { status: 500 }
    );
  }
}