"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BarChart2,
  FileText,
  User2,
  Video,
  HelpCircle,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

 const menu = [
  { icon: Home, href: "/dashboard", label: "Home", disabled: false },
  { icon: Video, href: "/session", label: "Session", disabled: false },
  { icon: BarChart2, href: "#", label: "Results", disabled: true },
  { icon: FileText, href: "#", label: "Reports", disabled: true },
  { icon: User2, href: "/profile", label: "Profile", disabled: false },
];


  return (
    <aside className="fixed h-full w-56 bg-[#F8FAFC] border-r border-gray-200 shadow-sm flex flex-col py-6">

      {/* Logo */}
      <div className="px-6 mb-6">
        <Link href="/dashboard">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/logo1.png" alt="logo" className="w-8 h-8" />
            <span className="text-[18px] font-semibold text-gray-800">AI Coach</span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1">
        {menu.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={index} href={item.href}>
              <div
                className={`flex items-center gap-3 px-6 py-3 text-[14px] font-medium cursor-pointer transition-all
                  ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm rounded-r-full"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon size={20} />
                {item.label}
              </div>
            </Link>
          );
        })}

      
      </nav>
    </aside>
  );
} 