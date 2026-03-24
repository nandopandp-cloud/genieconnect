import sql from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM speed_tests WHERE id = ${parseInt(id, 10)}`;
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(rows[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const numId = parseInt(id, 10);

  const rows = await sql`SELECT user_id FROM speed_tests WHERE id = ${numId}`;
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
  if (rows[0].user_id !== session?.userId) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  await sql`DELETE FROM speed_tests WHERE id = ${numId}`;
  return Response.json({ ok: true });
}
