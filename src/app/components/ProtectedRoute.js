// components/ProtectedRoute.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, roles = [] }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login"); // redirection si pas connecté
    } else if (roles.length && !roles.includes(role)) {
      router.push("/"); // redirection si rôle non autorisé
    }
  }, []);

  return <>{children}</>;
}
