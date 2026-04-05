import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseServiceUpdateBody } from "@/lib/sanitize-service-input";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(service);
  } catch (e) {
    console.error("GET /api/admin/services/[id]", e);
    return NextResponse.json({ error: "Failed to load service" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const raw = await request.json();
    const data = parseServiceUpdateBody(raw);
    const service = await prisma.service.update({ where: { id }, data });
    return NextResponse.json(service);
  } catch (e) {
    console.error("PUT /api/admin/services/[id]", e);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
