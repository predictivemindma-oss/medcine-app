import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import connectDB from "./lib/mongoose.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";  // ✅ BCRYPT
async function createNewUser() {
  await connectDB();

  try {
    // Supprimez l'ancien utilisateur
    await User.deleteOne({ email: "doctor@example.com" });
    console.log("🗑️ Ancien utilisateur supprimé");

    // Créez un nouvel utilisateur avec cost 12
    const hashedPassword = await bcrypt.hash("safaaeaudnydb@uzq&12", 12);

    const user = new User({
      email: "doctor@example.com",
      password: hashedPassword,
      role: "doctor",
    });

    await user.save();
    console.log("✅ Nouvel utilisateur créé !");
    console.log("Hash:", user.password);
    console.log("Cost: 12");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

createNewUser();