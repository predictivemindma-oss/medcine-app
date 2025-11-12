"use client";

import { useEffect, useState } from "react";
import "./contactList.css";

export default function ContactListPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalContacts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // 📌 Fonction pour récupérer les contacts avec pagination
  async function fetchContacts(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/getContacts?page=${page}&limit=15`);
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
    fetchContacts(1);
  }, []);

  async function handlePresence(id, presence) {
    try {
      const res = await fetch("/api/contacts/updateContact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    if (pagination.hasNextPage) {
      fetchContacts(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (pagination.hasPrevPage) {
      fetchContacts(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    fetchContacts(page);
  };

  if (loading) return <p>Chargement des contacts...</p>;

  return (
    <div className="contact-list-container">
      <h1>Liste des contacts</h1>
      <button
  style={{
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '15px'
  }}
  onClick={() => window.open('/api/contacts/exportContacts', '_blank')}
>
  Exporter tous les contacts
</button>
      {/* 📊 Informations de pagination */}
      

      {contacts.length === 0 ? (
        <p>Aucun contact pour le moment.</p>
      ) : (
        <>
          <table className="contact-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Numéro</th>
                <th>Service</th>
                <th>Message</th>
                <th>Date</th>
                <th>Présence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.contactId}</td>
                  <td>{contact.prenom}</td>
                  <td>{contact.nom}</td>
                  <td>{contact.email}</td>
                  <td>{contact.numero}</td>
                  <td>{contact.service}</td>
                  <td>{contact.message}</td>
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
                  <td>{contact.presence || "en cours"}</td>
                  <td>
                    <button onClick={() => handlePresence(contact._id, "en cours")}>
                      ⏳ En cours
                    </button>
                    <button onClick={() => handlePresence(contact._id, "confirmé")}>
                      ✅ Confirmé
                    </button>
                    <button onClick={() => handlePresence(contact._id, "annulé")}>
                      ❌ Annulé
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 🔽 Contrôles de pagination */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px', 
            margin: '25px 0',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={goToPrevPage} 
              disabled={!pagination.hasPrevPage}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: pagination.hasPrevPage ? '#333' : '#ccc',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                fontSize: '14px'
              }}
            >
              ← Précédent
            </button>

            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  style={{
                    padding: '6px 12px',
                    background: currentPage === page ? '#333' : 'transparent',
                    color: currentPage === page ? 'white' : '#333',
                    border: `1px solid ${currentPage === page ? '#333' : '#ddd'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    minWidth: '36px'
                  }}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={goToNextPage} 
              disabled={!pagination.hasNextPage}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: pagination.hasNextPage ? '#333' : '#ccc',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                fontSize: '14px'
              }}
            >
              Suivant →
            </button>
          </div>
        </>
      )}
    </div>
  );
}