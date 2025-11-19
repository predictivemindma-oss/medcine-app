import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import connectDB from "./lib/mongoose.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

async function createAssistantUser() {
  await connectDB();

  try {
    // Supprime l'ancien assistant si existant
    await User.deleteOne({ email: "assistant@example.com" });
    console.log("🗑️ Ancien assistant supprimé");

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash("motdepasseAssistant123!", 12);

    // Création du nouvel utilisateur assistant
    const user = new User({
      email: "assistant@example.com",
      password: hashedPassword,
      role: "assistant",
    });

    await user.save();
    console.log("✅ Nouvel utilisateur assistant créé !");
    console.log("Hash:", user.password);
    console.log("Role:", user.role);

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

createAssistantUser();
