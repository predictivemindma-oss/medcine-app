import connectDB from "../../../../lib/mongoose";
import Contact from "../../../models/contact";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const { id } = await request.json();
    await connectDB();

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { terminated: true },
      { new: true }
    );

    if (!updatedContact) {
      return NextResponse.json({ message: "Contact non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, contact: updatedContact }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
