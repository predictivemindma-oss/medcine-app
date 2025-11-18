import { NextResponse } from "next/server";
import connectDB from "../../lib/mongoose";
import Medcin from "../../models/medcin";
import { authorize } from "@/app/lib/authorize";

export async function POST(req) {
  const auth = await authorize(req, "doctor"); // uniquement le doctor

  if (!auth.authorized) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    await connectDB();
    const updates = await req.json();
    const medecin = await Medcin.findOneAndUpdate({}, updates, { new: true, upsert: true });
    return NextResponse.json(medecin);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
export async function GET() {
  try {
    await connectDB();
    const medecin = await Medcin.findOne(); // récupère le premier médecin
    return NextResponse.json(medecin || {}); // retourne un objet vide si rien
  } catch (err) {
    console.error("Erreur GET /api/medecin :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
