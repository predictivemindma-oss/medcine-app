"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

import { useSession } from "next-auth/react";

import "../../styles/services.css";

export default function ServicesList() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const getServices = async () => {
      try {
        const response = await axios.get("/api/services");
        setServices(response.data.services || []);
        console.log("Success!", response.data);
      } catch (err) {
        console.log("Error loading services:", err);
      }
    };
    getServices();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      await axios.delete(`/api/services?id=${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      console.log("Service deleted:", id);
    } catch (err) {
      console.log("Error deleting service:", err);
    }
  };

  const toggleReadMore = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // 🌟 DRAG END — reorder services visually
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newItems = Array.from(services);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);

    setServices(newItems);
  };

  return (
    <div className="services-container">
      {/* {!session && (
        <button onClick={() => router.push("/login")} className="text-white no-underline bg-[var(--main-blue)] px-4 py-2 border-4 border-[#4d96ae] rounded-xl font-normal transition-all duration-500 ease-in-out hover:bg-[var(--main-red)] hover:border-[#feddddce]">
          Login
        </button>
      )} */}

      <h1 className="text-[#117090] text-4xl">{t("expertise_title")}</h1>

      {/*   ✅ Wrap your list in DragDropContext + Droppable   */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="services">
          {(provided) => (
            <div
              className="flex flex-wrap justify-center gap-8 max-w-6xl"
              style={{ justifyContent: "space-between", overflow: "hidden" }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {services.length > 0 ? (
                services.map((service, index) => (
                  <Draggable key={service._id} draggableId={service._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="relative flex flex-col bg-black/5 rounded-2xl p-4 w-80 text-left has-[600px]"
                      >
                        {session?.user.role === "doctor" && (
                          <div className="absolute top-3 right-3 flex gap-2">
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(service._id)}
                              className="bg-black/30 p-2 rounded-full hover:bg-[#ff94ab] transition"
                              title="Delete"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="22px"
                                viewBox="0 -960 960 960"
                                width="22px"
                                fill="#fe1952"
                              >
                                <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Z" />
                              </svg>
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => router.push(`/AddService?id=${service._id}`)}
                              className="bg-black/30 p-2 rounded-full hover:bg-[#ff94ab] transition"
                              title="Edit"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="22px"
                                viewBox="0 -960 960 960"
                                width="22px"
                                fill="#fe1952"
                              >
                                <path d="M160-400v-80h280v80H160Zm0-160v-80h440v80H160Zm0-160v-80h440v80H160Zm360 560v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T863-380L643-160H520Zm300-263-37-37 37 37ZM580-220h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {service.image && (
                          <Image
                            className="rounded-xl object-cover mx-auto w-full h-[280px]"
                            src={service.image}
                            alt={service.title}
                            width={400}
                            height={300}
                          />
                        )}

                        <h2 className="text-xl text-[#117090] mt-3">{service.title}</h2>

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
                <p className="text-[#e2627e]">No services available.</p>
              )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Full-page modal */}
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
              <p style={{ marginTop: "15px" }}>
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

            {services.find((s) => s._id === activeIndex)?.image && (
              <div style={{ flex: 1 }}>
                <Image
                  src={services.find((s) => s._id === activeIndex)?.image}
                  alt={services.find((s) => s._id === activeIndex)?.title}
                  width={400}
                  height={400}
                  style={{ width: "100%", height: "auto", borderRadius: "18px" }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}