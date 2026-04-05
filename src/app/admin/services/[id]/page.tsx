"use client";

import { Suspense } from "react";
import ServiceFormPage from "../new/page";

export default function EditServicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <ServiceFormPage />
    </Suspense>
  );
}
