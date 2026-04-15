import sql from "@/lib/db";
import { NextResponse } from "next/server";
import { calculateScore, getScoreInfo } from "@/lib/score";

export async function POST(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== (process.env.ADMIN_SECRET ?? "genie-admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Add score_label column if it doesn't exist
    await sql`ALTER TABLE speed_tests ADD COLUMN IF NOT EXISTS score_label VARCHAR(50)`.catch(() => {});

    // Fetch all tests with the raw metrics
    const tests = await sql`
      SELECT id, ping_ms, jitter_ms, download_mbps, upload_mbps
      FROM speed_tests
    `;

    let updated = 0;
    for (const t of tests) {
      const score = calculateScore(
        Number(t.ping_ms),
        Number(t.jitter_ms),
        Number(t.download_mbps),
        Number(t.upload_mbps ?? 0)
      );
      const label = getScoreInfo(score).label;

      await sql`
        UPDATE speed_tests
        SET score = ${score}, score_label = ${label}
        WHERE id = ${t.id}
      `;
      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("recalculate-scores error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
