"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./contactList.css";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";


export default function ContactListPage() {
    const { t } = useTranslation(); // <-- initialiser t ici

  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalContacts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filterPresence, setFilterPresence] = useState("tous");
  const [filterDate, setFilterDate] = useState("");
  const [terminatedContacts, setTerminatedContacts] = useState([]);

 async function handleTerminate(id) {
  try {
    await fetch("/api/contacts/terminateContact", { // Assure-toi que le chemin est correct
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    // Retirer la ligne côté front
    setTerminatedContacts(prev => [...prev, id]);
  } catch (err) {
    console.error("Erreur lors de la terminaison :", err);
  }
}




  function getRowColor(presence) {
  switch (presence) {
    case "confirmé":
      return "#d4edda"; // vert clair
    case "annulé":
      return "#f8d7da"; // rouge clair
    case "en cours":
    default:
      return "#fff3cd"; // jaune clair
  }
}

  // ✅ Vérification de l'authentification via token
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Important pour envoyer les cookies
        });

        if (!res.ok) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        setIsAuthenticated(true);
        setUserRole(data.user?.role); // Accès au rôle depuis data.user
        setIsLoading(false);
      } catch (err) {
        console.error("Erreur d'authentification:", err);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  // 📌 Fonction pour récupérer les contacts avec pagination et filtrage
  async function fetchContacts(page = 1, presence = filterPresence) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/contacts/getContacts?page=${page}&limit=15&presence=${presence}`,
        {
          credentials: "include", // Inclure le cookie d'authentification
        }
      );
      if (!res.ok) throw new Error("Erreur lors de la récupération");

      const data = await res.json();

      // ✅ Filtrage par présence
      let filteredContacts = data.contacts;
      if (presence !== "tous") {
        filteredContacts = filteredContacts.filter(
          (c) => (c.presence || "en cours") === presence
        );
      }

      // ✅ Filtrage par date (frontend)
      if (filterDate) {
        filteredContacts = filteredContacts.filter((c) => {
          const createdAtDate = new Date(c.createdAt).toISOString().split("T")[0];
          return createdAtDate === filterDate;
        });
      }

      setContacts(filteredContacts);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error("Erreur lors de la récupération", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts(1);
    }
  }, [isAuthenticated]);

  // 📌 Quand le filtre change (présence ou date)
  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts(1, filterPresence);
    }
  }, [filterPresence, filterDate]);

  // 📌 Mise à jour du champ "presence"
  async function handlePresence(id, presence) {
    try {
      const res = await fetch("/api/contacts/updateContact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, presence }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, presence } : c))
      );
    } catch (err) {
      console.error("Erreur de mise à jour", err);
    }
  }

  // 📌 Fonctions de navigation
  const goToNextPage = () => {
    if (pagination.hasNextPage) fetchContacts(currentPage + 1, filterPresence);
  };

  const goToPrevPage = () => {
    if (pagination.hasPrevPage) fetchContacts(currentPage - 1, filterPresence);
  };

  const goToPage = (page) => {
    fetchContacts(page, filterPresence);
  };

  // 📌 Si l'utilisateur n'est pas authentifié, afficher "Unauthorized"
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>🚫 Accès non autorisé</h1>

      </div>
    );
  }

  if (loading) return <p>Chargement des contacts...</p>;

  return (
    <div className="contact-list-container">
        {/* Message Bonjour [Rôle] */}
    {userRole && (
      <h2 style={{ marginBottom: "20px", color: "#fe1952"}}>
            Bienvenue {userRole === "doctor" ? "Docteur" : "Assistant"} !

      </h2>
    )}
      <h1>{t("contact_list")}</h1>

     

 <div
  style={{
    marginBottom: "20px",
    display: "flex",
    gap: "15px",
    alignItems: "center",
    flexWrap: "wrap",
  }}
>
  {/* 🔹 Filtre par présence */}
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <label htmlFor="presenceFilter" style={{ fontWeight: "bold" }}>
      {t("filter_presence")} :
    </label>
    <select
      id="presenceFilter"
      value={filterPresence}
      onChange={(e) => setFilterPresence(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        backgroundColor: "transparent",
      }}
    >
      <option value="tous">{t("all")}</option>
      <option value="en cours">{t("in_progress")}</option>
      <option value="confirmé">{t("confirmed")}</option>
      <option value="annulé">{t("cancelled")}</option>
    </select>
  </div>

  {/* 🔹 Filtre par date */}
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <label htmlFor="dateFilter" style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
    {t("filter_date")} :
  </label>
  <input
    id="dateFilter"
    type="date"
    value={filterDate}
    onChange={(e) => setFilterDate(e.target.value)}
    style={{
      padding: "6px 10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      backgroundColor: "#f9f9f9",
    }}
  />
</div>

</div>


      {/* Bouton export */}
    <button
  className="export-btn"
  onClick={() => window.open("/api/contacts/exportContacts", "_blank")}
>
  {t("export_all_contacts")}
</button>



      {/* Tableau des contacts */}
      {contacts.length === 0 ? (
        <p>Aucun contact trouvé.</p>
      ) : (
        <>
          <table className="contact-table">
            <thead>
              <tr>
           <th>{t("id")}</th>
    <th>{t("first_name")}</th>
    <th>{t("last_name")}</th>
    <th>{t("email")}</th>
    <th>{t("phone_number")}</th>
    <th>{t("service")}</th>
    <th>{t("message")}</th>
    <th>{t("date")}</th>
    <th>{t("presence")}</th>
    <th>{t("action")}</th>

              </tr>
            </thead>
<tbody>
  {contacts
    .filter((contact) => !terminatedContacts.includes(contact._id))
    .map((contact) => (
      <tr
        key={contact._id}
        style={{
          backgroundColor: getRowColor(contact.presence || "en cours"),
          transition: "background-color 0.3s",
        }}
      >
        <td>{contact.contactId}</td>
        <td>{contact.prenom}</td>
        <td>{contact.nom}</td>
        <td>{contact.email}</td>
        <td>{contact.numero}</td>
        <td>{contact.service}</td>
        <td
  data-label={t("message")}
  title={contact.message}  // ✅ le texte complet apparaît au survol
  style={{
    maxWidth: "250px",      // largeur max pour garder les lignes uniformes
    overflow: "hidden",     // cache le texte qui dépasse
    textOverflow: "ellipsis", // affiche "..." si le texte est trop long
    whiteSpace: "nowrap",   // empêche le retour à la ligne
    cursor: "pointer"       // indique que c’est survolable
  }}
>
  {contact.message}
</td>

        <td>
          {contact.createdAt
            ? new Date(contact.createdAt).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </td>
        <td>
          <select
            value={contact.presence || "en cours"}
            onChange={(e) => handlePresence(contact._id, e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: "transparent",
              fontWeight: "500",
            }}
          >
            <option value="en cours">{t("in_progress")}</option>
            <option value="confirmé">{t("confirmed")}</option>
            <option value="annulé">{t("cancelled")}</option>
          </select>
        </td>
        {/* Nouvelle colonne Action */}
        <td>
          <button
            onClick={() => handleTerminate(contact._id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {t("terminate")}
          </button>
        </td>
      </tr>
  ))}
</tbody>


          </table>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              margin: "25px 0",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={goToPrevPage}
              disabled={!pagination.hasPrevPage}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: pagination.hasPrevPage ? "#333" : "#ccc",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
              }}
            >
              ← {t("previous")}
            </button>

            <div style={{ display: "flex", gap: "5px" }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    style={{
                      padding: "6px 12px",
                      background: currentPage === page ? "#333" : "transparent",
                      color: currentPage === page ? "white" : "#333",
                      border: `1px solid ${
                        currentPage === page ? "#333" : "#ddd"
                      }`,
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={goToNextPage}
              disabled={!pagination.hasNextPage}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: pagination.hasNextPage ? "#333" : "#ccc",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
              }}
            >
              {t("next")} →
            </button>
          </div>
        </>
      )}
    </div>
  );
}