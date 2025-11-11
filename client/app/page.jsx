export default function Page() {
  return (
    <main className="bg-white text-gray-900">
      {/* Fixed Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: Logo + Brand */}
          <a href="/" className="flex items-center gap-2">
            <img
              src="/logo1.png"
              alt="AI Presentation Coach logo"
              className="h-8 w-8 rounded-md object-contain"
            />
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              AI Presentation Coach
            </span>
          </a>

          {/* Center/Left: Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-700 hover:text-gray-900">
              Features
            </a>
            <a href="#about" className="text-sm text-gray-700 hover:text-gray-900">
              About
            </a>
            <a href="#contact" className="text-sm text-gray-700 hover:text-gray-900">
              Contact
            </a>
          </div>

          {/* Right: Login */}
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Login
            </a>
            <a
              href="/signup"
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero with light green gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-green-50 to-white" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Enhance Your Presentation Skills with AI
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Get instant AI-powered feedback on your tone, body language, confidence, and eye contact — become a confident speaker faster.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Login
              </a>
            </div>

          </div>
        </div>
      </section>

     {/* Features with 3 elevated green cards */}
<section id="features" className="mx-auto max-w-7xl px-6 py-16 lg:px-8 scroll-mt-20">
  <div className="mx-auto max-w-2xl text-center">
    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Core Features</h2>
    <p className="mt-2 text-sm text-gray-600">
      Practice smarter with real-time coaching and clear progress tracking.
    </p>
  </div>

  <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {/* Card 1 */}
    <div className="group relative rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200">
      {/* subtle gradient glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
           style={{ background: "radial-gradient(800px 200px at 50% 0%, rgba(16,185,129,0.15), transparent 60%)" }} />
      <div className="relative">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 transition group-hover:ring-emerald-300">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3zM3 11h12v2H3zM3 17h18v2H3z"/></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Real-Time Feedback</h3>
        <p className="mt-2 text-sm text-gray-700">
          AI analyzes your voice, tone, and facial expression as you speak—giving actionable suggestions you can apply immediately.
        </p>
        <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 opacity-60 transition group-hover:opacity-100" />
      </div>
    </div>

    {/* Card 2 */}
    <div className="group relative rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200">
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
           style={{ background: "radial-gradient(800px 200px at 50% 0%, rgba(16,185,129,0.15), transparent 60%)" }} />
      <div className="relative">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 transition group-hover:ring-emerald-300">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h4v8H3zM10 9h4v12h-4zM17 3h4v18h-4z"/></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Progress Dashboard</h3>
        <p className="mt-2 text-sm text-gray-700">
          Track improvement with clear charts for confidence, engagement, and performance scores over time.
        </p>
        <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 opacity-60 transition group-hover:opacity-100" />
      </div>
    </div>

    {/* Card 3 */}
    <div className="group relative rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200">
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
           style={{ background: "radial-gradient(800px 200px at 50% 0%, rgba(16,185,129,0.15), transparent 60%)" }} />
      <div className="relative">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 transition group-hover:ring-emerald-300">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-9 9a9 9 0 1118 0H3z"/></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Eye Contact Metrics</h3>
        <p className="mt-2 text-sm text-gray-700">
          See how effectively you maintain audience attention through visual focus and expressions.
        </p>
        <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 opacity-60 transition group-hover:opacity-100" />
      </div>
    </div>
  </div>
</section>


      {/* Why Choose Us */}
      <section id="about" className="bg-emerald-50/50 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Why Choose AI Presentation Coach</h2>
            <p className="mt-3 text-sm text-gray-700">
              Built for students, professionals, and public speakers, this coach turns practice into progress with guidance that’s clear, motivating, and tailored to your delivery.
            </p>
            <p className="mt-3 text-sm text-gray-700">
              Instead of guessing what to fix, you’ll know exactly what to improve—so you can speak with confidence and connect with any audience.
            </p>
            <div className="mt-6">
              <a
                href="/signup"
                className="inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Start Practicing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Support */}
      <section id="contact" className="mx-auto max-w-7xl px-6 py-16 lg:px-8 scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Contact & Support</h2>
          <p className="mt-3 text-sm text-gray-700">
            Questions or feedback? The team is here to help you succeed. Reach out anytime and get friendly, practical guidance.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-900">Email</p>
              <a
                href="mailto:support@aipresentationcoach.com"
                className="mt-1 block text-sm text-indigo-600 hover:underline"
              >
               qbux4935@gmail.com
              </a>
            </div>

           
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-gray-500">© 2025 AI Presentation Coach. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#features" className="text-xs text-gray-500 hover:text-gray-700">
                Features
              </a>
              <a href="#about" className="text-xs text-gray-500 hover:text-gray-700">
                About
              </a>
              <a href="#contact" className="text-xs text-gray-500 hover:text-gray-700">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
