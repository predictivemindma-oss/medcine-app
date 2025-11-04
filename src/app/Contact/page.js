"use client";
import Image from "next/image";
import { Share } from 'next/font/google';
import { useTranslation } from "react-i18next";
import "../../styles/contact.css";

    const share = Share({ subsets: ['latin'], weight: '400' });


function Contact() {
  const { t } = useTranslation();

  return (
    <div className="contact-container">
      <h1 className={`${share.className} block text-[#009ca2] text-[35px] font-bolder relative w-1/2 mx-auto mb-[10px]`}>{t("contact_title")}</h1>
      <div className="desk-image">
        <Image src="/desk.jpg" alt="contact" width={1000} height={600} />
      </div>
      <div className="contact-numbers">
        <div className="fix">
          <div className="contact-icons">
            <Image src="/assets/icons/fix.png" alt="fix" width={40} height={40} />
          </div>
          <div>
            <span>{t("fix_label")}</span>
            <br />
            <a href="tel:0536696048" className="blue-spans">05 36 69 60 48</a>
          </div>
        </div>

        <div className="tel">
          <div className="contact-icons">
            <Image src="/assets/icons/tel.png" alt="tel" width={40} height={40} />
          </div>
          <div>
            <span>{t("tel_label")}</span>
            <br />
            <a href="tel:0660683266" className="blue-spans">06 60 68 32 66</a>
          </div>
        </div>

        <div className="local">
          <div className="contact-icons">
            <Image src="/assets/icons/local.png" alt="location" width={40} height={40} />
          </div>
          <div>
            <span>{t("local_label")}</span>
            <br />
            <span className="blue-spans">{t("local_value")}</span>
          </div>
        </div>
      </div>

      <div className="form-container">
        <h1>{t("contact_doc")}</h1>
        <form>
          <div className="labels">
            <label>
              <span>{t("prenom")}</span><br />
              <input type="text" name="prenom" required />
            </label>

            <label>
              <span>{t("nom")}</span><br />
              <input type="text" name="nom" required />
            </label>

            <label>
              <span>{t("email")}</span><br />
              <input type="email" name="email" required />
            </label>

            <label>
              <span>{t("numero")}</span><br />
              <input type="tel" name="numero" required placeholder="Ex: +212 6 12 34 56 78" />
            </label>
          </div>

          <label>
            <span>{t("services")}</span><br />
            <select name="service" required>
              <option value="">-- Choisissez un service --</option>
              <option value="consultation">Consultation générale</option>
              <option value="dermato">Dermatologie</option>
              <option value="analyse">Analyses / Bilans</option>
            </select>
          </label>

          <label>
            <h3>{t("message")}</h3><br />
            <textarea name="message" />
          </label>

          <button type="submit">{t("submit")}</button>
        </form>
      </div>
    </div>
  );
}

export default Contact;