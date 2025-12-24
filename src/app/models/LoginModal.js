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
  const router = useRouter();
  const formRef = useRef(null);
  const { t } = useTranslation();


  // Reset complet du formulaire à chaque ouverture
  useEffect(() => {
    setEmail("");
    setPassword("");
    setLoading(false);
    
    // Empêche le scroll
    document.body.style.overflow = 'hidden';
    
    // Force un reflow pour éviter les bugs de cache CSS
    if (formRef.current) {
      formRef.current.style.display = 'none';
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.style.display = 'flex';
        }
      }, 0);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
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
        console.log("Erreur API:", data);
        return alert(data.message || "Erreur de connexion");
      }

      // Reset avant de fermer
      setEmail("");
      setPassword("");
      setLoading(false);
      
      // Ferme le modal
      closeModal();
      
      // Navigation après fermeture
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
      console.error("Erreur serveur:", err);
      alert("Erreur serveur, veuillez réessayer.");
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setLoading(false);
    closeModal();
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === 'login-modal-overlay') {
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
            <input 
              type="password" 
              id="login-password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required 
            />
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