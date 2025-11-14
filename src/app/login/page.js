"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Call NextAuth signIn with "credentials" provider
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            // Must include "callbackUrl" to redirect later
            callbackUrl: "/dashboard",
        });

        if (res?.error) {
            setError("Invalid credentials");
        } else {
            // Redirect manually if needed
            router.push(res?.url || "/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center  p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative">
                <h1 className="text-3xl font-bold text-[#009ca2] mb-6 text-center">Welcome </h1>
                <p className="text-center text-gray-600 mb-6">Login with your credentials</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ca2]"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ca2]"
                        required
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="bg-[#009ca2] hover:bg-[#007f89] text-white font-semibold p-3 rounded-lg transition-colors duration-200 mb-8"
                    >
                        Login
                    </button>
                </form>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
                    &copy; 2025 Medecin Diabetologie
                </div>
            </div>
        </div>
    );
}