// Modifiez votre modèle Service pour forcer le rechargement
import mongoose from "mongoose";

// Supprimez d'abord le modèle existant du cache
delete mongoose.connection.models.Service;

const serviceSchema = new mongoose.Schema(
  {
    image: { type: String, required: false },
    title: { type: String, required: true },
    title_ar: { type: String, default: "" }, // Ajoutez default
    desc: { type: String, required: true },
    desc_ar: { type: String, default: "" }, // Ajoutez default
    order: { type: Number, required: true, default: 0 },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Ajoutez si manquant
  },
  { timestamps: true }
);

// Créez le modèle
const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
export default Service;