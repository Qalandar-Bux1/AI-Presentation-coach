"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  return (
    <div className="py-2 bg-[#0b132b]" id="background">
 {/* Navbar */}
<nav className="fixed w-full z-20 top-0 start-0 bg-gradient-to-r from-[#192841] via-[#1e3358] to-[#253b6e] shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-[#4c6ef5]/30 backdrop-blur-lg">
  <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-6 py-3">
    {/* Logo */}
    <Link href="/" className="flex items-center space-x-3">
      <Image
        src="/logo1.png"
        alt="Logo"
        width={36}
        height={36}
        className="rounded-full"
      />
      <span className="text-2xl font-bold tracking-wide font-poppins bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#3b82f6] bg-clip-text text-transparent">
        AI Presentation Coach
      </span>
    </Link>

    {/* Desktop Menu */}
    <div className="hidden md:flex items-center space-x-10">
      {["Features", "About", "Contact"].map((item, index) => (
        <button
          key={index}
          onClick={() => scrollToSection(item.toLowerCase())}
          className="relative text-gray-100 font-medium tracking-wide transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#a78bfa] hover:to-[#60a5fa]
                     after:content-[''] after:block after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-[#a78bfa] after:to-[#60a5fa] after:transition-all after:duration-300 hover:after:w-full"
          style={{ backgroundColor: "transparent" }}
        >
          {item}
        </button>
      ))}

      {/* Try Demo Button */}
      <Link href="/signup">
        <button className="ml-4 px-6 py-2 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] hover:from-[#4f46e5] hover:to-[#9333ea] rounded-lg text-white font-semibold shadow-lg shadow-[#1e3a8a]/30 transition-transform transform hover:scale-105">
          Try Demo
        </button>
      </Link>
    </div>

    {/* Mobile Menu Button */}
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      type="button"
      className="md:hidden text-gray-300 hover:text-white focus:outline-none"
    >
      <svg
        className="w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
        />
      </svg>
    </button>
  </div>

  {/* Mobile Menu */}
  {menuOpen && (
    <div className="md:hidden bg-[#1c2747]/90 text-center py-4 space-y-3 backdrop-blur-md">
      {["Features", "About", "Contact"].map((item, index) => (
        <button
          key={index}
          onClick={() => scrollToSection(item.toLowerCase())}
          className="block text-gray-100 hover:text-purple-400 font-medium transition"
          style={{ backgroundColor: "transparent" }}
        >
          {item}
        </button>
      ))}
      <Link href="/signup">
        <button className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-white font-semibold transition-transform transform hover:scale-105">
          Try Demo
        </button>
      </Link>
    </div>
  )}
</nav>

      {/* Hero Section */}
      <div className="flex flex-col p-4 gap-y-3 pt-28">
        <section className="h-screen flex items-center justify-center text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl sm:text-6xl font-bold mb-8 font-poppins bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
              Enhance Your Presentation Skills with AI
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-300 font-poppins max-w-3xl mx-auto">
              Get instant AI-powered feedback on your tone, body language,
              confidence, and eye contact — helping you become a confident
              speaker.
            </p>
            <Link href="/signup">
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-white font-semibold text-lg transition">
                Start Practicing
              </button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-16 bg-[#1c2541] text-center text-gray-200"
        >
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Core Features
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 px-8">
            <div className="card max-w-sm bg-[#3a506b] p-6 rounded-2xl shadow-lg hover:scale-105 transition">
              <h3 className="text-2xl font-semibold text-yellow-400 mb-3">
                Real-Time Feedback
              </h3>
              <p className="text-gray-300">
                AI analyzes your voice, tone, and facial expression while you
                speak — giving actionable suggestions.
              </p>
            </div>

            <div className="card max-w-sm bg-[#3a506b] p-6 rounded-2xl shadow-lg hover:scale-105 transition">
              <h3 className="text-2xl font-semibold text-yellow-400 mb-3">
                Progress Dashboard
              </h3>
              <p className="text-gray-300">
                Track your improvement with charts showing confidence,
                engagement, and performance scores.
              </p>
            </div>

            <div className="card max-w-sm bg-[#3a506b] p-6 rounded-2xl shadow-lg hover:scale-105 transition">
              <h3 className="text-2xl font-semibold text-yellow-400 mb-3">
                Eye Contact Metrics
              </h3>
              <p className="text-gray-300">
                Analyze how effectively you maintain audience engagement through
                visual focus and expressions.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="h-screen flex flex-col items-center justify-center text-center text-gray-200 bg-[#0b132b]"
        >
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
            About AI Presentation Coach
          </h2>
          <p className="max-w-2xl text-lg text-gray-400">
            This platform helps users practice and refine their presentation
            skills using advanced AI that tracks voice tone, confidence, and
            audience engagement metrics — ensuring every speaker improves over
            time.
          </p>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="h-screen flex flex-col items-center justify-center text-center bg-[#1c2541] text-gray-200"
        >
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Contact Us
          </h2>
          <p className="text-lg text-gray-400 mb-6">
            Have questions or want to collaborate? Get in touch!
          </p>
          <Link href="/contact">
            <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg text-white font-semibold">
              Get in Touch
            </button>
          </Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#0b132b] text-center py-6 border-t border-gray-700">
        <p className="text-gray-400 text-sm">
          © 2025 AI Presentation Coach. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
