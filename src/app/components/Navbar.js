"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import morocco from "../../../public/assets/morocco.png";
import france from "../../../public/assets/france.png";
import "../../styles/navbar.css";
import LoginModal from "../models/LoginModal";

export default function Navbar() {
  const [isCLicked, setIsClicked] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // États pour l'authentification
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const router = useRouter();

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setUserRole(data.user.role);
        setUserEmail(data.user.email);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserEmail(null);
      }
    } catch (err) {
      console.error(err);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserEmail(null);
        router.push("/");
      }
    } catch (err) {
      console.error("Erreur logout:", err);
      alert("Erreur lors de la déconnexion");
    }
  };

  const toggleNavbar = () => {
    if (isCLicked) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setIsClicked(false);
      }, 300);
    } else {
      setIsCLicked(true);
    }
  };

  const pathname = usePathname();
  const { t } = useTranslation();

  const toggleLang = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => {
    setShowLoginModal(false);
    checkAuth(); // Recharger l'état d'authentification après login
  };

  const baseStyle =
    "relative text-[#117090] font-[500] text-xl transition-colors duration-200 ease-in-out hover:text-[#fe1952] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-[#fe1952] after:transition-all after:duration-500 after:ease-in-out";

  return (
    <>
      <nav className="relative top-[5px] my-4 h-[90px] rounded-[20px] backdrop-blur-[20px] !items-center text-center">
        <div className="max-w-6xl mx-auto px-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[90px] px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image src="/logo.png" alt="logo" width={90} height={90} />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-6 max-[900px]:hidden">
                <Link
                  href="/"
                  className={`${baseStyle} ${pathname === "/" ? "font-semibold text-[#fe1952]" : ""}`}
                >
                  {t("home")}
                </Link>
                <Link
                  href="/Apropos"
                  className={`${baseStyle} ${pathname === "/Apropos" ? "font-semibold text-[#fe1952]" : ""}`}
                >
                  {t("about")}
                </Link>
                <Link
                  href="/Services"
                  className={`${baseStyle} ${pathname === "/Services" ? "font-semibold text-[#fe1952]" : ""}`}
                >
                  {t("services")}
                </Link>
                <Link
                  href="/Medecin"
                  className={`${baseStyle} ${pathname === "/Medecin" ? "font-semibold text-[#fe1952]" : ""}`}
                >
                  {t("doctor")}
                </Link>
                <Link
                  href="/Contact"
                  className={`${baseStyle} ${pathname === "/Contact" ? "font-semibold text-[#fe1952]" : ""}`}
                >
                  {t("contact")}
                </Link>
              </div>
            </div>
            <div className="flex items-center max-[1100px]:hidden space-x-4">
              <Link
                href="/Contact"
                className="text-white no-underline bg-[var(--main-blue)] px-4 py-2 border-4 border-[#4d96ae] rounded-xl font-normal transition-all duration-500 ease-in-out hover:bg-[var(--main-red)] hover:border-[#feddddce] whitespace-nowrap"
              >
                {t("appointment")}
              </Link>

              {/* Affichage conditionnel : Login ou Info utilisateur + Logout */}
              {isLoggedIn ? (
                <div className="flex items-center space-x-3 min-w-0">

                  {userRole && (
                    <span className="text-xs bg-[var(--main-blue)] text-white px-2 py-1 rounded whitespace-nowrap">
                      {userRole === "doctor" ? "🩺 Dr.Ouafae" : "👨‍💼 Assistant"}
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-white bg-[var(--main-red)] px-4 py-2 border-4 border-[#feddddce] rounded-xl font-normal transition-all duration-500 ease-in-out hover:bg-[#d01444] whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="text-white bg-[var(--main-blue)] px-4 py-2 border-4 border-[#4d96ae] rounded-xl font-normal transition-all duration-500 ease-in-out hover:bg-[var(--main-red)] hover:border-[#feddddce] whitespace-nowrap"
                >
                  {t("login")}
                </button>
              )}
            </div>
            <div className="flex items-center">
              <div className="flex flex-col h-15 justify-between max-[900px]:hidden">
                <Image
                  src={morocco}
                  alt="ar"
                  width={25}
                  className="cursor-pointer"
                  onClick={() => toggleLang("ar")}
                />
                <Image
                  src={france}
                  alt="fr"
                  width={25}
                  className="cursor-pointer"
                  onClick={() => toggleLang("fr")}
                />
              </div>
            </div>
            <div className="flex items-center max-[900px]:flex hidden">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-inset"
                onClick={toggleNavbar}
              >
                {isCLicked ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill="#fe1952"
                  >
                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill="#fe1952"
                  >
                    <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                  </svg>
                )}
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
              <Link
                href="/"
                className={`${baseStyle} ${pathname === "/" ? "font-semibold text-[#fe1952]" : ""} block w-full`}
              >
                {t("home")}
              </Link>
              <Link
                href="/Apropos"
                className={`${baseStyle} ${pathname === "/Apropos" ? "font-semibold text-[#fe1952]" : ""} block w-full`}
              >
                {t("about")}
              </Link>
              <Link
                href="/Services"
                className={`${baseStyle} ${pathname === "/Services" ? "font-semibold text-[#fe1952]" : ""} block w-full`}
              >
                {t("services")}
              </Link>
              <Link
                href="/Medecin"
                className={`${baseStyle} ${pathname === "/Medecin" ? "font-semibold text-[#fe1952]" : ""} block w-full`}
              >
                {t("doctor")}
              </Link>
              <Link
                href="/Contact"
                className={`${baseStyle} ${pathname === "/Contact" ? "font-semibold text-[#fe1952]" : ""} block w-full`}
              >
                {t("contact")}
              </Link>

              {/* Login/Logout dans le menu mobile */}
              {isLoggedIn ? (
                <div className="flex flex-col space-y-2">
                  <div className="text-[var(--main-blue)] font-semibold text-center">
                    {userRole === "doctor" ? "🩺 Docteur" : "👨‍💼 Assistant"}
                  </div>
                  <div className="text-[var(--main-blue)] text-sm text-center mb-2">
                    {userRole === "doctor" ? "Dr." : ""} {userEmail}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white bg-[var(--main-red)] px-4 py-2 rounded-xl"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="text-white bg-[var(--main-blue)] px-4 py-2 rounded-xl"
                >
                  {t("login")}
                </button>
              )}

              <div className="flex flex-row items-center gap-8 mt-2 justify-center">
                <Image
                  src={morocco}
                  alt="ar"
                  width={25}
                  className="cursor-pointer"
                  onClick={() => toggleLang("ar")}
                />
                <Image
                  src={france}
                  alt="fr"
                  width={25}
                  className="cursor-pointer"
                  onClick={() => toggleLang("fr")}
                />
              </div>
            </div>
          </div>
        )}
      </nav>

      {showLoginModal && <LoginModal closeModal={closeLoginModal} />}
    </>
  );
}