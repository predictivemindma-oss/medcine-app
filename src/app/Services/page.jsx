import { Suspense } from "react";
import ServicesClient from "./ServicesClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ServicesClient />
    </Suspense>
  );
}
