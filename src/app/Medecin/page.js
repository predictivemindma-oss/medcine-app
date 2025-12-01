"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaEdit, FaSave, FaTrash, FaUndo } from "react-icons/fa";
import "../../styles/medecin.css";

export default function Medecin() {
  const [medecin, setMedecin] = useState(null);
  const [editingField, setEditingField] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [userRole, setUserRole] = useState(null);

  // Pending deletions: tableau d'objets { id, field, value, timerId }
  const [pendingDeletes, setPendingDeletes] = useState([]);

  // Fetch Doctor Info
  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const res = await fetch("/api/medecin");
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        setMedecin(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMedecin();
  }, []);

  // Check Auth
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

  if (!medecin) return <p>Chargement...</p>;

  // Start editing
  const startEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  // Save modifications
  const handleSave = async (field, index = null) => {
    let updated = { ...medecin };

    if (index !== null) {
      const arrField =
        field === "experiences"
          ? [...(medecin.experiences || [])]
          : [...(medecin.formations || [])];
      arrField[index] = tempValue;
      updated[field] = arrField;
    } else {
      updated[field] = tempValue;
    }

    setMedecin(updated);
    setEditingField("");

    try {
      const res = await fetch("/api/medecin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        console.error("Erreur sauvegarde côté serveur");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Planifier suppression (UI immédiate + possibilité d'undo)
  const handleDelete = (field, value) => {
    // Générer un id unique pour cette suppression
    const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 1) Supprimer visuellement l'élément
    const updated = { ...medecin };
    updated[field] = (updated[field] || []).filter((item) => item !== value);
    setMedecin(updated);

    // 2) Créer un timer pour finaliser la suppression après 5s
    const timerId = setTimeout(async () => {
      try {
        // Rechercher l'élément pending ; si absent -> déjà annulé
        const pending = pendingDeletes.find((p) => p.id === id);
        if (!pending) return;

        const res = await fetch("/api/medecin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            delete: true,
            field,
            value,
          }),
        });

        if (!res.ok) {
          // si échec serveur, restaurer localement
          console.error("Erreur suppression serveur — restauration locale");
          setMedecin((prev) => {
            const copy = { ...prev };
            copy[field] = [...(copy[field] || []), value];
            return copy;
          });
        } else {
          // Si suppression OK côté serveur, on peut remplacer le document renvoyé (optionnel)
          try {
            const updatedFromServer = await res.json();
            if (updatedFromServer) setMedecin(updatedFromServer);
          } catch (e) {
            // ignore parse errors
          }
        }
      } catch (err) {
        console.error("Erreur suppression:", err);
        // En cas d'erreur réseau, restaurer localement
        setMedecin((prev) => {
          const copy = { ...prev };
          copy[field] = [...(copy[field] || []), value];
          return copy;
        });
      } finally {
        // Enlever le pending (qu'il ait réussi ou échoué)
        setPendingDeletes((prev) => prev.filter((p) => p.id !== id));
      }
    }, 5000);

    // 3) Ajouter à pendingDeletes pour poter undo
    setPendingDeletes((prev) => [...prev, { id, field, value, timerId }]);
  };

  // Annuler une suppression programmée
  const undoDelete = (id) => {
    const pending = pendingDeletes.find((p) => p.id === id);
    if (!pending) return;

    // Annuler le timer
    clearTimeout(pending.timerId);

    // Restaurer l'élément localement (finir l'undo)
    setMedecin((prev) => {
      const copy = { ...prev };
      copy[pending.field] = [...(copy[pending.field] || []), pending.value];
      return copy;
    });

    // Retirer du tableau pending
    setPendingDeletes((prev) => prev.filter((p) => p.id !== id));
  };

  // Displays editable field
  const renderField = (field, value, multiline = false, index = null) => {
    const key = index !== null ? `${field}-${index}` : field;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {editingField === key ? (
          multiline ? (
            <>
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                rows={3}
                className="border px-2 py-1 rounded w-full"
              />
              <FaSave
                onClick={() => handleSave(field, index)}
                className="cursor-pointer text-green-600"
              />
            </>
          ) : (
            <>
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <FaSave
                onClick={() => handleSave(field, index)}
                className="cursor-pointer text-green-600"
              />
            </>
          )
        ) : (
          <>
            <span>{value}</span>
            {userRole === "doctor" && (
              <FaEdit
                onClick={() => startEdit(key, value)}
                className="cursor-pointer text-blue-600"
              />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="medecin-container">
      {/* CONTACT */}
      <div className="contact-info">
        <div className="doc-img" style={{ position: "relative" }}>
          <Image
            src={medecin.image || "/doc.jpg"}
            alt="doctor"
            width={300}
            height={400}
          />

          {userRole === "doctor" && (
            <>
              <FaEdit
                onClick={() => document.getElementById("imageUpload").click()}
                className="cursor-pointer"
                style={{
                  color: "#155DFC",
                  position: "absolute",
                  top: 10,
                  right: 10,
                }}
              />
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
          <i>{renderField("specialite", medecin.specialite)}</i>

          <h3 className="!text-[#009ca2] font-semibold text-[x-large]">
            {renderField("contactTitle", "Contact")}
          </h3>

          <div>{renderField("telephone", medecin.telephone)}</div>
          <div>{renderField("fixe", medecin.fixe)}</div>
          <div>{renderField("localisation", medecin.localisation)}</div>

          <Link
            href="/Contact"
            className="block text-center text-white mt-1 bg-[#009ca2] px-6 py-2.5 rounded-[18px] hover:bg-[#fe1952]"
          >
            Prendre rendez-vous
          </Link>
        </div>
      </div>

      {/* INTRO */}
      <div className="intro">
        <h3>{renderField("nom", medecin.nom)}</h3>
        <div>{renderField("introduction", medecin.introduction, true)}</div>

        {/* EXPÉRIENCES */}
        <h3>Expérience</h3>

        {userRole === "doctor" && (
          <button
            onClick={() => {
              const updatedExperiences = [...(medecin.experiences || []), ""];
              setMedecin({
                ...medecin,
                experiences: updatedExperiences,
              });
              setEditingField(`experiences-${updatedExperiences.length - 1}`);
              setTempValue("");
            }}
            className="mt-2 mb-2 px-4 py-1 text-white rounded hover:bg-[#fe1952]"
            style={{ backgroundColor: "#e76593" }}
          >
            Ajouter une expérience
          </button>
        )}

        <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
          {medecin.experiences?.map((exp, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {renderField("experiences", exp, false, idx)}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {userRole === "doctor" && (
                  <FaTrash
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete("experiences", exp)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* FORMATIONS */}
        <h3>Formations</h3>

        {userRole === "doctor" && (
          <button
            onClick={() => {
              const updatedFormations = [...(medecin.formations || []), ""];
              setMedecin({
                ...medecin,
                formations: updatedFormations,
              });
              setEditingField(`formations-${updatedFormations.length - 1}`);
              setTempValue("");
            }}
            className="mt-2 px-4 py-1 text-white rounded hover:bg-[#fe1952]"
            style={{ backgroundColor: "#e76593" }}
          >
            Ajouter une formation
          </button>
        )}

        <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
          {medecin.formations?.map((form, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {renderField("formations", form, false, idx)}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {userRole === "doctor" && (
                  <FaTrash
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete("formations", form)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Boutons UNDO pour chaque suppression en attente */}
        <div style={{ marginTop: 12 }}>
          {pendingDeletes.map((p) => (
            <div
              key={p.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginRight: 8,
                padding: "6px 10px",
                background: "#f3f4f6",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ fontSize: 13 }}>
                Suppression programmée: <strong>{p.value}</strong>
              </span>
              <button
                onClick={() => undoDelete(p.id)}
                className="px-2 py-1 rounded"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#10b981",
                  color: "white",
                  border: "none",
                }}
              >
                <FaUndo /> Annuler
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
