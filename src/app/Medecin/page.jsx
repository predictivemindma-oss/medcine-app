// src/app/Medecin/page.jsx
import { Suspense } from "react";
import MedecinClient from "./MedecinClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <MedecinClient />
    </Suspense>
  );
}
