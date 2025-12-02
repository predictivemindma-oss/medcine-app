"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import ServicesList from "../components/ServicesList";
import { useTranslation } from "react-i18next";

export default function Services() {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vérifier l'authentification
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get("/api/auth/me");
                setUser(response.data.user);
            } catch (err) {
                console.log("Not authenticated:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const isDoctor = user?.role === "doctor";

    return (
        <main className="font-serif min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-white p-8">
            {/* Bouton Add Service visible uniquement pour doctor */}
            {!loading && isDoctor && (
                <div className="flex justify-start w-full max-w-5xl fixed top-30 z-50">
                    <Link 
                        href="/AddService" 
                        className="flex items-center gap-2 bg-[#117090] hover:bg-[#fe1952] text-white px-5 py-2 rounded-full shadow-lg transition"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            height="24px" 
                            viewBox="0 -960 960 960" 
                            width="24px" 
                            fill="#fff"
                        >
                            <path d="M640-121v-120H520v-80h120v-120h80v120h120v80H720v120h-80ZM160-240v-80h283q-3 21-2.5 40t3.5 40H160Zm0-160v-80h386q-23 16-41.5 36T472-400H160Zm0-160v-80h600v80H160Zm0-160v-80h600v80H160Z" />
                        </svg>
                        Ajouter un Service
                    </Link>
                </div>
            )}

            <ServicesList />

            <Link href="/Contact" className="contact-btn">
                {t("contact_us")}
            </Link>
        </main>
    );
}