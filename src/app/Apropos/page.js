"use client"

import Image from "next/image";
import { useTranslation } from "react-i18next";
import propos from "../../../public/apropos/propos.jpg";
import picone from "../../../public/apropos/pic1.jpg";
import prise from "../../../public/assets/icons/prise.png";
import plans from "../../../public/assets/icons/plans.png";
import prevention from "../../../public/assets/icons/prevention.png";
import fiab from "../../../public/assets/icons/fiab.png";
import qualite from "../../../public/assets/icons/qualite.png";
import tarif from "../../../public/assets/icons/tarif.png";
import "../../styles/a_propos.css";

function Propos() {
  const { t } = useTranslation();
  return (
    <div className="propos-container">
      <div className="heading">
        <p>{t("propos_heading")}</p>
      </div>

      <div className="votre-solution">
        <div className="votre-solution-image">
          <Image src={propos} alt="a-propos" />
        </div>

        <div className="votre-solution-text">
          <h1>{t("propos_solution_title")}</h1>
          <p>{t("propos_solution_text")}</p>

          <div className="expertises">
            <div className="expertise">
              <div className="expertise-flex">
                <span>✓</span>
                <p>{t("propos_expertise_1")}</p>
              </div>
              <div className="expertise-flex">
                <span>✓</span>
                <p>{t("propos_expertise_2")}</p>
              </div>
            </div>
            <div className="expertise">
              <div className="expertise-flex">
                <span>✓</span>
                <p>{t("propos_expertise_3")}</p>
              </div>
              <div className="expertise-flex">
                <span>✓</span>
                <p>{t("propos_expertise_4")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fiab-qualite-tarif">
        <div className="fiabilite">
          <Image src={fiab} alt="fiabilité" />
          <h3>{t("propos_fiab_title")}</h3>
          <p>{t("propos_fiab_text")}</p>
        </div>
        <div className="fiabilite">
          <Image src={qualite} alt="qualité" />
          <h3>{t("propos_qualite_title")}</h3>
          <p>{t("propos_qualite_text")}</p>
        </div>
        <div className="fiabilite">
          <Image src={tarif} alt="tarif" />
          <h3>{t("propos_tarif_title")}</h3>
          <p>{t("propos_tarif_text")}</p>
        </div>
      </div>

      <div className="centre-complet">
        <div className="centre-complet-text">
          <h1>{t("propos_centre_title")}</h1>
          <p>{t("propos_centre_text")}</p>

          <div className="prise">
            <Image src={prise} alt="photo-1" />
            <span href="#" alt="prise en charge complète">
              <h3>{t("propos_prise_title")}</h3>
            </span>
            <span>↗</span>
          </div>

          <div className="plans">
            <Image src={plans} alt="photo-2" />
            <span href="#" alt="plans personnalisés">
              <h3>{t("propos_plans_title")}</h3>
            </span>
            <span>↗</span>
          </div>

          <div className="prevention">
            <Image src={prevention} alt="photo-3" />
            <span href="#" alt="prévention">
              <h3>{t("propos_prevention_title")}</h3>
            </span>
            <span>↗</span>
          </div>
        </div>

        <div className="centre-complet-image">
          <Image src={picone} alt="image" />
        </div>
      </div>
    </div>
  );
}

export default Propos;