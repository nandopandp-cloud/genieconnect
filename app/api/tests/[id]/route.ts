import sql from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM speed_tests WHERE id = ${parseInt(id, 10)}`;
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(rows[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM speed_tests WHERE id = ${parseInt(id, 10)}`;
  return Response.json({ ok: true });
}
