"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import morocco from "../../../public/assets/morocco.png";
import france from "../../../public/assets/france.png";

export default function LoginModal({ closeModal }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ AJOUT
  const router = useRouter();
  const formRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    setEmail("");
    setPassword("");
    setLoading(false);
    setShowPassword(false);

    document.body.style.overflow = "hidden";

    if (formRef.current) {
      formRef.current.style.display = "none";
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.style.display = "flex";
        }
      }, 0);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      return alert("Veuillez remplir tous les champs.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return alert(data.message || "Erreur de connexion");
      }

      setEmail("");
      setPassword("");
      setShowPassword(false);
      setLoading(false);

      closeModal();

      setTimeout(() => {
        if (data.user.role === "doctor") {
          router.push("/Medecin");
        } else if (data.user.role === "assistant") {
          router.push("/ContactList");
        } else {
          router.push("/");
        }
      }, 150);
    } catch (err) {
      setLoading(false);
      alert("Erreur serveur, veuillez réessayer.");
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setLoading(false);
    closeModal();
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === "login-modal-overlay") {
      handleClose();
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleBackdropClick}>
      <div className="login-modal-box" onClick={(e) => e.stopPropagation()}>
        <button
          className="login-close-btn"
          onClick={handleClose}
          type="button"
          aria-label="Fermer"
        >
          ×
        </button>

        <h2 className="login-title">{t("login")}</h2>

        <form onSubmit={handleLogin} ref={formRef} className="login-form">
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">
              {t("email")}
            </label>
            <input
              type="email"
              id="login-email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">
              {t("password")}
            </label>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* ✅ MOT DE PASSE OUBLIÉ */}
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <button
              type="button"
              onClick={() => router.push("/reset-password")}
              style={{
                background: "none",
                border: "none",
                color: "#0070f3",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {t("forgotPassword")}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? t("loading") : t("login")}
          </button>
        </form>
      </div>
    </div>
  );
}
