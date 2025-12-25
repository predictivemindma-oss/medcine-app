import { Suspense } from "react";
import AddServiceClient from "./AddServiceClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AddServiceClient />
    </Suspense>
  );
}
