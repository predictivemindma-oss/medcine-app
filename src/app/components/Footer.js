"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import logo from "../../../public/assets/logo.png";
import ig from "../../../public/assets/icons/ig-icon.png";
import fb from "../../../public/assets/icons/fb-icon.png";
import local from "../../../public/assets/icons/local-icon.png";
import phone from "../../../public/assets/icons/phone-icon-fill.png";

export default function Footer() {
const { t } = useTranslation();

  return (
    <div className="footer-container">
      <div className="footer">
        <div className="social-media">
          <Image src={logo} alt="logo" width={100} height={100} />
          <p>{t("follow_us")}</p>
          <div className="media-icons">
            <Image src={ig} alt="instagram" width={40} height={40} className="footer-icon" />
            <Image src={fb} alt="facebook" width={40} height={40} className="footer-icon" />
          </div>
        </div>

        <div className="mobile-pages">
          <div className="pages-flex">
            <h2>{t("pages_title")}</h2>
            <Link href="/">{t("home")}</Link>
            <Link href="/Apropos">{t("about_us")}</Link>
            <Link href="/Services">{t("services")}</Link>
            <Link href="/">{t("page_faq")}</Link>
          </div>
          <div className="cms-pages">
            <h2>{t("cms_pages_title")}</h2>
            <Link href="/Medecin">{t("doctor")}</Link>
            <Link href="/Contact">{t("contact")}</Link>
          </div>
        </div>

        <div className="address">
          <h2>{t("address_title")}</h2>
          <div className="phone">
            <Image src={phone} alt="phone" width={40} height={40} className="footer-icon" />
            <a href="tel:05 36 69 60 48">05 36 69 60 48</a>
          </div>
          <div className="local">
            <Image src={local} alt="location" width={40} height={40} className="footer-icon" />
            <span>{t("location")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}