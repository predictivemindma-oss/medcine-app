"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: newPassword, // ✅ CORRECTION ICI
      }),
    });

    const data = await res.json();
    setLoading(false);

    alert(data.message);

    if (res.ok) router.push("/");
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Réinitialiser le mot de passe</h2>

      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Mise à jour..." : "Réinitialiser"}
        </button>
      </form>
    </div>
  );
}
