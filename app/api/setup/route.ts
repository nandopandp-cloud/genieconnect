import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("Starting database setup...");

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

    console.log("✓ Users table created or already exists");

    // Check if users already exist
    const existing = await sql`SELECT COUNT(*)::int as count FROM users`;

    if (existing[0].count === 0) {
      console.log("Inserting demo users...");

      // Insert demo users
      await sql`
        INSERT INTO users (name, email, password_hash)
        VALUES
          (${'Fernando'}, ${'fernando@jovensgenios.com'}, ${'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d'}),
          (${'Nathália'}, ${'nathalia@gmail.com'}, ${'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d'}),
          (${'João'}, ${'joao.figueroa@jovensgenios.com'}, ${'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d'})
      `;

      console.log("✓ Demo users inserted");
    } else {
      console.log("✓ Users already exist, skipping insertion");
    }

    // Get all users
    const users = await sql`SELECT id, name, email FROM users ORDER BY created_at`;

    console.log("✓ Setup complete. Users in database:", users.length);

    return NextResponse.json({
      success: true,
      message: "Banco de dados configurado com sucesso!",
      users: users,
    });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json(
      { error: "Erro ao configurar banco de dados: " + String(err) },
      { status: 500 }
    );
  }
}
