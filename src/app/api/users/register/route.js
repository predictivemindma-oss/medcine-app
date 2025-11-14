import bcrypt from "bcryptjs";
import connectionToDatabase from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectionToDatabase();
    const { name, email, password, role } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    return new Response("User created", { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Error creating user", { status: 500 });
  }
}