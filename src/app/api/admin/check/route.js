import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  return NextResponse.json({ authenticated: true });
}
