import sql from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { connectionType, effectiveType, pingMs, jitterMs, downloadMbps, uploadMbps, score, quizResults, minPingMs, maxPingMs } = body;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
    const userAgent = req.headers.get("user-agent") ?? "";
    const userId = session?.userId ?? null;

    const rows = await sql`
      INSERT INTO speed_tests
        (connection_type, effective_type, ping_ms, jitter_ms, download_mbps, upload_mbps, ip_address, user_agent, score, quiz_results, min_ping_ms, max_ping_ms, user_id)
      VALUES
        (${connectionType}, ${effectiveType}, ${pingMs}, ${jitterMs}, ${downloadMbps}, ${uploadMbps ?? 0}, ${ip}, ${userAgent}, ${score ?? null}, ${quizResults ? JSON.stringify(quizResults) : null}, ${minPingMs ?? null}, ${maxPingMs ?? null}, ${userId})
      RETURNING id, created_at
    `;
    return Response.json(rows[0]);
  } catch (err) {
    console.error("POST /api/tests error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const userId = session?.userId ?? null;

  const rows = await sql`
    SELECT id, created_at, connection_type, effective_type, ping_ms, jitter_ms, download_mbps, upload_mbps, score, min_ping_ms, max_ping_ms, school_name, quiz_results
    FROM speed_tests
    WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
  `;
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM speed_tests WHERE user_id = ${userId}`;
  return Response.json({ tests: rows, total: count });
}
