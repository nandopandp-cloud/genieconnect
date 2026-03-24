import sql from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure speed_tests columns exist
    await sql`ALTER TABLE speed_tests ADD COLUMN IF NOT EXISTS school_name VARCHAR(255)`.catch(() => {});
    await sql`ALTER TABLE speed_tests ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL`.catch(() => {});

    // Hash the default password
    const hash = await bcrypt.hash("genie2024", 10);

    // Upsert demo users (insert or update password hash)
    const demoUsers = [
      { name: "Fernando", email: "fernando@jovensgenios.com" },
      { name: "Nathália", email: "nathalia@gmail.com" },
      { name: "João", email: "joao.figueroa@jovensgenios.com" },
    ];

    for (const u of demoUsers) {
      await sql`
        INSERT INTO users (name, email, password_hash)
        VALUES (${u.name}, ${u.email}, ${hash})
        ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}
      `;
    }

    const users = await sql`SELECT id, name, email FROM users ORDER BY created_at`;

    return NextResponse.json({
      success: true,
      message: "Banco de dados configurado com sucesso! Senha padrão: genie2024",
      users,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao configurar banco de dados: " + String(err) },
      { status: 500 }
    );
  }
}
