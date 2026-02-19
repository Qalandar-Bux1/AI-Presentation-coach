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
    <aside className="fixed left-0 top-0 h-full w-64 glass shadow-glass flex flex-col z-40">
      {/* Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 btn-gradient"></div>

      {/* Logo Section */}
      <div className="px-5 py-5 border-b border-white/20">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative p-2.5 btn-gradient rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-glass">
              <img src="/logo1.png" alt="logo" className="w-9 h-9 relative z-10" />
            </div>
            <div>
              <span className="text-lg font-bold text-gradient">
                AI Coach
              </span>
              <p className="text-[11px] text-slate-500">Presentation Mastery</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/dashboard");

            return (
              <Link key={index} href={item.href} prefetch={item.href === "/results" || item.href === "/reports" ? false : undefined}>
                <div
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 rounded-xl
                    ${isActive
                      ? "btn-gradient text-white shadow-glass"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }
                    ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}
                  `}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-white" : "text-slate-500"}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.disabled && (
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Soon</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-white/20">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl transition-all duration-200 shadow-glass hover:shadow-xl transform hover:scale-[1.01]"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
