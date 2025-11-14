import connectionToDatabase from "@/lib/mongoose";
import Contact from "../../../models/Reservation";
import { NextResponse } from "next/server";
import Reservation from "@/models/Reservation";

export async function POST(request) {
    try {
        await connectionToDatabase();
        const { prenom, nom, email, numero, service, message } = await request.json();
        const newContact = new Contact({ prenom, nom, email, numero, service, message, });
        await newContact.save();
        return NextResponse.json(newContact, { status: 201 });
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: "Failed to save CONTACT!" }, { status: 500 });
    }
}

export async function GET() {
    try{
        await connectionToDatabase();
        const reservations = await Reservation.find().sort({ createdAt: -1 }); //newest first
        return NextResponse.json(reservations, { status: 200 });
    }catch(err){
        console.log(err)
        return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
    }
}

export async function PATCH(request) {
    const { id, status } = await request.json();
    await connectionToDatabase();
    const updated = await Reservation.findByIdAndUpdate(
        id,
        { status },
        { new: true}
    );
    return NextResponse.json(updated)
}