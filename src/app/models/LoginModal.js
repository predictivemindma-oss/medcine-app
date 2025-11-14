"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginModal({ closeModal }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim(); // supprime espaces inutiles
    const password = e.target.password.value;

    if (!email || !password) {
      return alert("Veuillez remplir tous les champs.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        console.log("Erreur API:", data); // log pour debug
        return alert(data.message || "Erreur de connexion");
      }

      // Sauvegarde token et rôle
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      closeModal(); // Fermer la modale

      // Redirection selon rôle
      if (data.role === "doctor") router.push("/dashboard/doctor");
      else if (data.role === "assistant") router.push("/dashboard/assistant");
      else router.push("/"); // fallback

    } catch (err) {
      setLoading(false);
      console.error("Erreur serveur:", err);
      alert("Erreur serveur, veuillez réessayer.");
    }
  };

  return (
    <div className="login-modal">
      <div className="login-content">
        <h2>Connexion</h2>
        <form onSubmit={handleLogin}>
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Mot de passe" required />
          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <button className="close-btn" onClick={closeModal}>X</button>
      </div>
    </div>
  );
}
