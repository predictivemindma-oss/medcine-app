"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "../../styles/addservice.css";

export default function AddService() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [existingImage, setExistingImage] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false); // 🔹 pour éviter FOUC
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceId = searchParams.get("id");

    // ⚡ Appliquer les modifications côté client après mount
    useEffect(() => {
        setMounted(true);

        // Direction RTL/LTR
        document.documentElement.dir = i18n.dir();
        document.documentElement.lang = i18n.language;

        // Fix viewport pour éviter le zoom
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
    }, [i18n.language]);

    // Vérifier l'authentification
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get("/api/auth/me", {
                    withCredentials: true,
                });
                const userData = response.data.user;

                if (userData.role !== "doctor") {
                    alert("Accès refusé. Seuls les docteurs peuvent ajouter/modifier des services.");
                    router.push("/Services");
                    return;
                }

                setUser(userData);
                setLoading(false);
            } catch (err) {
                console.log("Not authenticated:", err);
                alert("Vous devez être connecté en tant que docteur.");
                router.push("/login");
            }
        };
        checkAuth();
    }, [router]);

    // Charger le service en mode édition
    useEffect(() => {
        if (!serviceId || loading || !user) return;
        setIsEdit(true);

        const fetchService = async () => {
            try {
                const response = await axios.get("/api/services");
                const service = response.data.services.find(s => s._id === serviceId);

                if (service) {
                    if (i18n.language === "ar") {
                        setTitle(service.title_ar || "");
                        setDesc(service.desc_ar || "");
                    } else {
                        setTitle(service.title || "");
                        setDesc(service.desc || "");
                    }
                    setExistingImage(service.image || "");
                }
            } catch (err) {
                console.log("Error fetching service:", err);
                alert("Erreur lors du chargement du service.");
            }
        };

        fetchService();
    }, [serviceId, loading, user, i18n.language]);

    // Preview de l'image
    useEffect(() => {
        if (!image) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(image);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [image]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentLang = i18n.language || "fr";

        if (!title || !desc) {
            alert(t("title_required"));
            return;
        }

        try {
            const formData = new FormData();
            formData.append("lang", currentLang);
            formData.append("title", title);
            formData.append("desc", desc);
            if (image) formData.append("image", image);
            if (isEdit && serviceId) formData.append("id", serviceId);

            if (isEdit) {
                const url = `/api/services?id=${serviceId}`;
                await axios.put(url, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Cache-Control": "no-cache"
                    },
                    withCredentials: true,
                });
                alert(t("service_updated"));
            } else {
                if (!image) {
                    alert(t("image_required"));
                    return;
                }

                await axios.post("/api/services", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                });
                alert(t("service_added"));
            }

            router.push("/Services");
        } catch (err) {
            console.error("Error saving service:", err);

            let errorMsg = t("save_error");

            if (err.response?.status === 401) {
                errorMsg = t("not_authenticated");
            } else if (err.response?.status === 403) {
                errorMsg = t("access_denied");
            } else if (err.response?.data?.error) {
                errorMsg = err.response.data.error;
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.message === "Network Error") {
                errorMsg = t("network_error");
            }

            alert(errorMsg);
        }
    };

    // Afficher loader
    if (!mounted || loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="spinner"></div>
                    <p className="loading-text">Vérification des permissions...</p>
                </div>
            </div>
        );
    }

    // Si pas doctor
    if (!user || user.role !== "doctor") return null;

    return (
        <div className="add-service-page">
            <h1 className="add-service-title">
                {isEdit ? t("edit_service") : t("add_new_service")}
            </h1>

            <form onSubmit={handleSubmit} className="add-service-form">
                {/* Image */}
                <div className="form-group">
                    <label className="form-label">
                        {t("service_image")}
                        {!isEdit && <span className="required-star">*</span>}
                    </label>

                    {isEdit && existingImage && !preview && (
                        <div className="image-preview">
                            <p className="preview-label">{t("current_image")}</p>
                            <img src={existingImage} alt="Current" className="preview-image" />
                        </div>
                    )}

                    {preview && (
                        <div className="image-preview">
                            <p className="preview-label">Nouvelle image :</p>
                            <img src={preview} alt="Preview" className="preview-image" />
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="form-input"
                    />

                    {isEdit && (
                        <p className="help-text">{t("leave_empty_to_keep")}</p>
                    )}
                </div>

                {/* Titre */}
                <div className="form-group">
                    <label className="form-label">
                        {t("title")} <span className="required-star">*</span>
                    </label>
                    <input
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        type="text"
                        placeholder={t("service_title")}
                        required
                        className="form-input"
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="form-label">
                        {t("description")} <span className="required-star">*</span>
                    </label>
                    <textarea
                        onChange={(e) => setDesc(e.target.value)}
                        value={desc}
                        placeholder={t("service_description")}
                        rows={6}
                        required
                        className="form-textarea"
                    />
                </div>

                {/* Boutons */}
                <div className="button-containerss">
                    <button
                        type="button"
                        onClick={() => router.push("/Services")}
                        className="btn-cancel"
                    >
                        {t("cancel")}
                    </button>
                    <button type="submit" className="btn-save">
                        {isEdit ? t("save") : t("save")}
                    </button>
                </div>
            </form>
        </div>
    );
}
