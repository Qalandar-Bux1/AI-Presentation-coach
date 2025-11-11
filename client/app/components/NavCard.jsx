"use client";
import Link from "next/link";

export default function NavCard({ title, description, icon, href }) {
  return (
    <Link
      href={href}
      className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-200 border border-gray-100"
    >
      <div className="flex flex-col gap-3">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex justify-center items-center text-xl">
          {icon}
        </div>

        <h3 className="text-lg font-bold text-gray-800">{title}</h3>

        <p className="text-sm text-gray-500">{description}</p>

        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">
          Open
        </button>
      </div>
    </Link>
  );
}
