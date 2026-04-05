"use client";

import { Suspense } from "react";
import TestimonialFormPage from "../new/page";

export default function EditTestimonialPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <TestimonialFormPage />
    </Suspense>
  );
}
