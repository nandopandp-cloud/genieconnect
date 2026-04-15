"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BarChart2, ChevronDown, LogOut } from "lucide-react";

interface Props {
  userName: string;
  userEmail: string;
}

export function NavbarClient({ userName, userEmail }: Props) {
  const path = usePathname();
  const router = useRouter();
  const isActive = (href: string) => path === href || path.startsWith(href + "/");
  const initial = userName.charAt(0).toUpperCase();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm animate-fade-down">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/inicio" className="flex items-center gap-2">
          <Image src="/geniebot.png" alt="GenieBot" width={36} height={36} className="flex-shrink-0" />
          <span className="font-bold text-lg tracking-tight">
            <span className="text-gray-900">Genie</span>
            <span className="text-sky-500">Connect</span>
          </span>
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-1">
          <Link
            href="/inicio"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
              isActive("/inicio")
                ? "bg-sky-50 text-sky-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard size={16} />
            Início
            {isActive("/inicio") && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sky-500 rounded-full" />
            )}
          </Link>
          <Link
            href="/relatorios"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
              isActive("/relatorios")
                ? "bg-sky-50 text-sky-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BarChart2 size={16} />
            Relatórios
            {isActive("/relatorios") && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sky-500 rounded-full" />
            )}
          </Link>
        </div>

        {/* User area */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 group">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #38BDF8)" }}
            >
              {initial}
            </div>
            {/* Name + email */}
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-800">{userName}</span>
              <span className="text-xs text-gray-400">{userEmail}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
            title="Sair"
          >
            <LogOut size={15} />
            <span className="hidden md:inline font-medium">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
