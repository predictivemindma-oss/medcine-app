import dbConnect from "@/app/lib/mongoose";
import User from "@/app/models/User";
import bcrypt from "bcrypt";  // au lieu de "bcryptjs"import jwt from "jsonwebtoken";
import jwt from "jsonwebtoken";


export async function POST(req) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    console.log('=== 🔍 DEBUG ULTIME ===');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', `"${password}"`);
    console.log('📏 Password length:', password?.length);

    // 1. Trouver l'utilisateur
    const user = await User.findOne({ email });
    console.log('👤 User trouvé:', user ? user.email : 'NULL');
    
    if (!user) {
      return Response.json({ message: "Email ou mot de passe incorrect" }, { status: 400 });
    }

    console.log('📋 Hash en DB:', user.password);
    console.log('🔑 Password fourni:', password);

    // 2. TEST CRITIQUE - Recréer le même hash pour debug
    console.log('🧪 TEST: Recréation du hash...');
    const newHash = await bcrypt.hash("12345678", 12);
    console.log('🆕 Nouveau hash:', newHash);
    console.log('🆕 Hash original:', user.password);

    // 3. TEST: Comparaison avec nouveau hash
    const testWithNewHash = await bcrypt.compare("12345678", newHash);
    console.log('✅ Test avec nouveau hash:', testWithNewHash);

    // 4. TEST: Comparaison avec hash de la DB
    const testWithDbHash = await bcrypt.compare("12345678", user.password);
    console.log('🔍 Test avec hash DB:', testWithDbHash);

    // 5. TEST: Comparaison avec le password reçu
    const actualCompare = await bcrypt.compare(password, user.password);
    console.log('🎯 Comparaison réelle:', actualCompare);

    if (!actualCompare) {
      console.log('❌ MOT DE PASSE DIFFÉRENT');
      console.log('Password reçu:', `"${password}"`);
      console.log('Password attendu:', "12345678");
      console.log('Same string?:', password === "12345678");
      
      return Response.json({ message: "Email ou mot de passe incorrect" }, { status: 400 });
    }

    // Si on arrive ici, ça marche !
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    console.log('🎉 CONNEXION RÉUSSIE !');
    return Response.json({
      token,
      user: { id: user._id, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error("💥 Erreur:", err);
    return Response.json({ message: "Erreur serveur" }, { status: 500 });
  }
}