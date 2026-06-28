"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginCompanion, createCompanion } from "@/app/auth/actions";

type Tab = "login" | "signup";

function AuthForm() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "signup" ? "signup" : "login");
  const [loading, setLoading]       = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [name, setName]             = useState("");
  const [nameErr, setNameErr]       = useState<string | null>(null);

  function switchTab(next: Tab) {
    setTab(next);
    setServerError(null);
    setNameErr(null);
  }

  function validateName() {
    if (!name.trim()) { setNameErr("Please enter your companion's name."); return false; }
    if (name.trim().length < 2) { setNameErr("Name must be at least 2 characters."); return false; }
    if (tab === "signup" && name.trim().length > 20) { setNameErr("Name can be at most 20 characters."); return false; }
    if (tab === "signup" && !/^[a-zA-Z0-9 _'-]+$/.test(name.trim())) {
      setNameErr("Only letters, numbers, spaces, and - _ ' are allowed.");
      return false;
    }
    setNameErr(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    if (!validateName()) return;

    setLoading(true);
    const formData = new FormData();
    formData.set("name", name.trim());

    const result = tab === "login"
      ? await loginCompanion(formData)
      : await createCompanion(formData);

    setLoading(false);
    if (result?.error) setServerError(result.error);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-teal-50 to-stone-200 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-bounce">✨</div>
          <h1 className="text-4xl font-fancy text-teal-600 mb-1">Daily Quest</h1>
          <p className="text-sm text-stone-500">Your companion adventure awaits</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50">
            <button
              type="button"
              onClick={() => switchTab("login")}
              className={`flex-1 py-3.5 text-sm font-bold tracking-wide transition-all focus:outline-none
                ${tab === "login"
                  ? "bg-white text-teal-600 border-b-2 border-teal-500"
                  : "text-stone-400 hover:text-stone-600"}`}
            >
              🧚 My Companion
            </button>
            <button
              type="button"
              onClick={() => switchTab("signup")}
              className={`flex-1 py-3.5 text-sm font-bold tracking-wide transition-all focus:outline-none
                ${tab === "signup"
                  ? "bg-white text-teal-600 border-b-2 border-teal-500"
                  : "text-stone-400 hover:text-stone-600"}`}
            >
              ✨ New Companion
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-7 space-y-5">

            <div className="text-center text-stone-500 text-sm">
              {tab === "login"
                ? "Enter your companion's name to continue your adventure"
                : "Give your new companion a name to begin"}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">❌</span>
                <span>{serverError}</span>
              </div>
            )}

            {/* Companion Name */}
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-1.5" htmlFor="name">
                Companion Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="off"
                autoFocus
                value={name}
                onChange={(e) => { setName(e.target.value); setNameErr(null); setServerError(null); }}
                placeholder={tab === "login" ? "e.g. Luna, Ember, Sage…" : "Choose a name…"}
                maxLength={20}
                className={`w-full rounded-xl border px-4 py-3 text-sm bg-stone-50 text-stone-800 outline-none transition-all
                  placeholder:text-stone-300
                  focus:bg-white focus:ring-2 focus:ring-teal-300
                  ${nameErr ? "border-red-400 bg-red-50" : "border-stone-200"}`}
              />
              {nameErr && <p className="mt-1.5 text-xs text-red-500">{nameErr}</p>}
              {tab === "signup" && !nameErr && (
                <p className="mt-1.5 text-xs text-stone-400">
                  2–20 characters · letters, numbers, spaces, - _ ' allowed
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-sm
                shadow-md shadow-teal-200 hover:from-teal-600 hover:to-teal-700
                transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "One moment…"
                : tab === "login" ? "Continue Adventure →" : "Begin Adventure ✨"}
            </button>

            {/* Switch tab hint */}
            <p className="text-center text-xs text-stone-400 pt-1">
              {tab === "login" ? (
                <>New here?{" "}
                  <button type="button" onClick={() => switchTab("signup")}
                    className="text-teal-600 font-bold hover:underline">Create a companion</button>
                </>
              ) : (
                <>Already have one?{" "}
                  <button type="button" onClick={() => switchTab("login")}
                    className="text-teal-600 font-bold hover:underline">Find my companion</button>
                </>
              )}
            </p>

          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Secured by Supabase 🔒
        </p>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
