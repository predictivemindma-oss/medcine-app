"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import "../../styles/LoadingOverlay.css";

export default function LoadingOverlay({ show = false }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href && !target.target) {
        const url = new URL(target.href);
        if (url.pathname !== pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [pathname]);

  if (!loading && !show) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="logo-container">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={60} 
            height={60}
            className="loading-logo"
          />
        </div>
      </div>
    </div>
  );
}