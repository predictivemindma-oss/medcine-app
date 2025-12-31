"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import LoadingOverlay from "../components/LoadingOverlay";

import "../../styles/services.css";

export default function ServicesList() {
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        setUser(response.data.user);
      } catch (err) {
        console.log("Not authenticated or error:", err);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  // Vérifier la taille de l'écran
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Charger les services avec la langue actuelle
  useEffect(() => {
    const getServices = async () => {
      setLoading(true);
      try {
        const lang = i18n.language === 'ar' ? 'ar' : 'fr';
        const response = await axios.get(`/api/services?lang=${lang}`);
        setServices(response.data.services || []);
      } catch (err) {
        console.log("Error loading services:", err);
      } finally {
        setLoading(false);
      }
    };

    if (i18n.isInitialized) getServices();
  }, [i18n.language, i18n.isInitialized]);

  const handleDelete = async (id) => {
    if (user?.role !== "doctor") {
      alert("Vous n'avez pas la permission de supprimer des services.");
      return;
    }

    if (!confirm(t("confirm_delete"))) return;

    try {
      await axios.delete(`/api/services?id=${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.log("Error deleting service:", err);
      alert("Erreur lors de la suppression du service.");
    }
  };

  const handleEdit = (id) => {
    if (user?.role !== "doctor") {
      alert("Vous n'avez pas la permission de modifier des services.");
      return;
    }
    router.push(`/AddService?id=${id}`);
  };

  const toggleReadMore = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleDragEnd = (result) => {
    if (user?.role !== "doctor") {
      alert("Vous n'avez pas la permission de réorganiser les services.");
      return;
    }

    if (!result.destination) return;

    const newItems = Array.from(services);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);

    setServices(newItems);
  };

  const isDoctor = user?.role === "doctor";

  // Afficher uniquement le loader pendant le chargement
  if (loading) {
    return <LoadingOverlay show={true} />;
  }

  return (
    <div className="services-container">
      <h1 className="text-[#117090] text-4xl">{t("expertise_title")}</h1>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="services" isDropDisabled={!isDoctor}>
          {(provided) => (
            <div
              className="flex flex-wrap justify-center gap-8 max-w-6xl"
              style={{ justifyContent: "flex-start", overflow: "hidden" }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {services.length > 0 ? (
                services.map((service, index) => (
                  <Draggable
                    key={service._id}
                    draggableId={service._id}
                    index={index}
                    isDragDisabled={!isDoctor}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="relative flex flex-col bg-black/5 rounded-2xl p-4 w-80 text-left"
                      >
                        {isDoctor && (
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              onClick={() => handleDelete(service._id)}
                              className="bg-black/30 p-2 rounded-full hover:bg-[#ff94ab] transition"
                              title="Delete"
                            >
                              🗑️
                            </button>

                            <button
                              onClick={() => handleEdit(service._id)}
                              className="bg-black/30 p-2 rounded-full hover:bg-[#ff94ab] transition"
                              title="Edit"
                            >
                              ✏️
                            </button>
                          </div>
                        )}

                        {/* SECTION IMAGE CORRIGÉE - Affiche toutes les images */}
                        {service.image && (
                          <div className="image-container rounded-xl overflow-hidden w-full h-[280px]">
                            {service.image.startsWith("/") ? (
                              // Image locale - utilise Next.js Image
                              <Image
                                src={service.image}
                                alt={service.title}
                                width={400}
                                height={300}
                                className="w-full h-full object-cover"
                                priority={index < 3} // Priorité pour les premières images
                              />
                            ) : (
                              // Image Cloudinary - utilise img simple avec gestion d'erreur
                              <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Erreur chargement image Cloudinary:', service.image);
                                  e.target.src = '/default-service.jpg';
                                  e.target.onerror = null; // Évite les boucles infinies
                                }}
                                onLoad={() => console.log('Image Cloudinary chargée:', service.image)}
                              />
                            )}
                          </div>
                        )}

                        <h2 className="titleee">{service.title}</h2>

                        <p
                          className="text-md break-words mt-2"
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {service.desc}
                        </p>

                        <button
                          onClick={() => toggleReadMore(service._id)}
                          className="mt-3 px-3 py-1 rounded-lg bg-[#117090] text-white hover:bg-[#0d5a75] transition"
                        >
                          {t("learn_more")}
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <p className="text-[#e2627e]">{t("no_services_available")}</p>
              )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* MODAL POUR VOIR PLUS DE DÉTAILS */}
      {activeIndex !== null && (
        <div
          onClick={() => setActiveIndex(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            zIndex: 10000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "20px",
              width: isMobile ? "98%" : "80%",
              maxHeight: "90%",
              padding: "20px",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              gap: "20px",
              overflowY: "auto",
              zIndex: 10001,
            }}
          >
            <div style={{ flex: 2 }}>
              <h2 style={{ color: "#117090" }}>
                {services.find((s) => s._id === activeIndex)?.title}
              </h2>
              <p
                style={{
                  marginTop: "15px",
                  textAlign: "justify",
                  lineHeight: "1.6",
                }}
              >
                {services.find((s) => s._id === activeIndex)?.desc}
              </p>

              <button
                onClick={() => setActiveIndex(null)}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#117090",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t("close")}
              </button>
            </div>

            {/* SECTION IMAGE DU MODAL CORRIGÉE */}
            {services.find((s) => s._id === activeIndex)?.image && (
              <div style={{ flex: 1, minWidth: isMobile ? "100%" : "300px" }}>
                {services.find((s) => s._id === activeIndex)?.image?.startsWith("/") ? (
                  // Image locale dans modal
                  <Image
                    src={services.find((s) => s._id === activeIndex)?.image || ''}
                    alt={services.find((s) => s._id === activeIndex)?.title || ''}
                    width={400}
                    height={400}
                    style={{ width: "100%", height: "auto", borderRadius: "18px" }}
                  />
                ) : (
                  // Image Cloudinary dans modal
                  <img
                    src={services.find((s) => s._id === activeIndex)?.image || ''}
                    alt={services.find((s) => s._id === activeIndex)?.title || ''}
                    style={{ 
                      width: "100%", 
                      height: "auto", 
                      borderRadius: "18px",
                      maxHeight: "400px",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      e.target.src = '/default-service.jpg';
                      e.target.onerror = null;
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}