"use client";

// import { getServerSession } from "next-auth";
// import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import morocco from "../../../public/assets/morocco.png";
import france from "../../../public/assets/france.png";
import LogoutButton from "./LogoutButton"
import { useSession } from "next-auth/react";
import "../../styles/navbar.css"

export default function Navbar() {
  const [isCLicked, setIsClicked] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { data: session } = useSession();

  const toggleNavbar = () => {
    if (isCLicked) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setIsClicked(false);
      }, 300)
    } else {
      setIsClicked(true);
    }
  }
  const pathname = usePathname();
  const { t } = useTranslation();

  const toggleLang = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };
  const baseStyle = "relative text-[#117090] font-[500] text-xl transition-colors duration-200 ease-in-out hover:text-[#fe1952] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-[#fe1952] after:transition-all after:duration-500 after:ease-in-out";
  // const session = await getServerSession(authOptions);

  return (
    <>
      <nav className="relative top-[5px] my-4 h-[90px] rounded-[20px] backdrop-blur-[20px] !items-center text-center">
        <div className="max-w-8xl mx-auto px-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[90px] px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image src="/logo.png" alt="logo" width={90} height={90} />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-6 max-[1000px]:hidden">
                <Link href="/" className={`${baseStyle} ${pathname === "/" ? "font-semibold text-[#fe1952]" : ""}`}>{t("home")}</Link>
                <Link href="/Apropos" className={`${baseStyle} ${pathname === "/Apropos" ? "font-semibold text-[#fe1952]" : ""}`}>{t("about")}</Link>
                <Link href="/Services" className={`${baseStyle} ${pathname === "/Services" ? "font-semibold text-[#fe1952]" : ""}`}>{t("services")}</Link>
                <Link href="/Medecin" className={`${baseStyle} ${pathname === "/Medecin" ? "font-semibold text-[#fe1952]" : ""}`}>{t("doctor")}</Link>
                <Link href="/Contact" className={`${baseStyle} ${pathname === "/Contact" ? "font-semibold text-[#fe1952]" : ""}`}>{t("contact")}</Link>
                {(session?.user?.role === "doctor" || session?.user?.role === "assistant") && (
                  <Link href="/Reservations" className={`${baseStyle} ${pathname === "/Reservations" ? "font-semibold text-[#fe1952]" : ""}`}>{t("reservations")}</Link>
                )}
              </div>
            </div>
            <LogoutButton />
            <div className="flex items-center max-[1300px]:hidden">
              <Link href="/Contact" className="text-white no-underline bg-[var(--main-blue)] px-4 py-2 border-4 border-[#4d96ae] rounded-xl font-normal transition-all duration-500 ease-in-out hover:bg-[var(--main-red)] hover:border-[#feddddce]" >{t("appointment")}</Link>
            </div>
            <div className="flex items-center">
              <div className="flex flex-col h-15 justify-between max-[1000px]:hidden">
                <Image src={morocco} alt="ar" width={25} className="cursor-pointer" onClick={() => toggleLang("ar")} />
                <Image src={france} alt="fr" width={25} className="cursor-pointer" onClick={() => toggleLang("fr")} />
              </div>
            </div>
            <div className="flex items-center max-[1000px]:flex hidden">
              <button className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-inset" onClick={toggleNavbar}>
                {isCLicked ? <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#fe1952"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#fe1952"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" /></svg>}
              </button>
            </div>
          </div>
        </div>

        {(isCLicked || isClosing) && (
          <div
            className="mobile-menu"
            style={{
              animation: `${isCLicked ? "dropdown" : "dropdownClose"} 0.3s ease forwards`,
            }}
          >
            <div className="flex flex-col space-y-6">
              <Link href="/" className={`${baseStyle} ${pathname === "/" ? "font-semibold text-[#fe1952]" : ""} block w-full`}>{t("home")}</Link>
              <Link href="/Apropos" className={`${baseStyle} ${pathname === "/Apropos" ? "font-semibold text-[#fe1952]" : ""} block w-full`}>{t("about")}</Link>
              <Link href="/Services" className={`${baseStyle} ${pathname === "/Services" ? "font-semibold text-[#fe1952]" : ""} block w-full`}>{t("services")}</Link>
              <Link href="/Medecin" className={`${baseStyle} ${pathname === "/Medecin" ? "font-semibold text-[#fe1952]" : ""} block w-full`}>{t("doctor")}</Link>
              <Link href="/Contact" className={`${baseStyle} ${pathname === "/Contact" ? "font-semibold text-[#fe1952]" : ""} block w-full`}>{t("contact")}</Link>
              {(session?.user?.role === "doctor" || session?.user?.role === "assistant") && (
                <Link href="/Reservations" className={`${baseStyle} ${pathname === "/Reservations" ? "font-semibold text-[#fe1952]" : ""} block w-full`}>{t("reservations")}</Link>
              )}
              <div className="flex flex-row items-center gap-8 mt-2 justify-center">
                <Image src={morocco} alt="ar" width={25} className="cursor-pointer" onClick={() => toggleLang("ar")} />
                <Image src={france} alt="fr" width={25} className="cursor-pointer" onClick={() => toggleLang("fr")} />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}