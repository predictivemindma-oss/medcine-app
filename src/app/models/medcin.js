import mongoose from "mongoose";

const MedecinSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  specialite: { type: String, required: true },
  telephone: { type: String },
  fixe: { type: String },
  localisation: { type: String },
  introduction: { type: String },
  experiences: [{ type: String }],
  formations: [{ type: String }],
  image: { type: String, default: "/doc.jpg" },
});

// Nom du modèle : Medcin
export default mongoose.models.Medcin || mongoose.model("Medcin", MedecinSchema);
