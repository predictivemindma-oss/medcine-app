"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import diabete from "../../../public/services/diabete.jpeg";
import cholesterol from "../../../public/services/cholesterol.jpg";
import glandes from "../../../public/services/glandes.jpg";
import syndrome from "../../../public/services/syndrome.jpg";
import hormones from "../../../public/services/hormones.jpg";
import fertility from "../../../public/services/fertility.jpg";
import hirsutism from "../../../public/services/hirsutism.jpg";
import goutte from "../../../public/services/goutte.png";
import obesity from "../../../public/services/obesity.jpg";
import hypertension from "../../../public/services/hypertension.jpg";
import puberty from "../../../public/services/puberty.png";

import "../../styles/services.css";

export default function Services() {
  const { t } = useTranslation();
  const servicesData = t("servicesData", { returnObjects: true });
  const images = [
    diabete, glandes, syndrome, hormones, puberty,
    fertility, hirsutism, goutte, obesity, hypertension, cholesterol
  ];
  const servicesWithImages = servicesData.map((service, i) => ({
    ...service,
    img: images[i],
  }));

  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleReadMore = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="services-container">
      <h1>{t("expertise_title")}</h1>

      <div className="flex-container">
        {Array.from({ length: Math.ceil(servicesWithImages.length / 3) }, (_, rowIndex) => (
          <div className="services-row" key={rowIndex}>
            {servicesWithImages.slice(rowIndex * 3, rowIndex * 3 + 3).map((service, i) => {
              const index = rowIndex * 3 + i;
              const isActive = activeIndex === index;

              return (
                <div
                  className="service"
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "650px",
                    overflow: "hidden",
                    position: "relative"
                  }}
                >
                  <div className="service-pic">
                    <Image src={service.img} alt={service.title} width={300} height={200} />
                  </div>

                  <div className="service-text" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", flex: 1 }}>
                    <h2>{service.title}</h2>

                    <p
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        marginBottom: "8px",
                        lineHeight: "1.5em"
                      }}
                    >
                      {service.desc}
                    </p>

                    <button
                      onClick={() => toggleReadMore(index)}
                      style={{
                        marginTop: "20px",
                        padding: "8px 8px",
                        borderRadius: "12px",
                        backgroundColor: "var(--main-blue)",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {isActive ? t("close") : t("learn_more")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Full overlay modal */}
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
            zIndex: 100000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            overflowY: "auto"
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
              gap: "20px",
              overflowY: "auto",
              zIndex: 100001
            }}
          >
            <div style={{ flex: 1 }}>
              <h2 style={{ color: "var(--main-blue)" }}>{servicesWithImages[activeIndex].title}</h2>
              <p style={{ marginTop: "15px" }}>{servicesWithImages[activeIndex].desc}</p>
              <button
                onClick={() => setActiveIndex(null)}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "var(--main-blue)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Fermer
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <Image
                src={servicesWithImages[activeIndex].img}
                alt={servicesWithImages[activeIndex].title}
                width={300}
                height={300}
                style={{ width: "100%", height: "auto", borderRadius: "18px" }}
              />
            </div>
          </div>
        </div>
      )}

      <Link href="/Contact" className="contact-btn">
        {t("contact_us")}
      </Link>
    </div>
  );
}
