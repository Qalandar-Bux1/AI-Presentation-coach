export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Fixed Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Brand */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative p-3 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:shadow-purple-500/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <img
                src="/logo1.png"
                alt="AI Presentation Coach logo"
                className="h-10 w-10 relative z-10 object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-white relative">
                <span>AI Presentation Coach</span>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400"></div>
              </div>
              <p className="text-xs text-white/60 mt-0.5">Presentation Mastery</p>
            </div>
          </a>

          {/* Center/Left: Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-white relative group">
              <span>Features</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
            <a href="#about" className="text-sm font-medium text-white relative group">
              <span>About</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
            <a href="#contact" className="text-sm font-medium text-white relative group">
              <span>Contact</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
          </div>

          {/* Right: Login */}
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-purple-400/50 bg-purple-500/20 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white hover:bg-purple-500/30 hover:border-purple-400/70 hover:shadow-md transition-all relative group"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
            <a
              href="/signup"
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 transition-all transform hover:scale-105 relative group"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-white/80 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
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
              <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
                <img src="/logo1.png" alt="logo" className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6">
              <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                Enhance Your Presentation Skills with AI
              </span>
            </h1>
            <p className="mt-4 text-xl text-white/80 leading-relaxed">
              Get instant AI-powered feedback on your tone, body language, confidence, and eye contact — become a confident speaker faster.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white hover:bg-white/20 hover:border-white/40 transition-all shadow-md hover:shadow-lg"
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
      <div className="h-1 w-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
      <h2 className="text-3xl font-bold tracking-tight text-white">Core Features</h2>
      <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
    </div>
    <p className="mt-2 text-base text-white/70">
      Practice smarter with real-time coaching and clear progress tracking.
    </p>
  </div>

  <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {/* Card 1 */}
    <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 transform hover:-translate-y-1">
      <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform w-fit">
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3zM3 11h12v2H3zM3 17h18v2H3z"/></svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-3">Real-Time Feedback</h3>
      <p className="text-white/80 leading-relaxed">
        AI analyzes your voice, tone, and facial expression as you speak—giving actionable suggestions you can apply immediately.
      </p>
      <div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-60 transition group-hover:opacity-100" />
    </div>

    {/* Card 2 */}
    <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 transform hover:-translate-y-1">
      <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform w-fit">
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h4v8H3zM10 9h4v12h-4zM17 3h4v18h-4z"/></svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-3">Progress Dashboard</h3>
      <p className="text-white/80 leading-relaxed">
        Track improvement with clear charts for confidence, engagement, and performance scores over time.
      </p>
      <div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-60 transition group-hover:opacity-100" />
    </div>

    {/* Card 3 */}
    <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 transform hover:-translate-y-1">
      <div className="p-4 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform w-fit">
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-9 9a9 9 0 1118 0H3z"/></svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-3">Eye Contact Metrics</h3>
      <p className="text-white/80 leading-relaxed">
        See how effectively you maintain audience attention through visual focus and expressions.
      </p>
      <div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-pink-400 to-red-500 opacity-60 transition group-hover:opacity-100" />
    </div>
  </div>
</section>


      {/* Why Choose Us */}
      <section id="about" className="relative overflow-hidden scroll-mt-20">
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 z-10">
          <div className="mx-auto max-w-3xl bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Why Choose AI Presentation Coach</h2>
            </div>
            <p className="mt-4 text-base text-white/80 leading-relaxed">
              Built for students, professionals, and public speakers, this coach turns practice into progress with guidance that's clear, motivating, and tailored to your delivery.
            </p>
            <p className="mt-4 text-base text-white/80 leading-relaxed">
              Instead of guessing what to fix, you'll know exactly what to improve—so you can speak with confidence and connect with any audience.
            </p>
            <div className="mt-8">
              <a
                href="/signup"
                className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
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
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Contact & Support</h2>
            <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          </div>
          <p className="mt-4 text-center text-base text-white/80">
            Questions or feedback? The team is here to help you succeed. Reach out anytime and get friendly, practical guidance.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg hover:shadow-xl transition-all">
              <p className="text-base font-semibold text-white mb-2">Email</p>
              <a
                href="mailto:qbux4935@gmail.com"
                className="block text-lg text-indigo-300 hover:text-indigo-200 font-medium transition-colors"
              >
               qbux4935@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/5 backdrop-blur-xl relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <img src="/logo1.png" alt="logo" className="h-6 w-6" />
              </div>
              <p className="text-sm text-white/60">© 2025 AI Presentation Coach. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
