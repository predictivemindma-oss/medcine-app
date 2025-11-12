import connectDB from "../../../lib/mongoose";
import Contact from "../../../models/contact";
import { NextResponse } from "next/server";


export async function PUT(request) {
  try {
    await connectDB();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    const updatedContact = await Contact.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedContact) {
      return NextResponse.json({ message: "Contact non trouvé" }, { status: 404 });
    }

    return NextResponse.json(updatedContact, { status: 200 });
  } catch (err) {
    console.error("Erreur PUT /api/contacts:", err);
    return NextResponse.json(
      { message: "Erreur serveur", error: err.message },
      { status: 500 }
    );
  }
}
