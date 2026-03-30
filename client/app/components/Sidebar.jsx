"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BarChart2,
  FileText,
  User2,
  Video,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { icon: Home, href: "/dashboard", label: "Home", disabled: false },
    { icon: Video, href: "/session", label: "Presentation Hub", disabled: false },
    { icon: Video, href: "/my-videos", label: "My Videos", disabled: false },
    { icon: BarChart2, href: "/results", label: "Results", disabled: false },
    { icon: FileText, href: "/reports", label: "Feedback", disabled: false },
    { icon: User2, href: "/profile", label: "Profile", disabled: false },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-dark text-slate-100 flex flex-col z-40">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400/80 to-cyan-200/60"></div>

      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
              <img src="/logo1.png" alt="logo" className="w-9 h-9 relative z-10" />
            </div>
            <div>
              <span className="text-base font-semibold text-white">AI Coach</span>
              <p className="text-[10px] uppercase tracking-wide text-slate-300/80">Presentation Mastery</p>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col min-h-0 px-3 py-6 overflow-y-auto">
        <p className="px-3 pb-4 text-xs font-semibold uppercase tracking-widest text-slate-300/75">Menu</p>
        <div className="flex flex-col gap-2.5 flex-1">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/dashboard");

            return (
              <Link key={index} href={item.href} prefetch={item.href === "/results" || item.href === "/reports" ? false : undefined}>
                <div
                  className={`flex items-center gap-3.5 px-4 py-3.5 text-[15px] leading-snug font-semibold cursor-pointer transition-all duration-200 rounded-xl border
                    ${isActive
                      ? "bg-white/15 border-white/25 text-white shadow-md"
                      : "border-transparent text-slate-200/90 hover:text-white hover:bg-white/10"
                    }
                    ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}
                  `}
                >
                  <Icon
                    size={22}
                    className={`shrink-0 ${isActive ? "text-white" : "text-slate-300"}`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.disabled && (
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-200">Soon</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-3 py-5 border-t border-white/10 mt-auto">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 text-[15px] font-semibold text-white rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
