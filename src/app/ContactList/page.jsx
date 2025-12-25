import { Suspense } from "react";
import ContactListClient from "./ContactListClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ContactListClient />
    </Suspense>
  );
}
