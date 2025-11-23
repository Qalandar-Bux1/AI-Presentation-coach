export default function Page() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-soft"></div>
      
      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-ai-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-ai-purple rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ai-blue rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Fixed Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 glass border-b border-primary-200/30 shadow-glass">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Brand */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative p-3 btn-gradient rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:glow-cyan">
              <img
                src="/logo1.png"
                alt="AI Presentation Coach logo"
                className="h-10 w-10 relative z-10 object-contain"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 relative">
                <span className="text-gradient">AI Presentation Coach</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Presentation Mastery</p>
            </div>
          </a>

          {/* Center/Left: Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-700 hover:text-slate-900 relative group transition-colors">
              <span>Features</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-ai transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
            <a href="#about" className="text-sm font-medium text-slate-700 hover:text-slate-900 relative group transition-colors">
              <span>About</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-ai transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-700 hover:text-slate-900 relative group transition-colors">
              <span>Contact</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-ai transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
          </div>

          {/* Right: Login */}
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl glass border border-primary-300/50 px-6 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:border-primary-400 hover:shadow-lg transition-all"
            >
              Login
            </a>
            <a
              href="/signup"
              className="hidden sm:inline-flex items-center justify-center rounded-xl btn-gradient px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all transform hover:scale-105"
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Hero with modern gradient */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 glass rounded-2xl shadow-lg">
                <img src="/logo1.png" alt="logo" className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6">
              <span className="text-gradient">
                Enhance Your Presentation Skills with AI
              </span>
            </h1>
            <p className="mt-4 text-xl text-slate-700 leading-relaxed">
              Get instant AI-powered feedback on your tone, body language, confidence, and eye contact — become a confident speaker faster.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl btn-gradient px-8 py-4 text-base font-semibold text-white shadow-xl transition-all transform hover:scale-105"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-xl glass border-2 border-primary-300/50 px-8 py-4 text-base font-semibold text-slate-700 hover:text-slate-900 hover:border-primary-400 hover:shadow-lg transition-all"
              >
                Login
              </a>
            </div>

          </div>
        </div>
      </section>

     {/* Features with modern cards */}
<section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 scroll-mt-20 relative z-10">
  <div className="mx-auto max-w-2xl text-center mb-12">
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="h-1 w-12 bg-gradient-ai rounded-full"></div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-800">Core Features</h2>
      <div className="h-1 w-12 bg-gradient-ai-reverse rounded-full"></div>
    </div>
    <p className="mt-2 text-base text-slate-600">
      Practice smarter with real-time coaching and clear progress tracking.
    </p>
  </div>

  <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {/* Card 1 */}
    <div className="group relative glass rounded-2xl p-8 shadow-glass hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:glow-cyan">
      <div className="p-4 btn-gradient rounded-2xl mb-6 group-hover:scale-110 transition-transform w-fit shadow-lg">
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3zM3 11h12v2H3zM3 17h18v2H3z"/></svg>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">Real-Time Feedback</h3>
      <p className="text-slate-600 leading-relaxed">
        AI analyzes your voice, tone, and facial expression as you speak—giving actionable suggestions you can apply immediately.
      </p>
      <div className="mt-6 h-1 w-20 rounded-full bg-gradient-ai opacity-60 transition group-hover:opacity-100" />
    </div>

    {/* Card 2 */}
    <div className="group relative glass rounded-2xl p-8 shadow-glass hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:glow-purple">
      <div className="p-4 btn-gradient rounded-2xl mb-6 group-hover:scale-110 transition-transform w-fit shadow-lg">
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h4v8H3zM10 9h4v12h-4zM17 3h4v18h-4z"/></svg>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">Progress Dashboard</h3>
      <p className="text-slate-600 leading-relaxed">
        Track improvement with clear charts for confidence, engagement, and performance scores over time.
      </p>
      <div className="mt-6 h-1 w-20 rounded-full bg-gradient-ai-reverse opacity-60 transition group-hover:opacity-100" />
    </div>

    {/* Card 3 */}
    <div className="group relative glass rounded-2xl p-8 shadow-glass hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:glow-pink">
      <div className="p-4 btn-gradient rounded-2xl mb-6 group-hover:scale-110 transition-transform w-fit shadow-lg">
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-9 9a9 9 0 1118 0H3z"/></svg>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">Eye Contact Metrics</h3>
      <p className="text-slate-600 leading-relaxed">
        See how effectively you maintain audience attention through visual focus and expressions.
      </p>
      <div className="mt-6 h-1 w-20 rounded-full bg-gradient-ai opacity-60 transition group-hover:opacity-100" />
    </div>
  </div>
</section>


      {/* Why Choose Us */}
      <section id="about" className="relative overflow-hidden scroll-mt-20">
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 z-10">
          <div className="mx-auto max-w-3xl glass rounded-3xl p-10 shadow-glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-ai rounded-full"></div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-800">Why Choose AI Presentation Coach</h2>
            </div>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Built for students, professionals, and public speakers, this coach turns practice into progress with guidance that's clear, motivating, and tailored to your delivery.
            </p>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Instead of guessing what to fix, you'll know exactly what to improve—so you can speak with confidence and connect with any audience.
            </p>
            <div className="mt-8">
              <a
                href="/signup"
                className="inline-flex rounded-xl btn-gradient px-8 py-4 text-base font-semibold text-white shadow-xl transition-all transform hover:scale-105"
              >
                Start Practicing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Support */}
      <section id="contact" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 scroll-mt-20 relative z-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-ai rounded-full"></div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">Contact & Support</h2>
            <div className="h-1 w-12 bg-gradient-ai-reverse rounded-full"></div>
          </div>
          <p className="mt-4 text-center text-base text-slate-600">
            Questions or feedback? The team is here to help you succeed. Reach out anytime and get friendly, practical guidance.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-1">
            <div className="glass rounded-2xl border border-primary-200/30 p-8 shadow-glass hover:shadow-xl transition-all">
              <p className="text-base font-semibold text-slate-800 mb-2">Email</p>
              <a
                href="mailto:qbux4935@gmail.com"
                className="block text-lg text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
               qbux4935@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-200/30 glass relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="p-2 btn-gradient rounded-xl shadow-lg">
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
