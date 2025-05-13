"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AuthProviderButton from "../../components/AuthProviderButton";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard` // Redirect to dashboard after login
        }
      });
      if (error) throw error;
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send login link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl font-bold text-blue-600 tracking-tight">AutoBooks</div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white text-center mt-2">
            Sign in to AutoBooks
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-center text-base">
            Access your personal and business finances.
          </p>
        </div>
        {!emailSent ? (
          <form className="flex flex-col gap-4" onSubmit={handleMagicLink}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@email.com"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition disabled:opacity-60"
              disabled={loading || !email}
            >
              {loading ? "Sending..." : "Send Login Link"}
            </button>
            <div className="relative flex items-center my-2">
              <span className="flex-grow border-t border-gray-300 dark:border-gray-700" />
              <span className="mx-3 text-gray-400 dark:text-gray-500 text-xs">or</span>
              <span className="flex-grow border-t border-gray-300 dark:border-gray-700" />
            </div>
            <AuthProviderButton supabase={supabase} provider="google" />
            {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
          </form>
        ) : (
          <div className="text-green-600 text-center">
            A login link has been sent to <b>{email}</b>.<br />
            Please check your inbox!
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          By continuing, you agree to our <a href="#" className="underline">Terms of Use</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Sign up now</a>.
        </p>
      </div>
    </div>
  );
}
