import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseServiceCreateBody } from "@/lib/sanitize-service-input";

export async function GET() {
  try {
    const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(services);
  } catch (e) {
    console.error("GET /api/admin/services", e);
    return NextResponse.json(
      {
        error:
          "Failed to load services. If you recently updated the app, run `npx prisma db push` (or migrate) so the database matches the schema.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const data = parseServiceCreateBody(raw);
    const service = await prisma.service.create({ data });
    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? (error as { code: string }).code : "";
    console.error("POST /api/admin/services", error);
    if (code === "P2002") {
      return NextResponse.json({ error: "A service with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
