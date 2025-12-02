// app/api/auth/logout/route.js
import cookie from "cookie";

export async function POST(req) {
  try {
    // Supprimer le cookie en le remplaçant par un cookie expiré
    const serialized = cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: -1, // Expire immédiatement
      path: "/"
    });

    return new Response(
      JSON.stringify({ message: "Déconnexion réussie" }),
      {
        status: 200,
        headers: {
          "Set-Cookie": serialized,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    console.error("Erreur logout:", err);
    return Response.json(
      { message: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}