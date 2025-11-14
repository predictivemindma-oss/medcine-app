import mongoose, { Schema, models } from "mongoose";

const reservationSchema = new Schema(
  {
    prenom: { type: String, required: true },
    nom: { type: String, required: true },
    email: { type: String, required: false },
    numero: { type: String, required: true },
    service: { type: String, required: true },
    message: { type: String, required: false },
    status: { type: String, enum: ["en_attente", "confirme", "annule"], default: "en_attente" },
  },
  { timestamps: true }
);

const Reservation = models.Reservation || mongoose.model("Reservation", reservationSchema);

export default Reservation;