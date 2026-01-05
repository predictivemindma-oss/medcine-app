"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaEdit, FaSave, FaTrash, FaUndo, FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LoadingOverlay from "../components/LoadingOverlay";
import "../../styles/medecin.css";

export default function Medecin() {
  const { t, i18n } = useTranslation();
  const [medecin, setMedecin] = useState(null);
  const [editingField, setEditingField] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [pendingDeletes, setPendingDeletes] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
}, [i18n.language]);
  useEffect(() => {
    const fetchMedecin = async () => {
      setLoading(true);
      const lang = i18n.language.startsWith("ar") ? "ar" : "fr";
      console.log("Langue envoyée au backend:", lang);
      const res = await fetch(`/api/medecin?lang=${lang}`, { cache: "no-store" });
      
      console.log("i18n.language:", i18n.language);
      console.log("Lang utilisé pour fetch:", lang);

      const data = await res.json();
      setMedecin(data);
      setLoading(false);
    };

    if (i18n.isInitialized) {
      fetchMedecin();
    }
  }, [i18n.language, i18n.isInitialized]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        if (data.user) setUserRole(data.user.role);
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <LoadingOverlay show={true} />;

  const startEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = async (field, index = null) => {
    if (!medecin) return;

    const lang = i18n.language.startsWith("ar") ? "ar" : "fr";

    let payload = {};

    if (index !== null) {
      if (lang === "ar") {
        payload = {
          editArabicLine: {
            field: field,
            index: index,
            value: tempValue
          }
        };
      } else {
        const updatedArray = [...(medecin[field] || [])];
        updatedArray[index] = tempValue;
        payload = {
          [field]: updatedArray,
          lang: lang
        };
      }
    } else {
      if (lang === "ar") {
        payload = {
          [`${field}_ar`]: tempValue,
          lang: lang
        };
      } else {
        payload = {
          [field]: tempValue,
          lang: lang
        };
      }
    }

    setMedecin((prev) => {
      const updated = { ...prev };
      if (index !== null) {
        const arrField = lang === "ar" ? `${field}_ar` : field;
        const arr = [...(updated[arrField] || [])];
        arr[index] = tempValue;
        updated[arrField] = arr;
      } else {
        const fieldName = lang === "ar" ? `${field}_ar` : field;
        updated[fieldName] = tempValue;
      }
      return updated;
    });

    setEditingField("");

    try {
      const res = await fetch("/api/medecin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Erreur sauvegarde côté serveur :", errText);
      } else {
        const updatedData = await res.json();
        
        const refreshedMedecin = {
          introduction: lang === "ar" ? updatedData.introduction_ar : updatedData.introduction,
          experiences: lang === "ar" ? updatedData.experiences_ar : updatedData.experiences,
          formations: lang === "ar" ? updatedData.formations_ar : updatedData.formations,
          telephone: updatedData.telephone,
          fixe: updatedData.fixe,
          localisation: lang === "ar" ? updatedData.localisation_ar : updatedData.localisation,
          image: updatedData.image,
          specialite: lang === "ar" ? updatedData.specialite_ar : updatedData.specialite
        };
        
        setMedecin(refreshedMedecin);
      }
    } catch (err) {
      console.error("Erreur fetch :", err);
    }
  };

  const handleDelete = async (field, value) => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 15000)}`;

    setMedecin((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((item) => item !== value),
    }));

    setPendingDeletes((prev) => [...prev, { id, field, value }]);

    const deleteTimeout = setTimeout(() => {
      setPendingDeletes((prev) => prev.filter((p) => p.id !== id));
    }, 5000);

    try {
      const res = await fetch("/api/medecin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete: true, field, value }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const updatedFromServer = await res.json();
      if (updatedFromServer) setMedecin(updatedFromServer);

    } catch (err) {
      console.error("Erreur suppression :", err);

      setMedecin((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), value],
      }));

      clearTimeout(deleteTimeout);
      setPendingDeletes((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const undoDelete = async (id) => {
    const pending = pendingDeletes.find((p) => p.id === id);
    if (!pending) return;

    try {
      await fetch("/api/medecin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [pending.field]: [...(medecin[pending.field] || []), pending.value],
        }),
      });

      setMedecin((prev) => ({
        ...prev,
        [pending.field]: [...(prev[pending.field] || []), pending.value],
      }));
    } catch (err) {
      console.error("Erreur restauration :", err);
    }

    setPendingDeletes((prev) => prev.filter((p) => p.id !== id));
  };

  const renderField = (field, value, multiline = false, index = null) => {
    const key = index !== null ? `${field}-${index}` : field;

    return (
      <div className="field-wrapper">
        {editingField === key ? (
          <div className="editing-container">
            {multiline ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                rows={4}
                className="edit-textarea"
              />
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="edit-input"
              />
            )}
            <button
              onClick={() => handleSave(field, index)}
              className="icon-btn save-btn"
              title={t("save") || "Sauvegarder"}
            >
              <FaSave />
            </button>
          </div>
        ) : (
          <div className="display-container">
            <span className="field-value">{value}</span>
            {userRole === "doctor" && (
              <button
                onClick={() => startEdit(key, value)}
                className="icon-btn edit-btn"
                title={t("edit") || "Modifier"}
              >
                <FaEdit />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="medecin-container">
      {/* CONTACT */}
      <div className="contact-info">
        <div className="doc-img-wrapper">
          <Image
            src={medecin.image || "/doc.jpg"}
            alt={t("doctor_name")}
            width={300}
            height={400}
            className="doc-img"
          />

          {userRole === "doctor" && (
            <>
              <button
                onClick={() => document.getElementById("imageUpload").click()}
                className="image-edit-btn"
                title={t("edit_image") || "Modifier l'image"}
              >
                <FaEdit />
              </button>
              <input
                type="file"
                id="imageUpload"
                style={{ display: "none" }}
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("image", file);

                  const res = await fetch("/api/medecin/upload", {
                    method: "POST",
                    body: formData,
                  });

                  if (res.ok) {
                    const data = await res.json();
                    setMedecin({ ...medecin, image: data.url });
                  }
                }}
              />
            </>
          )}
        </div>

        <div className="contact-text">
          <div className="speciality-field">
            <i>{t("speciality")}:</i>
            {renderField("specialite", medecin.specialite)}
          </div>

          <h3 className="contact-title">{t("contact")}</h3>

          <div className="contact-item">
            <strong>{t("phone") || "Tél"}:</strong>
            {renderField("telephone", medecin.telephone)}
          </div>

          <div className="contact-item">
            <strong>{t("fixe") || "Fixe"}:</strong>
            {renderField("fixe", medecin.fixe)}
          </div>

          <div className="contact-item-p">
            <strong>{t("address") || "Adresse"}:</strong>
            {renderField("localisation", medecin.localisation)}
          </div>

          <Link href="/Contact" className="appointment-btn">
            {t("appointment")}
          </Link>
        </div>
      </div>

      {/* INTRO */}
      <div className="intro">
        <h3>{t("doc_name")}</h3>
        <div className="intro-text">
          {renderField("introduction", medecin.introduction, true)}
        </div>

        {/* EXPÉRIENCES */}
        <div className="section">
          <div className="section-header">
            <h3>{t("experience")}</h3>
            {userRole === "doctor" && (
              <button
                onClick={() => {
                  const updatedExperiences = [...(medecin.experiences || []), ""];
                  setMedecin({ ...medecin, experiences: updatedExperiences });
                  setEditingField(`experiences-${updatedExperiences.length - 1}`);
                  setTempValue("");
                }}
                className="add-btn"
              >
                <FaPlus /> {t("add_experience")}
              </button>
            )}
          </div>

          <ul className="list-items">
            {medecin.experiences?.map((exp, idx) => (
              <li key={idx} className="list-item">
                <i className="bullet">•</i>
                <div className="list-item-content">
                  {renderField("experiences", exp, false, idx)}
                </div>
                {userRole === "doctor" && (
                  <button
                    className="icon-btn delete-btn"
                    onClick={() => handleDelete("experiences", exp)}
                    title={t("delete") || "Supprimer"}
                  >
                    <FaTrash />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        

        {/* FORMATIOn */}
        <div className="section">
          <div className="section-header">
            <h3>{t("formation")}</h3>
            {userRole === "doctor" && (
              <button
                onClick={() => {
                  const updatedFormations = [...(medecin.formations || []), ""];
                  setMedecin({ ...medecin, formations: updatedFormations });
                  setEditingField(`formations-${updatedFormations.length - 1}`);
                  setTempValue("");
                }}
                className="add-btn"
              >
                <FaPlus /> {t("add_formation")}
              </button>
            )}
          </div>

          <ul className="list-items">
            {medecin.formations?.map((form, idx) => (
              <li key={idx} className="list-item">
                <i className="bullet">•</i>
                <div className="list-item-content">
                  {renderField("formations", form, false, idx)}
                </div>
                {userRole === "doctor" && (
                  <button
                    className="icon-btn delete-btn"
                    onClick={() => handleDelete("formations", form)}
                    title={t("delete") || "Supprimer"}
                  >
                    <FaTrash />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* UNDO */}
        {pendingDeletes.length > 0 && (
          <div className="undo-container">
            {pendingDeletes.map((p) => (
              <div key={p.id} className="undo-item">
                <span className="undo-text">
                  {t("scheduled_delete")}: <strong>{p.value}</strong>
                </span>
                <button onClick={() => undoDelete(p.id)} className="undo-btn">
                  <FaUndo /> {t("undo")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}