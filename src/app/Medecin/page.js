"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "../../styles/medecin.css"
function Medecin() {
const { t } = useTranslation();

    return (
        <div className="medecin-container">
            <div className="contact-info">
                <div className="doc-img">
                    <Image src="/doc.jpg" alt="doctor" width={300} height={400} />
                </div>
                <div className="contact-text">
                    <i>{t("medecin_specialite")}</i>
                      <h3 className="!text-[#009ca2] font-semibold text-[x-large]"> 
                        {t("medecin_contact_title")}</h3>
                    <p>{t("medecin_tel")}</p>
                    <p>{t("medecin_fix")}</p>
                    <p>{t("medecin_local")}
                    </p>
                    <Link href="/Contact" className="block text-center text-white text-center mt-1 bg-[#009ca2] px-6 py-2.5 rounded-[18px] transition-colors duration-300 hover:bg-[#fe1952]">
                        {t("appointment")}
                    </Link>
                </div>
            </div>

            <div className="intro">
                <h3>{t("doc_name")}</h3>
                <p>{t("medecin_intro")}</p>

                <h3>{t("medecin_experience_title")}</h3>
                <ul>
                    <li>{t("medecin_experience_1")}</li>
                    <li>{t("medecin_experience_2")}</li>
                    <li>{t("medecin_experience_3")}</li>
                    <li>{t("medecin_experience_4")}</li>
                    <li>{t("medecin_experience_5")}</li>
                </ul>

                <h3>{t("medecin_formation_title")}</h3>
                <ul>
                    <li>{t("medecin_formation_1")}</li>
                    <li>{t("medecin_formation_2")}</li>
                    <li>{t("medecin_formation_3")}</li>
                </ul>
            </div>
        </div>
    );
}

export default Medecin;