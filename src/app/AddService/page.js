"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function AddService() {
    const [image, setImage] = useState(null); // new image file
    const [preview, setPreview] = useState(null); // preview for new image
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    const [isEdit, setIsEdit] = useState(false);
    const [existingImage, setExistingImage] = useState(""); // existing image url
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceId = searchParams.get("id"); // get id from query

    // If serviceId exists, we're editing
    useEffect(() => {
        if (!serviceId) return;
        setIsEdit(true);

        const fetchService = async () => {
            try {
                const response = await axios.get("/api/services");
                const service = response.data.services.find(s => s._id === serviceId);
                if (service) {
                    setTitle(service.title);
                    setDesc(service.desc);
                    setExistingImage(service.image); // store current image
                }
            } catch (err) {
                console.log("Error fetching service:", err);
            }
        };

        fetchService();
    }, [serviceId]);

    // Preview new selected image
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
            alert("Title and description are required!");
            return;
        }

        try {
            if (isEdit) {
                const formData = new FormData();
                formData.append("id", serviceId); // << ADD THIS
                formData.append("title", title);
                formData.append("desc", desc);
                if (image) formData.append("image", image); // only append if new image is selected
                await axios.patch("/api/services", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Service updated successfully!");
            } else {
                if (!image) {
                    alert("Image is required!");
                    return;
                }
                const formData = new FormData();
                formData.append("image", image);
                formData.append("title", title);
                formData.append("desc", desc);
                await axios.post("/api/services", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Service added successfully!");
            }

            router.push("/Services"); // redirect to Services list
        } catch (err) {
            console.log("Error saving service:", err);
        }
    };

    return (
        <div className="min-h-screen text-gray-600 flex flex-col items-center p-8">
            <h1 className="text-[#117090] text-2xl mb-2">{isEdit ? "Edit Service" : "Add New Service"}</h1>
            <form
                onSubmit={handleSubmit}
                className="bg-[rgba(129,184,196,0.4)] backdrop-blur-xl w-full sm:w-3/4 lg:w-1/2 mx-auto text-left flex flex-col rounded-[30px] p-6 text-[18px] font-semibold shadow-md"
            >
                {/* Image input */}
                <div>
                    {isEdit && existingImage && !preview && (
                        <img
                            src={existingImage}
                            alt="Current"
                            className="rounded-md mb-3 w-full object-cover h-48"
                        />
                    )}
                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            className="rounded-md mb-3 w-full object-cover h-48"
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-[90%] bg-white border-none rounded-md h-10 p-2 text-[16px] focus:outline-none focus:border-b-4 focus:border-[#d63b4a] hover:border-b-4 hover:border-[#d63b4a]"
                    />
                </div>

                <input
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    type="text"
                    placeholder="Service Title"
                    className="w-[90%] bg-white border-none rounded-md h-10 p-2 mt-2 text-[16px] placeholder:text-gray-500 focus:outline-none focus:border-b-4 focus:border-[#d63b4a] hover:border-b-4 hover:border-[#d63b4a]"
                />

                <input
                    onChange={(e) => setDesc(e.target.value)}
                    value={desc}
                    type="text"
                    placeholder="Service Description"
                    className="w-[90%] bg-white border-none rounded-md h-10 p-2 mt-2 text-[16px] placeholder:text-gray-500 focus:outline-none focus:border-b-4 focus:border-[#d63b4a] hover:border-b-4 hover:border-[#d63b4a]"
                />

                <button
                    type="submit"
                    className="bg-[#117090] text-white text-lg rounded-[20px] h-[50px] w-[70%] mx-auto mt-4 border-none transition-colors duration-300 hover:bg-[#d63b4a]"
                >
                    {isEdit ? "Save Changes" : "Add Service"}
                </button>
            </form>


        </div>
    );
}
