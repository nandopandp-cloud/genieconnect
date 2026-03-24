import bcrypt from "bcryptjs";
import sql from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!users.length) {
      return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const user = users[0] as { id: number; name: string; email: string; password_hash: string };
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    await createSession({
      userId: user.id,
      name: user.name,
      email: user.email,
    });

    return Response.json({ ok: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    return Response.json({ error: "Erro interno: " + String(err) }, { status: 500 });
  }
}
