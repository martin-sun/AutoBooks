"use client";
import React, { useState } from "react";
import { Provider, SupabaseClient } from "@supabase/supabase-js";

interface AuthProviderButtonProps {
  supabase: SupabaseClient;
  provider: Provider;
}

export default function AuthProviderButton({ supabase, provider }: AuthProviderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-md transition disabled:opacity-60"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.23 9.19 3.25l6.85-6.85C35.54 2.7 30.13 0 24 0 14.82 0 6.7 5.48 2.69 13.44l7.98 6.19C12.24 13.02 17.66 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.21-.42-4.73H24v9.01h12.46c-.54 2.93-2.18 5.41-4.65 7.09l7.15 5.56C43.99 36.18 46.1 30.82 46.1 24.5z"/><path fill="#FBBC05" d="M10.67 28.17c-1.01-2.97-1.01-6.17 0-9.14l-7.98-6.19C.9 17.72 0 20.76 0 24s.9 6.28 2.69 9.16l7.98-6.19z"/><path fill="#EA4335" d="M24 48c6.13 0 11.54-2.02 15.38-5.49l-7.15-5.56c-2 1.35-4.59 2.15-8.23 2.15-6.34 0-11.76-3.52-14.33-8.62l-7.98 6.19C6.7 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
        {loading ? "Signing in..." : "Sign up with Google"}
      </button>
      {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
    </>
  );
}
