"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import propos from "../../../public/apropos/propos.jpg";
import picone from "../../../public/apropos/pic1.jpg";
import prise from "../../../public/assets/icons/prise.png";
import plans from "../../../public/assets/icons/plans.png";
import prevention from "../../../public/assets/icons/prevention.png";
import fiabv from "../../../public/assets/icons/fiabv.png";
import qualite from "../../../public/assets/icons/qualite.png";
import tarif from "../../../public/assets/icons/tariff.png";
import "../../styles/a_propos.css";

function Propos() {
  const { t } = useTranslation();
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="propos-container">
      {/* Hero / Heading */}
  <div className="apropos-header">
        <h2 style={{color: '#ef404d', fontWeight: 'bold'}}>{t('apropos_hero_subtitle')}</h2>
        <p style={{color: '#007090', textAlign: 'center', maxWidth: '700px', margin: '20px auto',fontWeight: 'bold'}}>
          {t('apropos_hero_text')}
        </p>
      </div>


      {/* Votre Solution Section */}
      <div className="votre-solution">
        <div className="votre-solution-image">
          <Image src={propos} alt="solution-sante" />
        </div>
        <div className="votre-solution-text">
          <h2>{t("propos_solution_title")}</h2>
          <p className="solution-text">{t("propos_solution_text")}</p>


          <div className="expertises">
            {[1,2,3,4].map((i)=>(
              <div key={i} className="expertise-flex">
                <span>✓</span>
                <p>{t(`propos_expertise_${i}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fiabilité / Qualité / Tarif */}
      <div className="fiab-qualite-tarif">
        {[{icon:fiabv,title:t("propos_fiab_title"),text:t("propos_fiab_text")},
          {icon:qualite,title:t("propos_qualite_title"),text:t("propos_qualite_text")},
          {icon:tarif,title:t("propos_tarif_title"),text:t("propos_tarif_text")}].map((item,idx)=>(
          <div key={idx} className="fiabilite">
            <Image src={item.icon} alt={item.title} width={60} height={60}/>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      {/* Centre Complet Section */}
      <div className="centre-complet">
        <div className="centre-complet-text">
          <h2>{t("propos_centre_title")}</h2>
          <p>{t("propos_centre_text")}</p>

          {/* Accordions */}
          {[
            {id:'prise',icon:prise,title:t("propos_prise_title"),text:t("propos_prise_text")},
            {id:'plans',icon:plans,title:t("propos_plans_title"),text:t("propos_plans_text")},
            {id:'prevention',icon:prevention,title:t("propos_prevention_title"),text:t("propos_prevention_text")}
          ].map((item)=>(
            <div
              key={item.id}
              className={`accordion-box ${openAccordion === item.id ? 'open' : ''}`}
              onClick={()=>toggleAccordion(item.id)}
            >
              <div className="accordion-header">
                <Image src={item.icon} alt={item.title} width={50} height={50}/>
                <h3>{item.title}</h3>
                <span className="accordion-arrow">›</span>
              </div>
              <div className={`accordion-content ${openAccordion === item.id ? 'open' : ''}`}>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="centre-complet-image">
          <Image src={picone} alt="services-sante"/>
        </div>
      </div>
    </div>
  );
}

export default Propos;
