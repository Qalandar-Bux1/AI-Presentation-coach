export default function Page() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#0f3444]/95 to-[#061824]/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative p-2.5 rounded-xl bg-white/10 border border-white/20 group-hover:scale-105 transition-all duration-200 shadow-md group-hover:bg-white/15">
              <img
                src="/logo1.png"
                alt="AI Presentation Coach logo"
                className="h-8 w-8 relative z-10 object-contain"
              />
            </div>
            <div>
              <div className="text-base font-semibold text-white">AI Presentation Coach</div>
              <p className="text-xs text-slate-300">Presentation Mastery</p>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-2 text-[15px] font-medium text-white">
            {[
              ["#features", "Features"],
              ["#about", "About"],
              ["#contact", "Contact"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-md text-white no-underline hover:bg-white/10 hover:text-white transition-all duration-200"
                style={{ color: "#ffffff", textDecoration: "none" }}
              >
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-200"
            >
              Login
            </a>
            <a
              href="/signup"
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-white text-[#0f3444] px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(1200px 500px at 50% 0%, rgba(58,189,248,0.18) 0%, rgba(58,189,248,0) 60%), linear-gradient(180deg, rgba(6,24,36,0.95) 0%, rgba(6,24,36,0.55) 55%, rgba(255,255,255,0) 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=2000')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.18,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#061824]/85 via-[#061824]/65 to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 py-16 lg:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center text-white">
            <div className="flex justify-center mb-6">
              <div
                className="w-fit rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide border border-white/15 bg-white/10 text-slate-100 backdrop-blur-md shadow-sm"
                style={{ boxShadow: "0 10px 24px rgba(6,24,36,0.28)" }}
              >
                AI Presentation Coaching Platform
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl leading-tight">
              Practice smarter and deliver with confidence
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto">
              Get AI-powered analysis for delivery, content, and engagement. Improve every presentation with clear strengths, focus areas, and actionable feedback.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white text-[#0f3444] px-7 py-3 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Free
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-200"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14 lg:px-8 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Core Features</h2>
          <p className="mt-3 text-base text-slate-600">Built specifically for your AI Presentation Coach workflow.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Record & Upload Presentations", "Record sessions live or upload existing videos for analysis.", "REC"],
            ["AI Scoring & Analysis", "Get category-wise scoring for delivery, content, confidence, and engagement.", "AI"],
            ["Results & Feedback Reports", "View clear improvement points and download professional feedback reports.", "PDF"],
          ].map(([title, desc, badge]) => (
            <div key={title} className="group glass rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-0.5 border border-slate-200/80 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-sky-300/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center text-white text-xs font-bold tracking-wide relative" style={{ background: "linear-gradient(135deg,#113a4b 0%,#061824 100%)", boxShadow: "0 10px 22px rgba(6,24,36,0.18)" }}>{badge}</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-6">{desc}</p>
            </div>
          ))}
        </div>
      </section>


      <section id="about" className="relative overflow-hidden scroll-mt-20">
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl glass rounded-3xl p-8 lg:p-10 shadow-glass">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Why teams and students use AI Coach</h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              It turns practice into measurable progress with clear scoring, structured feedback, and repeatable coaching.
            </p>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              You spend less time guessing what went wrong and more time improving the exact skills that matter.
            </p>
            <div className="mt-8">
              <a
                href="/signup"
                className="inline-flex rounded-lg btn-gradient px-6 py-3 text-sm font-semibold text-white shadow-md"
              >
                Start Practicing
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-6 py-14 lg:px-8 scroll-mt-20 relative z-10">
        <div className="mx-auto max-w-3xl glass rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Contact & Support</h2>
          <p className="mt-3 text-base text-slate-600">
            Questions, product feedback, or setup support - we are happy to help.
          </p>
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-500 mb-1">Email</p>
              <a
                href="mailto:qbux4935@gmail.com"
                className="block text-lg text-slate-900 font-semibold hover:text-slate-700 transition-colors"
              >
               qbux4935@gmail.com
              </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/70 bg-white/80 backdrop-blur relative z-10">
        <div className="h-1 w-full bg-gradient-to-r from-[#113a4b] via-[#3abdf8] to-[#061824]" />
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="p-2 btn-gradient rounded-lg shadow-md">
                <img src="/logo1.png" alt="logo" className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-600">© 2025 AI Presentation Coach. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
