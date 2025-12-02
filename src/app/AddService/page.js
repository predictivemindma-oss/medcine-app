"use client";
export const dynamic = "force-dynamic";



import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function AddService() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [existingImage, setExistingImage] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const searchParams = useSearchParams();
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
                    setTitle(service.title);
                    setDesc(service.desc);
                    setExistingImage(service.image);
                }
            } catch (err) {
                console.log("Error fetching service:", err);
                alert("Erreur lors du chargement du service.");
            }
        };

        fetchService();
    }, [serviceId, loading, user]);

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

        if (!title || !desc) {
            alert("Le titre et la description sont obligatoires !");
            return;
        }

        // Double vérification côté client
        if (user?.role !== "doctor") {
            alert("Vous n'avez pas la permission d'effectuer cette action.");
            return;
        }

        try {
            const formData = new FormData();
            
            if (isEdit) {
                formData.append("id", serviceId);
                formData.append("title", title);
                formData.append("desc", desc);
                if (image) formData.append("image", image);
                
                await axios.patch("/api/services", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                });
                alert("Service mis à jour avec succès !");
            } else {
                if (!image) {
                    alert("L'image est obligatoire pour un nouveau service !");
                    return;
                }
                formData.append("image", image);
                formData.append("title", title);
                formData.append("desc", desc);
                
             // Pour POST
await axios.post("/api/services", formData, {
  withCredentials: true, // envoie les cookies
});

await axios.patch("/api/services", formData, {
  withCredentials: true,
});

                alert("Service ajouté avec succès !");
            }

            router.push("/Services");
        } catch (err) {
            console.error("Error saving service:", err);
            const errorMsg = err.response?.data?.message || "Erreur lors de l'enregistrement du service.";
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
                {isEdit ? "Modifier le Service" : "Ajouter un Nouveau Service"}
            </h1>
            <form
                onSubmit={handleSubmit}
                className="bg-[rgba(129,184,196,0.4)] backdrop-blur-xl w-full sm:w-3/4 lg:w-1/2 mx-auto text-left flex flex-col rounded-[30px] p-6 text-[18px] font-semibold shadow-md"
            >
                {/* Affichage de l'image */}
                <div className="mb-4">
                    <label className="block text-[#117090] mb-2">
                        Image du Service {!isEdit && <span className="text-red-500">*</span>}
                    </label>
                    {isEdit && existingImage && !preview && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Image actuelle :</p>
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
                            Laissez vide pour garder l'image actuelle
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-[#117090] mb-2">
                        Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        type="text"
                        placeholder="Titre du Service"
                        required
                        className="w-full bg-white border-none rounded-md h-10 p-2 text-[16px] placeholder:text-gray-500 focus:outline-none focus:border-b-4 focus:border-[#d63b4a] hover:border-b-4 hover:border-[#d63b4a]"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-[#117090] mb-2">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        onChange={(e) => setDesc(e.target.value)}
                        value={desc}
                        placeholder="Description du Service"
                        rows={6}
                        required
                        className="w-full bg-white border-none rounded-md p-2 text-[16px] placeholder:text-gray-500 focus:outline-none focus:border-b-4 focus:border-[#d63b4a] hover:border-b-4 hover:border-[#d63b4a] resize-vertical"
                    />
                </div>

                <div className="flex gap-4 justify-center mt-4">
                    <button
                        type="button"
                        onClick={() => router.push("/Services")}
                        className="bg-gray-400 text-white text-lg rounded-[20px] h-[50px] px-8 border-none transition-colors duration-300 hover:bg-gray-500"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="bg-[#117090] text-white text-lg rounded-[20px] h-[50px] px-8 border-none transition-colors duration-300 hover:bg-[#d63b4a]"
                    >
                        {isEdit ? "💾 Enregistrer" : "➕ Ajouter"}
                    </button>
                </div>
            </form>
        </div>
    );
}