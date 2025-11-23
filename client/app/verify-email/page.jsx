"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailForm() {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const response = await fetch(`${apiUrl}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The link may have expired.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Pattern - matches landing page */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0, 217, 255, 0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Gradient Orbs - matches landing page */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-ai-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-ai-purple rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl shadow-glass p-10 border border-primary-200/30 text-center">
          {status === "verifying" && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 border-4 border-primary-300">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">
                <span className="text-gradient">
                  Verifying Email...
                </span>
              </h1>
              <p className="text-slate-600">Please wait while we verify your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 border-4 border-green-300">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">
                <span className="text-gradient">
                  Email Verified! ✅
                </span>
              </h1>
              <p className="text-slate-700 mb-6 font-medium">{message}</p>
              <p className="text-slate-500 text-sm">Redirecting to login page...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 border-4 border-red-300">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">
                <span className="text-gradient">
                  Verification Failed
                </span>
              </h1>
              <p className="text-slate-700 mb-6 font-medium">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="inline-block w-full btn-gradient text-white rounded-xl py-3 font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                >
                  Go to Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-block w-full glass border-2 border-primary-200/50 hover:shadow-md text-slate-700 rounded-xl py-3 font-semibold transition-all"
                >
                  Sign Up Again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </section>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}

