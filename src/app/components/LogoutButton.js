"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="text-white no-underline bg-[var(--main-blue)] px-4 py-2 border-4 border-[#4d96ae] rounded-xl font-normal transition-all duration-500 ease-in-out hover:bg-[var(--main-red)] hover:border-[#feddddce]"
      >
        Login
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-[#117090] font-semibold">{session.user.name}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="bg-[#fe1952] text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}