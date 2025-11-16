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
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-2xl text-white border-r border-white/20 shadow-2xl flex flex-col z-40">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-900/60 to-purple-900/80 -z-10"></div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>

      {/* Logo Section */}
      <div className="px-6 py-6">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative p-3 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:shadow-purple-500/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              <img src="/logo1.png" alt="logo" className="w-10 h-10 relative z-10 drop-shadow-lg" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent group-hover:from-white group-hover:via-purple-200 group-hover:to-pink-200 transition-all duration-300">
                AI Coach
              </span>
              <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300">Presentation Mastery</p>
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
                        ? "bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white shadow-lg shadow-indigo-500/50"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }
                    ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-white via-indigo-200 to-purple-200 rounded-r-full"></div>
                  )}
                  <Icon 
                    size={20} 
                    className={isActive ? "text-white" : "text-white/60"}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.disabled && (
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50">Soon</span>
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
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-[1.02]"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
