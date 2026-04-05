"use client";

import { Suspense } from "react";
import TeamFormPage from "../team-form-page";

export default function EditTeamPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <TeamFormPage />
    </Suspense>
  );
}
