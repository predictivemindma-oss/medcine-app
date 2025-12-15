import mongoose from "mongoose";

const MedecinSchema = new mongoose.Schema({
  nom: { type: String, required: true },
 // Spécialité FR et AR
  specialite: { type: String, required: true },
  specialite_ar: { type: String },

  telephone: { type: String },
  fixe: { type: String },

  // Localisation FR et AR
  localisation: { type: String },
  localisation_ar: { type: String },


  // Texte FR original
  introduction: { type: String },

  // Traduction arabe automatique
  introduction_ar: { type: String },

  // Tableaux FR
  experiences: [{ type: String }],
  formations: [{ type: String }],

  // Tableaux AR correspondants
  experiences_ar: [{ type: String }],
  formations_ar: [{ type: String }],

  image: { type: String, default: "/doc.jpg" },
});

// Nom du modèle : Medcin
export default mongoose.models.Medcin || mongoose.model("Medcin", MedecinSchema);
