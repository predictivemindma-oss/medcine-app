import dbConnect from "@/app/lib/mongoose";
import User from "@/app/models/User";
import bcrypt from "bcrypt";  // au lieu de "bcryptjs"
export async function GET() {
  await dbConnect();

  try {
    // Méthode SIMPLE et DIRECTE
    const plainPassword = "safaaeaudnydb@uzq&12";
    console.log("🔑 Password clair:", plainPassword);
    
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log("📋 Hash généré:", hashedPassword);
    
    // Test IMMÉDIAT
    const test = await bcrypt.compare(plainPassword, hashedPassword);
    console.log("✅ Test immédiat:", test);
    
    if (!test) {
      throw new Error("BCRYPT NE FONCTIONNE PAS");
    }

    // Créer l'utilisateur
    const user = new User({
      email: "doctor@example.com",
      password: hashedPassword,
      role: "doctor",
    });

    await user.save();
    
    // Test FINAL
    const userFromDb = await User.findOne({ email: "doctor@example.com" });
    const finalTest = await bcrypt.compare(plainPassword, userFromDb.password);
    console.log("🎯 Test final avec DB:", finalTest);

    return Response.json({
      success: true,
      testImmediate: test,
      testFinal: finalTest,
      hash: hashedPassword,
      message: finalTest ? "✅ PRÊT POUR LOGIN" : "❌ PROBLEME BCRYPT"
    });

  } catch (error) {
    console.error("💥 ERREUR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}