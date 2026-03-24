import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const { testId, school } = await req.json();

  try {
    await sql`
      UPDATE speed_tests SET school_name = ${school}
      WHERE id = ${testId}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
