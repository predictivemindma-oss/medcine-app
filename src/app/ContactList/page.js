"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "../components/LoadingOverlay";
import "./contactList.css";
import { useTranslation } from "react-i18next";

export default function ContactListPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // ⭐ Nouveau state
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalContacts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filterPresence, setFilterPresence] = useState("en cours");
  const [filterDate, setFilterDate] = useState("");

  const [localPresenceChanges, setLocalPresenceChanges] = useState({});

  function getRowColor(presence) {
    switch (presence) {
      case "confirmé":
        return "#d4edda";
      case "annulé":
        return "#f8d7da";
      case "en cours":
      default:
        return "#fff3cd";
    }
  }

  // Vérification de l'authentification
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        setIsAuthenticated(true);
        setUserRole(data.user?.role);
        setIsLoading(false);
      } catch (err) {
        console.error("Erreur d'authentification:", err);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Récupération des contacts avec itemsPerPage
  async function fetchContacts(page = 1, presence = filterPresence) {
    setLoading(true);
    try {
      let url = `/api/contacts/getContacts?page=${page}&limit=${itemsPerPage}&presence=${presence}`;
      if (filterDate) url += `&date=${filterDate}`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors de la récupération");

      const data = await res.json();
      setContacts(data.contacts);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error("Erreur lors de la récupération", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchContacts(1);
  }, [isAuthenticated, itemsPerPage]); // ⭐ Ajout de itemsPerPage

  useEffect(() => {
    if (isAuthenticated) fetchContacts(1, filterPresence);
  }, [filterPresence, filterDate, isAuthenticated]);

  // Navigation pagination
  const goToNextPage = () => {
    if (pagination.hasNextPage) fetchContacts(currentPage + 1, filterPresence);
  };

  const goToPrevPage = () => {
    if (pagination.hasPrevPage) fetchContacts(currentPage - 1, filterPresence);
  };

  const goToPage = (page) => {
    fetchContacts(page, filterPresence);
  };

  if (isLoading || loading) {
    return <LoadingOverlay show={true} />;
  }

  return (
    <div className="contact-list-container">
      {userRole && (
        <h2 style={{ marginBottom: "20px", color: "#fe1952" }}>
          {userRole === "doctor" ? t("welcome_doctor") : t("welcome_assistant")}
        </h2>
      )}
      <h1>{t("contact_list")}</h1>

   
    {/* Boutons export / today */}
<div className="k-btno">
  <button
    className="btn-main export-btn"
    onClick={() => window.open("/api/contacts/exportContacts", "_blank")}
  >
    {t("export_all_contacts")}
  </button>

  <button
    className="btn-main"
    onClick={() => {
      const todayStr = new Date().toISOString().split('T')[0];
      setFilterDate(todayStr);
    }}
  >
    {t("today_appointments")}
  </button>
</div>




{/* Filtres */}
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    alignItems: "center",
    marginBottom: "20px",
  }}
>
  {/* Filtre Présence */}
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <label
      htmlFor="presenceFilter"
      style={{
        fontWeight: "bold",
        color: "var(--main-blue)",
        whiteSpace: "nowrap",
        fontSize: "14px",
      }}
    >
      {t("filter_presence")} :
    </label>
    <select
      id="presenceFilter"
      value={filterPresence}
      onChange={(e) => setFilterPresence(e.target.value)}
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid var(--main-blue)",
        backgroundColor: "var(--second-blue)",
        color: "var(--main-blue)",
        fontSize: "14px",
        outline: "none",
        minWidth: "120px",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
    >
      <option value="tous">{t("all")}</option>
      <option value="en cours">{t("in_progress")}</option>
      <option value="confirmé">{t("confirmed")}</option>
      <option value="annulé">{t("cancelled")}</option>
    </select>
  </div>

  {/* Filtre Date */}
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <label
      htmlFor="dateFilter"
      style={{
        fontWeight: "bold",
        color: "var(--main-blue)",
        whiteSpace: "nowrap",
        fontSize: "14px",
      }}
    >
      {t("filter_date")} :
    </label>
    <input
      id="dateFilter"
      type="date"
      value={filterDate}
      onChange={(e) => setFilterDate(e.target.value)}
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid var(--main-blue)",
        backgroundColor: "var(--second-blue)",
        color: "var(--main-blue)",
        fontSize: "14px",
        outline: "none",
        minWidth: "140px",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
    />
  </div>

  {/* Filtre Items per Page */}
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <label
      htmlFor="itemsPerPage"
      style={{
        fontWeight: "bold",
        color: "var(--main-blue)",
        whiteSpace: "nowrap",
        fontSize: "14px",
      }}
    >
      {t("items_per_page") || "Items par page"} :
    </label>
    <select
      id="itemsPerPage"
      value={itemsPerPage}
      onChange={(e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid var(--main-blue)",
        backgroundColor: "var(--second-blue)",
        color: "var(--main-blue)",
        fontSize: "14px",
        outline: "none",
        minWidth: "80px",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={15}>15</option>
      <option value={20}>20</option>
      <option value={30}>30</option>
      <option value={50}>50</option>
    </select>
  </div>
</div>



      {/* Tableau */}
      {contacts.length === 0 ? (
        <p>{t("no_contacts_found")}</p>
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
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr
                  key={contact._id}
                  style={{ backgroundColor: getRowColor(localPresenceChanges[contact._id] ?? contact.presence), transition: "background-color 0.3s" }}
                >
                  <td>{contact.contactId}</td>
                  <td>{contact.prenom}</td>
                  <td>{contact.nom}</td>
                  <td>{contact.email}</td>
                  <td>{contact.numero}</td>
                  <td>{contact.service}</td>
                  <td title={contact.message} style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
                    {contact.message}
                  </td>
                  <td>{contact.createdAt ? new Date(contact.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td>
                    <select
                      value={localPresenceChanges[contact._id] ?? contact.presence}
                      onChange={(e) => setLocalPresenceChanges(prev => ({ ...prev, [contact._id]: e.target.value }))}
                      style={{ padding: "6px 10px", borderRadius: "5px", border: "1px solid #ccc", backgroundColor: "transparent", fontWeight: "500" }}
                    >
                      <option value="en cours">{t("in_progress")}</option>
                      <option value="confirmé">{t("confirmed")}</option>
                      <option value="annulé">{t("cancelled")}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bouton validate */}
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <button
              className="validate-btn"
              onClick={async () => {
                try {
                  const updates = Object.entries(localPresenceChanges).map(([id, presence]) => ({ id, presence }));
                  if (updates.length === 0) {
                    alert("Aucune modification à sauvegarder");
                    return;
                  }

                  const res = await fetch("/api/contacts/bulkUpdatePresence", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ updates }),
                  });
                  if (!res.ok) throw new Error("Erreur lors de la sauvegarde");

                  setContacts(prev =>
                    prev.map(c => localPresenceChanges[c._id] ? { ...c, presence: localPresenceChanges[c._id] } : c)
                  );
                  setLocalPresenceChanges({});
                  
                  await fetchContacts(currentPage, filterPresence);
                  
                  alert("Modifications sauvegardées avec succès !");
                } catch (err) {
                  console.error(err);
                  alert("Erreur lors de la sauvegarde");
                }
              }}
            >
              {t("validate_changes")}
            </button>
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", margin: "25px 0", flexWrap: "wrap" }}>
            <button onClick={goToPrevPage} disabled={!pagination.hasPrevPage} style={{ padding: "8px 16px", background: "transparent", color: pagination.hasPrevPage ? "#333" : "#ccc", border: "1px solid #ddd", borderRadius: "4px", cursor: pagination.hasPrevPage ? "pointer" : "not-allowed" }}>← {t("previous")}</button>
            <div style={{ display: "flex", gap: "5px" }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => goToPage(page)} style={{ padding: "6px 12px", background: currentPage === page ? "#333" : "transparent", color: currentPage === page ? "white" : "#333", border: `1px solid ${currentPage === page ? "#333" : "#ddd"}`, borderRadius: "4px", cursor: "pointer" }}>{page}</button>
              ))}
            </div>
            <button onClick={goToNextPage} disabled={!pagination.hasNextPage} style={{ padding: "8px 16px", background: "transparent", color: pagination.hasNextPage ? "#333" : "#ccc", border: "1px solid #ddd", borderRadius: "4px", cursor: pagination.hasNextPage ? "pointer" : "not-allowed" }}>{t("next")} →</button>
          </div>
        </>
      )}
    </div>
  );
}