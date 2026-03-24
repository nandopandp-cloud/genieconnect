import { revalidatePath } from "next/cache";
import sql from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;
    const numId = parseInt(id, 10);
    const { schoolName } = await req.json();

    const rows = await sql`SELECT user_id FROM speed_tests WHERE id = ${numId}`;
    if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
    if (rows[0].user_id !== session?.userId) {
      return Response.json({ error: "Não autorizado" }, { status: 403 });
    }

    await sql`
      UPDATE speed_tests SET school_name = ${schoolName ?? null}
      WHERE id = ${numId}
    `;
    revalidatePath("/inicio");
    revalidatePath("/relatorios");
    revalidatePath(`/relatorios/${id}`);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
