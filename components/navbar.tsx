import { getSession } from "@/lib/auth";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const session = await getSession();
  return (
    <NavbarClient
      userName={session?.name ?? "Usuário"}
      userEmail={session?.email ?? ""}
    />
  );
}
