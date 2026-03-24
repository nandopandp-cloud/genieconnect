import { revalidatePath } from "next/cache";
import sql from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { schoolName } = await req.json();
    await sql`
      UPDATE speed_tests SET school_name = ${schoolName ?? null}
      WHERE id = ${parseInt(id, 10)}
    `;
    revalidatePath("/inicio");
    revalidatePath("/relatorios");
    revalidatePath(`/relatorios/${id}`);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
