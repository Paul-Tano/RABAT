'use client';
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Users, LayoutDashboard, LogOut, User, House, Menu } from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminLayoutClient({ 
  children, 
  session 
}: { 
  children: React.ReactNode;
  session: any;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Comptes", href: "/admin/accounts", icon: Users },
    { name: "Films", href: "/admin/films", icon: Film },
    { name: "Retour au site", href: "/", icon: House }
  ];

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100 font-sans">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-[#151518] border-r border-zinc-800/60 flex flex-col justify-between
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="p-6 border-b border-zinc-800/60">
            <Link href="/admin" className="flex flex-col" onClick={() => setSidebarOpen(false)}>
              <span className="text-2xl font-black tracking-wider text-[#E25814]">
                RABAT
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">
                Panel Admin
              </span>
            </Link>
          </div>

          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href)) &&
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#ea580c]/20 to-[#f97316]/10 text-orange-500 pl-3"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-zinc-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800/60 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
            <Link href="/profile" onClick={() => setSidebarOpen(false)}>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate text-zinc-200">
                  {session?.user?.username || "Utilisateur"}
                </span>
                <span className="text-[10px] text-zinc-500 truncate">
                  {session?.user?.email || "email@exemple.com"}
                </span>
              </div>
            </Link>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-red-400 transition-colors cursor-pointer w-full"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="h-16 border-b border-zinc-800/60 bg-[#151518]/50 backdrop-blur-md flex items-center justify-between px-6">
          <span className="text-xl font-black text-[#E25814] md:hidden">RABAT</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}