"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import slide1 from "../../../public/accueil/slide1.jpg";
import slide2 from "../../../public/accueil/slide2.jpeg";
import slide3 from "../../../public/accueil/slide3.jpg";

import phone from "../../../public/assets/icons/phone-icon-fill.png";
import star from "../../../public/assets/icons/star.png";

import choisir from "../../../public/accueil/choisir-ouafae.jpg";
import troubles from "../../../public/accueil/troubles.jpg";
import suivi from "../../../public/accueil/suivi.jpg";
import conseil from "../../../public/accueil/conseil.jpg";

import expertise1 from "../../../public/assets/icons/expertise1.png";
import expertise2 from "../../../public/assets/icons/expertise2.png";
import expertise3 from "../../../public/assets/icons/expertise3.png";
import expertise4 from "../../../public/assets/icons/expertise4.png";

import "@/styles/accueil.css";

export default function Accueil() {
  const { t } = useTranslation();
  const slides = [slide1, slide2, slide3];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  return (
    <div className="accueil-container">
      {/* HERO */}
      <div className="vie-saine">
        <div className="text">
          <h1 className="dr">{t("doc_name")}</h1>
          <h1>{t("for_life")}<span className="text-[#fe1952]">{t("healthy")}</span>{t("balance")}</h1>
          <p className="long-p">{t("hero_description")}</p>
          <div className="numbers-flex">
            <div className="numbers">
              <h1>5+</h1>
              <p>{t("experience_years")}</p>
            </div>
            <div className="numbers">
              <h1>500+</h1>
              <p>{t("patients")}</p>
            </div>
            <div className="numbers">
              <h1>50+</h1>
              <p>{t("experts")}</p>
            </div>
          </div>
          <Link href="/Contact" className="accueil-links">
            {t("appointment")}
          </Link>
          <a href="tel:+212536696048" className="ligne-tel-flex">
            <div className="phone-icon">
              <Image src={phone} alt="phone" />
            </div>
            <div>
              <span>+212 5 36 69 60 48</span>
            </div>
          </a>
        </div>
        <div className="slider">
          <Image
            src={slides[current]}
            alt={`slide-${current + 1}`}
            className="slider-image"
            priority
          />
          <div className="dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`dot ${current === index ? "active" : ""}`}
                onClick={() => goToSlide(index)}
              ></span>
            ))}
          </div>
        </div>
      </div>

      {/* CHOISIR */}
      <div className="choisir">
        <div className="choisir-img">
          <Image src={choisir} alt="choisir-ouafae" />
        </div>
        <div className="choisir-text">
          <h1>{t("choisir_title")}</h1>
          <p>{t("choisir_text")}</p>
          <div className="expertise">
            <div className="expertise-item">
              <div className="expertise-image">
                <Image src={expertise1} alt="expertise-1" />
              </div>
              <span>{t("expertise_1")}</span>
            </div>
            <div className="expertise-item">
              <div className="expertise-image">
                <Image src={expertise2} alt="expertise-2" />
              </div>
              <span>{t("expertise_2")}</span>
            </div>
            <div className="expertise-item">
              <div className="expertise-image">
                <Image src={expertise3} alt="expertise-3" />
              </div>
              <span>{t("expertise_3")}</span>
            </div>
            <div className="expertise-item">
              <div className="expertise-image">
                <Image src={expertise4} alt="expertise-4" />
              </div>
              <span>{t("expertise_4")}</span>
            </div>
          </div>
          <Link href="/Apropos" className="accueil-links">
            {t("about_us")}
          </Link>
        </div>
      </div>

      {/* SOINS */}
      <div className="h1-soins">
        <h1>{t("soins_title")}</h1>
      </div>

      <div className="troubles">
        <div className="troubles-image">
          <Image src={troubles} alt="troubles-endocriniens" className="m-auto" />
        </div>
        <div className="troubles-text">
          <div className="headings">
            <span className="soins-number">01</span>
            <h1>{t("troubles_title")}</h1>
          </div>
          <p>{t("troubles_text")}</p>
          <Link href="/Apropos" className="accueil-links">
            {t("about_us")}
          </Link>
        </div>
      </div>

      <div className="suivi">
        <div className="suivi-text">
          <div className="headings">
            <span className="soins-number">02</span>
            <h1>{t("suivi_title")}</h1>
          </div>
          <p>{t("suivi_text")}</p>
          <Link href="/Services" className="accueil-links">
            {t("learn_more")}
          </Link>
        </div>
        <div className="suivi-image">
          <Image src={suivi} alt="suivi-diabete" className="m-auto" />
        </div>
      </div>

      <div className="conseil">
        <div className="conseil-image">
          <Image src={conseil} alt="conseil" className="m-auto" />
        </div>
        <div className="conseil-text">
          <div className="headings">
            <span className="soins-number">03</span>
            <h1>{t("conseil_title")}</h1>
          </div>
          <p>{t("conseil_text")}</p>
          <Link href="/Services" className="accueil-links">
            {t("learn_more")}
          </Link>
        </div>
      </div>

      {/* AVIS PATIENTS */}
      <div className="patients-avis">
        <div className="head">
          <h1>{t("patients_title")}</h1>
          <p>{t("patients_text")}</p>
        </div>

        <div className="carousel-container">
          <div className="avis-animation">
            {Array(2) // duplicate 2 times
              .fill()
              .flatMap((_, repeatIndex) =>
                [
                  {
                    name: "Hanane Mh",
                    letter: "H",
                    className: "hanane-letter",
                    text: "Je recommande vivement DR OUAFAE EL MAHRAOUI pour ses compétences exceptionnelles et son approche empathique envers les patients",



                  },
                  {
                    name: "Zdenko Bican",
                    letter: "Z",
                    className: "zdenko-letter",
                    text: "Dr Ouafae Elmehraoui saved my life and thanks to her I am still alive. I got proper treatment with such kindness and warmness that only a few doctor can give.",


                  },
                  {
                    name: "Fatiha Douiri",
                    letter: "F",
                    className: "fatiha-letter",
                    text: "Le Dr Mahrawi est un médecin distingué, doté d'une personnalité bienveillante et compréhensive. C'est une médecin hautement compétente.",


                  },
                  {
                    name: "Soufiane Samoudi",
                    letter: "S",
                    className: "soufiane-letter",
                    text: "Je recommande vivement Dr.Ouafae El Mahraoui à toute personne cherchant un endocrinologue. Elle est très compétente dans son métier et très humaine",


                  },
                ].map((review, i) => (
                  <div key={`${repeatIndex}-${i}`} className="avis">

                    <div className="heading">
                      <div>
                        <span className={review.className}>{review.letter}</span>
                      </div>
                      <div>
                        <span className="avis-name">{review.name}</span> <br />
                        <span className="review-google">Review on Google</span>
                      </div>
                    </div>
                    <p>{review.text}</p>
                    <div className="stars-rate">
                      {[...Array(5)].map((_, j) => (
                        <Image key={j} src={star} alt="rating" />
                      ))}
                    </div>


                  </div>

                ))
              )}
          </div>

        </div>
      </div>
    </div>
  );
}
