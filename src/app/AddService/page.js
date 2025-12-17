"use client";
export const dynamic = "force-dynamic";



import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";


export default function AddService() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [existingImage, setExistingImage] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
        const { t } = useTranslation();

    const serviceId = searchParams.get("id");

    // Vérifier l'authentification et le rôle
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get("/api/auth/me", {
                    withCredentials: true, // Important pour envoyer les cookies
                });
                const userData = response.data.user;
                
                // Si l'utilisateur n'est pas doctor, rediriger
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

    // Charger le service si on est en mode édition

useEffect(() => {
    if (!serviceId || loading || !user) return;
    setIsEdit(true);

    const fetchService = async () => {
        try {
            const response = await axios.get("/api/services");
            const service = response.data.services.find(s => s._id === serviceId);

            if (service) {
                // En arabe, on récupère strictement les champs_ar
                if (i18n.language === "ar") {
                    setTitle(service.title_ar || ""); // jamais undefined

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

    // Validation selon la langue active
    const currentLang = i18n.language || "fr";
    
    // Pour toutes les langues, on valide que les champs ne sont pas vides
    if (!title || !desc) {
        alert(t("title_required"));
        return;
    }

    try {
        const formData = new FormData();

        // Toujours envoyer la langue pour que l'API sache comment traiter les données
        formData.append("lang", currentLang);

        // Ajouter les champs selon la langue
        if (currentLang === "fr") {
            formData.append("title", title);
            formData.append("desc", desc);
        } else if (currentLang === "ar") {
            // En mode arabe, on envoie aussi 'title' et 'desc' 
            // L'API les interprétera comme title_ar et desc_ar grâce au paramètre 'lang'
            formData.append("title", title);  // Devient title_ar côté API
            formData.append("desc", desc);    // Devient desc_ar côté API
        }

        // Ajouter l'image si elle existe
        if (image) formData.append("image", image);

        // Ajouter l'ID pour l'édition
        if (isEdit && serviceId) {
            formData.append("id", serviceId);
        }

        // IMPORTANT: Utiliser PUT pour l'API (pas PATCH)
        if (isEdit) {
            // Construire l'URL avec l'ID comme query parameter
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
            // Création : vérifier l'image
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

        // Redirection
        router.push("/Services");
        
    } catch (err) {
        console.error("Error saving service:", err);
        
        // Meilleure gestion des erreurs
        let errorMsg = t("save_error"); // Message par défaut
        
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



    // Afficher un loader pendant la vérification
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#117090] mx-auto mb-4"></div>
                    <p className="text-xl text-[#117090]">Vérification des permissions...</p>
                </div>
            </div>
        );
    }

    // Si pas doctor, ne rien afficher (redirection en cours)
    if (!user || user.role !== "doctor") {
        return null;
    }

    return (
        <div className="min-h-screen text-gray-600 flex flex-col items-center p-8 pt-24">
            <h1 className="text-[#117090] text-3xl font-bold mb-6">
    {isEdit ? t("edit_service") : t("add_new_service")}
            </h1>
            <form
                onSubmit={handleSubmit}
                className="bg-[rgba(129,184,196,0.4)] backdrop-blur-xl w-full sm:w-3/4 lg:w-1/2 mx-auto text-left flex flex-col rounded-[30px] p-6 text-[18px] font-semibold shadow-md"
            >
                {/* Affichage de l'image */}
                <div className="mb-4">
                    <label className="block text-[#117090] mb-2">
                        {t("service_image")} {!isEdit && <span className="text-red-500">*</span>}
                    </label>
                    {isEdit && existingImage && !preview && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">{t("current_image")}</p>
                            <img
                                src={existingImage}
                                alt="Current"
                                className="rounded-md w-full object-cover h-48"
                            />
                        </div>
                    )}
                    {preview && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Nouvelle image :</p>
                            <img
                                src={preview}
                                alt="Preview"
                                className="rounded-md w-full object-cover h-48"
                            />
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full bg-white border-none rounded-md h-10 p-2 text-[16px] focus:outline-none focus:border-b-4 focus:border-[#d63b4a] hover:border-b-4 hover:border-[#d63b4a]"
                    />
                    {isEdit && (
                        <p className="text-sm text-gray-500 mt-1">
                            {t("leave_empty_to_keep")}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-[#117090] mb-2">
                        {t("title")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        type="text"
                        placeholder={t("service_title")}
                        required
                        className="w-full bg-white border-none rounded-md h-10 p-2 text-[16px] placeholder:text-gray-500 focus:outline-none focus:border-b-4 focus:border-[#d63b4a] hover:border-b-4 hover:border-[#d63b4a]"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-[#117090] mb-2">
                        {t("description")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        onChange={(e) => setDesc(e.target.value)}
                        value={desc}
                        placeholder={t("service_description")}
                        rows={6}
                        required
                        className="w-full bg-white border-none rounded-md p-2 text-[16px] placeholder:text-gray-500 focus:outline-none focus:border-b-4 focus:border-[#d63b4a] hover:border-b-4 hover:border-[#d63b4a] resize-vertical"
                    />
                </div>

                <div className="flex gap-4 justify-center mt-4">
                    <button
                        type="button"
                        onClick={() => router.push("/Services")}
                        className="bg-gray-400 text-white text-lg rounded-[20px] h-[50px] px-8 border-none transition-colors duration-300 hover:bg-[#d63b4a]"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        type="submit"
                        className="bg-[#117090] text-white text-lg rounded-[20px] h-[50px] px-8 border-none transition-colors duration-300 "
                    >
                              {isEdit ? t("save") : t("cancelled")}

                    </button>
                </div>
            </form>
        </div>
    );
}