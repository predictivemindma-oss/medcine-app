"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginModal({ closeModal }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    if (!email || !password) {
      return alert("Veuillez remplir tous les champs.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        console.log("Erreur API:", data);
        return alert(data.message || "Erreur de connexion");
      }


      closeModal();

      if (data.user.role === "doctor") {
        router.push("/ContactList");
        router.push("/Medecin");
      } else if (data.user.role === "assistant") {
        router.push("/ContactList");
      } else {
        router.push("/");
      }

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
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email"
            name="email" 
            placeholder="exemple@email.com" 
            required 
          />
          
          <label htmlFor="password">Mot de passe</label>
          <input 
            type="password" 
            id="password"
            name="password" 
            placeholder="••••••••" 
            required 
          />
          
          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <button className="close-btn" onClick={closeModal}>X</button>
      </div>
    </div>
  );
}