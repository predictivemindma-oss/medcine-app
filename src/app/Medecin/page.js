"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaEdit, FaSave } from "react-icons/fa";
import "../../styles/medecin.css";

export default function Medecin() {
  const [medecin, setMedecin] = useState(null);
  const [editingField, setEditingField] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [userRole, setUserRole] = useState(null); // Rôle utilisateur

  // Récupérer le médecin
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

  // Vérifier le rôle de l'utilisateur
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

  const startEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = async (field, index = null) => {
    let updated = { ...medecin };

    if (index !== null) {
      const arrField =
        field === "experiences" ? [...medecin.experiences] : [...medecin.formations];
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
      if (!res.ok) throw new Error("Erreur sauvegarde");
    } catch (err) {
      console.error(err);
    }
  };

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
      {/* Contact Info */}
      <div className="contact-info">
        <div className="doc-img" style={{ position: "relative" }}>
          <Image
            src={medecin.image || "/doc.jpg"}
            alt="doctor"
            width={300}
            height={400}
          />

          {/* Icône de modification image seulement pour doctor */}
          {userRole === "doctor" && (
            <>
              <FaEdit
                onClick={() => document.getElementById("imageUpload").click()}
                className="cursor-pointer text-purple-600"
                style={{ position: "absolute", top: 10, right: 10 }}
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

      {/* Introduction */}
      <div className="intro">
        <h3>{renderField("nom", medecin.nom)}</h3>

        <div>{renderField("introduction", medecin.introduction, true)}</div>

        <h3>Expérience</h3>
        <ul>
          {medecin.experiences?.map((exp, idx) => (
            <li key={idx}>{renderField("experiences", exp, false, idx)}</li>
          ))}
        </ul>

        <h3>Formation</h3>
        <ul>
          {medecin.formations?.map((form, idx) => (
            <li key={idx}>{renderField("formations", form, false, idx)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
