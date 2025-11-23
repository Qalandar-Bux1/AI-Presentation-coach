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
    { icon: Video, href: "/session", label: "Session", disabled: false },
    { icon: Video, href: "/my-videos", label: "My Videos", disabled: false },
    { icon: BarChart2, href: "#", label: "Results", disabled: true },
    { icon: FileText, href: "#", label: "Reports", disabled: true },
    { icon: User2, href: "/profile", label: "Profile", disabled: false },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-primary-200/30 shadow-glass flex flex-col z-40">
      {/* Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-ai"></div>

      {/* Logo Section */}
      <div className="px-6 py-6">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative p-3 btn-gradient rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:glow-cyan">
              <img src="/logo1.png" alt="logo" className="w-10 h-10 relative z-10" />
            </div>
            <div>
              <span className="text-xl font-bold text-gradient">
                AI Coach
              </span>
              <p className="text-xs text-slate-600 group-hover:text-slate-700 transition-colors duration-300">Presentation Mastery</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={index} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-200 rounded-xl
                    ${
                      isActive
                        ? "btn-gradient text-white shadow-lg glow-cyan"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }
                    ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-8 bg-gradient-ai rounded-r-full"></div>
                  )}
                  <Icon 
                    size={20} 
                    className={isActive ? "text-white" : "text-slate-500"}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.disabled && (
                    <span className="text-xs bg-primary-100 px-2 py-0.5 rounded-full text-primary-600">Soon</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="px-4 py-6">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold text-white btn-gradient rounded-xl transition-all duration-300 shadow-lg transform hover:scale-[1.02]"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
